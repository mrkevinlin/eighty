from __future__ import print_function
from flask import Flask, request, render_template, session, redirect, url_for
from google.appengine.api.channel import channel
from simonsays import simon_says
import os, json

app = Flask(__name__, static_url_path='')
app.config['DEBUG'] = True
app.secret_key = os.urandom(24)

app.register_blueprint(simon_says)


@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/game')
def game():
    return app.send_static_file('game.html')

@app.route('/game/user', methods = ['POST'])
def user_request():
	print request.values
	return ""

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('notfound.html')

@app.errorhandler(403)
def page_forbidden(e):
    return app.send_static_file('forbidden.html')

