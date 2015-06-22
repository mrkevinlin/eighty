from __future__ import print_function
from flask import (Blueprint, request, render_template, session, redirect,
    url_for, flash, abort)
from google.appengine.api.channel import channel
import os, json, random


simon_says = Blueprint('simonsays', __name__)

ss_players = 0
current_players = {}
cp_keys = current_players.viewkeys()
sequence_length = 3
leader = ''
game_started = False

@simon_says.route('', methods=['GET','POST'])
def game():
    if 'username' not in session:
        return redirect(url_for('.login'))
    else:
        template_dict = {'players': ss_players}
        username = session['username']
        if 'channel_token' not in current_players[username]:
            # this is a new player
            # scheme I'd like to follow for client ID is service:username
            token = channel.create_channel('simonsays:' + username)
            current_players[username]['channel_token'] = token
            global game_started, leader
            if len(current_players) > 1 and not game_started:
                # now we're ready to start the game
                game_started = True
                leader = random.choice([x for x in cp_keys if x != username])
                template_dict['leader'] = leader
                send_channel_update('leader', [leader])
                print([x for x in cp_keys if x not in [leader, username]])
                send_channel_update('follower', [x for x in cp_keys if x not in [leader, username]])
        template_dict['token'] = current_players[username]['channel_token']
        template_dict['usernames'] =', '.join([x for x in current_players])
        return render_template('simonsays.html', **template_dict)

@simon_says.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST' and 'username' in request.form:
        formname = unicode(request.form['username'])
        if formname in current_players:
            flash('That username has already been taken')
            return redirect(url_for('.login'))
        elif not formname:
            flash('Invalid username entered')
            return redirect(url_for('.login'))
        else:
            session['username'] = formname
            session['score'] = 0
            current_players[formname] = {}
            global ss_players
            ss_players += 1
            send_channel_update('players')
            return redirect(url_for('.game'))
    return render_template('login.html')

@simon_says.route('/logoff')
def logoff(username=None):
    name = session.pop('username', None) or username
    if name:
        current_players.pop(name, None)
    send_channel_update('players')
    return redirect(url_for('.game'))

def channel_disconnected():
    global ss_players
    ss_players = max(0, ss_players - 1)
    client_id = request.form['from']
    return logoff(username=client_id.split(':')[-1])

@simon_says.route('/requestupdate')
def request_update():
    user = current_players[session['username']]
    if not user['channel_token']:
        abort(404)
    update_category = request.args['category']
    send_channel_update(update_category, [session['username']])
    return ('', 204)

def send_channel_update(category, clients=None):
    recipients = cp_keys if clients is None else clients
    message = {'category': category}
    if category == 'players':
        message['player_count'] = ss_players
        message['player_names'] = current_players.keys()
        # always tell everyone about 'players' updates
        recipients = cp_keys
    elif category == 'leader':
        message['sequence_length'] = sequence_length
    elif category == 'follower':
        global leader
        message['leader'] = leader
    else:
        abort(404)

    for player in recipients:
        if 'channel_token' in current_players[player]:
            channel.send_message(current_players[player]['channel_token'], json.dumps(message))

