from __future__ import print_function
from flask import (Blueprint, request, render_template, session, redirect,
    url_for, flash, abort)
from google.appengine.api.channel import channel
import os, json

simon_says = Blueprint('simonsays', __name__)

ss_players = 0
current_players = {}

@simon_says.route('', methods=['GET','POST'])
def game():
    if 'username' not in session:
        return redirect(url_for('.login'))
    else:
        username = session['username']
        if 'channel_token' not in current_players[username]:
            # scheme I'd like to follow for client ID is service:username
            token = channel.create_channel('simonsays:' + username)
            current_players[username]['channel_token'] = token
        return render_template('simonsays.html', players=ss_players,
                token=current_players[username]['channel_token'],
                usernames=', '.join([x for x in current_players]))

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
            current_players[formname] = {}
            global ss_players
            ss_players += 1
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
    ss_players -= 1
    client_id = request.form['from']
    return logoff(username=client_id.split(':')[-1])

@simon_says.route('/requestupdate')
def request_update():
    user = current_players[session['username']]
    if not user['channel_token']:
        abort(404)
    update_category = request.args['category']
    send_channel_update(update_category)
    return ('', 204)

def send_channel_update(category):
    message = {'category': category}
    if category == 'players':
        message['player_count'] = ss_players
        message['player_names'] = current_players.keys()
        for player in current_players:
            channel.send_message(current_players[player]['channel_token'], json.dumps(message))
    else:
        abort(404)

