from __future__ import print_function
from flask import Flask, request, render_template, session, redirect, url_for
from google.appengine.api.channel import channel
import os, json

app = Flask(__name__, static_url_path='')
app.config['DEBUG'] = True
app.secret_key = os.urandom(24)


@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/game')
def game():
    return app.send_static_file('game.html')

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('notfound.html')

@app.errorhandler(403)
def page_forbidden(e):
    return app.send_static_file('forbidden.html')

# simon says code
ss_players = 0
current_players = {}
LOGIN_FORM = '''
            <form action="" method="post">
                <p><input type=text name=username>
                <p><input type=submit value=Login>
            </form>
            '''

@app.route('/simonsays', methods=['GET','POST'])
def simon_says():
    global ss_players
    if request.method == 'POST':
        formname = request.form['username']
        if formname in current_players:
            # duplicate, REJECTED
            return 'That username has already been taken<br/>' + LOGIN_FORM
        else:
            session['username'] = formname
            current_players[formname] = {}
            ss_players += 1
            return redirect(url_for('simon_says'))
    if 'username' not in session:
        # ask for signin
        return LOGIN_FORM
    else:
        username = session['username']
        if 'channel_token' not in current_players[username]:
            token = channel.create_channel(username)
            current_players[username]['channel_token'] = token
        return render_template('simonsays.html', players=ss_players,
                token=current_players[username]['channel_token'],
                usernames=', '.join([x for x in current_players]))

@app.route('/simonsays/logoff')
def ss_logoff(username=None):
    global ss_players
    name = session.pop('username', None) or username
    if name:
        ss_players -= 1
        current_players.pop(name, None)
    return redirect(url_for('simon_says'))

@app.route('/simonsays/requestupdate')
def ss_request_update():
    user = current_players[session['username']]
    if not user['channel_token']:
        abort(404)
    update_category = request.args['category']
    message = {'category': update_category}
    if update_category == 'players':
        message['player_count'] = ss_players
        message['player_names'] = current_players.keys()
        for player in current_players:
            channel.send_message(current_players[player]['channel_token'], json.dumps(message))
    else:
        abort(404)
    return ('', 204)

@app.route('/_ah/channel/disconnected/', methods=['POST'])
def channel_disconnected():
    # client_id is currently set to username, but that could change in the
    # future
    client_id = request.form['from']
    return ss_logoff(username=client_id)
