from __future__ import print_function
from flask import Flask, request, render_template, session, redirect, url_for
from google.appengine.api.channel import channel
import uuid

app = Flask(__name__, static_url_path='')
app.config['DEBUG'] = True
# DON'T COMMIT THIS
app.secret_key = '\x97c\xf3\xcb0\x98WaGS\xcb\xbf\xaesX\x0e\x7f{\xeaK\xb6\xbaaU'

my_uuid = unicode(uuid.uuid4())
token = None
ss_token = None


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
current_players = []
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
            current_players.append(formname)
            ss_players += 1
            return redirect(url_for('simon_says'))
    if 'username' not in session:
        # ask for signin
        return LOGIN_FORM
    else:
        global ss_token
        if not ss_token:
            ss_token = start_simon_says()
        return render_template('simonsays.html', players=ss_players,
                token=ss_token, username=session['username'])

def start_simon_says():
    return channel.create_channel(my_uuid)

@app.route('/simonsays/logoff')
def ss_logoff():
    global ss_players
    name = session.pop('username', None)
    if name:
        ss_players -= 1
    return redirect(url_for('simon_says'))

@app.route('/simonsays/requestupdate')
def ss_request_update():
    update_requested = request.args['category']
    if update_requested == 'players':
        channel.send_message(ss_token, str(ss_players))
    else:
        abort(404)
    return ('', 204)

