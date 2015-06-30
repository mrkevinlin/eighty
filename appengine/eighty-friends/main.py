from __future__ import print_function
from flask import Flask, request, render_template, session, redirect, url_for, abort
from google.appengine.api.channel import channel
from simonsays import simon_says
import simonsays
import os, json

app = Flask(__name__, static_url_path='')
app.register_blueprint(simon_says, url_prefix='/simonsays')

app.config['DEBUG'] = True
app.secret_key = os.urandom(24)

app.jinja_env.line_statement_prefix = '#'

@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.route('/game')
def game():
    return app.send_static_file('game.html')

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('notfound.html'), 404

@app.errorhandler(403)
def page_forbidden(e):
    return app.send_static_file('forbidden.html'), 403

@app.route('/_ah/channel/disconnected/', methods=['POST'])
def channel_disconnected():
    service = request.form['from'].split(':')[0]
    if service == 'simonsays':
        return simonsays.channel_disconnected()
    else:
        abort(404)

# vim:expandtab:tabstop=4:shiftwidth=4:softtabstop=4
