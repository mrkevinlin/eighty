from __future__ import print_function
from flask import (Blueprint, request, render_template, session, redirect,
    url_for, flash, abort, g, jsonify)
from google.appengine.api.channel import channel
from google.appengine.ext import deferred
from google.appengine.ext import ndb
import os, json, random
from simonsays_models import Game
from simonsays_models import Player

simon_says = Blueprint('simonsays', __name__)

# just one game, its name and id are both 'default'
GAME_KEY = Game.get_or_insert('default', id='default', name='default').key

@simon_says.route('', methods=['GET','POST'])
def game():
    if 'username' not in session or not Player.get_by_id(session['username']):
        return redirect(url_for('.login'))
    else:
        game_ent = get_current_game()
        player_names = [x.name for x in ndb.get_multi(game_ent.players)]
        template_dict = {'player_count': len(game_ent.players)}
        username = session['username']
        current_player = Player.get_by_id(username)
        if current_player.channel_token is None:
            # this is a new player
            # scheme I'd like to follow for client ID is service:username
            token = channel.create_channel('simonsays:' + username)
            current_player.channel_token = token
            current_player.put()
            if len(game_ent.players) > 1:
                if not game_ent.started:
                    # now we're ready to start the game
                    game_ent.started = True
                    game_ent.leader = random.choice([x for x in player_names if x != username])
                    send_channel_update('leader', [game_ent.leader])
                    send_channel_update('follower', [x for x in player_names if x not in [game_ent.leader, username]])
                template_dict['leader'] = game_ent.leader
        template_dict['game_round'] = game_ent.round_
        template_dict['token'] = current_player.channel_token
        template_dict['usernames'] =', '.join(player_names)
        return render_template('simonsays.html', **template_dict)

@simon_says.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST' and 'username' in request.form:
        formname = unicode(request.form['username'])
        if not formname:
            flash(u'Invalid username entered')
            return redirect(url_for('.login'))
        elif Player.get_by_id(formname):
            flash(u'That username has already been taken')
            return redirect(url_for('.login'))
        else:
            session['username'] = formname
            session['score'] = 0
            session['played_this_round'] = False
            new_player_key = Player(name=formname, id=formname).put()
            game_ent = get_current_game()
            game_ent.players.append(new_player_key)
            send_channel_update('players')
            return redirect(url_for('.game'))
    return render_template('login.html')

@simon_says.route('/logoff')
def logoff(username=None):
    name = session.pop('username', None) or username
    if name:
        player_ent = Player.get_by_id(name)
        if player_ent:
            player_key = player_ent.key
            game_ent = get_current_game()
            game_ent.players.remove(player_key)
            if len(game_ent.players) == 0:
                # TODO: this is really just for testing purposes, remove later
                game_ent.started = False
                game_ent.round_ = 1
                game_ent.sequence_length = 3
            player_key.delete()
        send_channel_update('players')
    return redirect(url_for('.game'))

def channel_disconnected():
    abort(404)
    client_id = request.form['from']
    return logoff(username=client_id.split(':')[-1])

def start_round():
    game = get_current_game()
    player_names = [x.name for x in ndb.get_multi(game.players)]
    game.players_played = 0
    game.leader = random.choice([x for x in player_names if x != game.leader])
    game.sequence = []
    game.sequence_length += 1
    game.round_ += 1
    players = ndb.get_multi(game.players)
    for player in players:
        player.played_this_round = False
    ndb.put_multi(players)
    send_channel_update('leader', [game.leader])
    send_channel_update('follower', [x for x in player_names if x != game.leader])
    game.put()

@simon_says.route('/submit', methods=['POST'])
def submit():
    game = get_current_game()
    player = Player.get_by_id(session['username'])
    sequence = map(int, request.form.getlist('sequence[]'))
    g.sequence = sequence
    if not player.played_this_round:
        json_result = None
        player.played_this_round = True
        player.put()
        game.players_played += 1
        if session['username'] == game.leader:
            game.sequence = g.sequence
            session['score'] += 1
            send_channel_update('copysequence', [x.name for x in ndb.get_multi(game.players) if x.name != game.leader])
            json_result = jsonify(message='Waiting on other players to copy your sequence',
                                    result='leader')
        else:
            if sequence == game.sequence:
                json_result = jsonify(message='Very good! Wait for the next round.',
                                        result='match')
                session['score'] += 1
                #send_channel_update('sequencematch', [session['username']])
            else:
                json_result = jsonify(message='You got it wrong :( oh well',
                                        result='mismatch')
                #send_channel_update('sequencemismatch', [session['username']])
        if game.players_played == len(game.players):
            # next round!
            deferred.defer(start_round, _countdown=3)
        return json_result
    return '', 204

"""
@simon_says.route('/requestupdate')
def request_update():
    user = current_players[session['username']]
    if not user['channel_token']:
        abort(404)
    update_category = request.args['category']
    send_channel_update(update_category, [session['username']])
    return ('', 204)
"""

def send_channel_update(category, clients=None):
    game_ent = get_current_game()
    players = [x for x in ndb.get_multi(game_ent.players)]
    player_names = [x.name for x in players]
    recipients = player_names if clients is None else clients
    message = {'category': category}
    if category == 'players':
        message['player_count'] = len(player_names)
        message['player_names'] = player_names
        # always tell everyone about 'players' updates
        recipients = player_names
    # TODO: consider making a separate 'nextround' event
    elif category == 'leader' or category == 'follower':
        # handle common data first
        message['round'] = game_ent.round_
        message['sequence_length'] = game_ent.sequence_length
        if category == 'follower':
            message['leader'] = game_ent.leader
    elif category == 'copysequence':
        message['sequence'] = g.sequence
    elif category == 'sequencematch':
        pass
    elif category == 'sequencemismatch':
        pass
    else:
        abort(404)
    # slow, doing lots of membership testing
    channels_to_send = [x.channel_token for x in players if x.name in
            recipients and x.channel_token]
    for channel_token in channels_to_send:
        channel.send_message(channel_token, json.dumps(message))

def get_current_game():
    if g:
        if 'game_entity' not in g:
            g.game_entity = GAME_KEY.get()
        return g.game_entity
    else:
        return GAME_KEY.get()

@simon_says.teardown_request
def put_game(exception):
    # only call put() if the game is in g, meaning it was accessed during this request
    # might be able to use the modified property to more easily check
    if g and 'game_entity' in g and not exception:
        g.game_entity.put()
        print('game written')

@simon_says.route('/resetdb', methods=['POST'])
def reset_db():
    from google.appengine.api import memcache

    ndb.delete_multi(Game.query().iter(keys_only=True))
    ndb.delete_multi(Player.query().iter(keys_only=True))
    memcache.flush_all()
    ndb.get_context().flush()
    ndb.get_context().clear_cache()
    return '', 204

# vim:expandtab:tabstop=4:shiftwidth=4:softtabstop=4
