from __future__ import print_function
from flask import Flask, request, render_template, session, redirect, url_for
from google.appengine.api.channel import channel
from simonsays import simon_says
import simonsays
import os, json
#from oauth2client import client, crypt
CLIENT_ID = "256313654719-omu1i4n9m8rvd7fbpfgqk8p110cqbh2m.apps.googleusercontent.com"

app = Flask(__name__, static_url_path='')
app.register_blueprint(simon_says, url_prefix='/simonsays')

app.config['DEBUG'] = True
app.secret_key = os.urandom(24)



@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/game')
def game():
    return app.send_static_file('game.html')

@app.route('/game/user', methods = ['POST'])
def user_request():
    action = request.form['action']
    user_id = request.form['userId']
    print(request.form)
#    if action == "connect":
#        try:
#            id_info = client.verify_id_token(token, CLIENT_ID)
#            if id_info['aud'] != CLIENT_ID:
#                raise crypt.AppIdentityError("Unrecognized client.")
#            if id_info['iss'] != "https://accounts.google.com":
#                raise crypt.AppIdentityError("Wrong issuer.")
#        except crypt.AppIdentityError:
#            return AppIdentityError.message
    return "Success."

@app.route('/gpg')
def gpg():
    return app.send_static_file('gpg.html')

@app.route('/gpg/user', methods = ['POST'])
def gpg_user_request():
    print(request.form)
    return ""

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('notfound.html')

@app.errorhandler(403)
def page_forbidden(e):
    return app.send_static_file('forbidden.html')

@app.route('/_ah/channel/disconnected/', methods=['POST'])
def channel_disconnected():
    service = request.form['from'].split(':')[0]
    if service == 'simonsays':
        return simonsays.channel_disconnected()
    else:
        abort(404)
