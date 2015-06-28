from __future__ import print_function
from flask import (Blueprint, request, render_template, session, redirect,
    url_for, flash, abort, g, jsonify)
from google.appengine.api.channel import channel
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
                    game_ent.put()
                    send_channel_update('leader', [game_ent.leader])
                    send_channel_update('follower', [x for x in player_names if x not in [game_ent.leader, username]])
                template_dict['leader'] = game_ent.leader
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
            new_player_key = Player(name=formname, id=formname).put()
            game_ent = get_current_game()
            game_ent.players.append(new_player_key)
            game_ent.put()
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
            game_ent.put()
            player_key.delete()
    send_channel_update('players')
    return redirect(url_for('.game'))

def channel_disconnected():
    client_id = request.form['from']
    return logoff(username=client_id.split(':')[-1])

@simon_says.route('/submit', methods=['POST'])
def submit():
    game = get_current_game()
    sequence = map(int, request.form.getlist('sequence[]'))
    g.sequence = sequence
    if session['username'] == game.leader:
        game.sequence = g.sequence
        game.put()
        send_channel_update('copysequence', [x.name for x in ndb.get_multi(game.players) if x.name != game.leader])
        return jsonify(message='Waiting on other players to copy your sequence',
                        result='none')
    else:
        if sequence == game.sequence:
            return jsonify(message='Very good! Wait for the next round.',
                            result='match')
            #send_channel_update('sequencematch', [session['username']])
        else:
            return jsonify(message='You got it wrong :( oh well',
                            result='mismatch')
            #send_channel_update('sequencemismatch', [session['username']])
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
    elif category == 'leader':
        message['sequence_length'] = game_ent.sequence_length
    elif category == 'follower':
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

# TODO: consider combining all game_ent.put() calls into a teardown function
def get_current_game():
    if 'game_entity' not in g:
        game = GAME_KEY.get()
        g.game_entity = game
    return g.game_entity
