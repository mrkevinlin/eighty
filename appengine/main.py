from flask import Flask, request, render_template
from google.appengine.api.channel import channel
import uuid

app = Flask(__name__, static_url_path='')
app.config['DEBUG'] = False

my_uuid = unicode(uuid.uuid4())
token = None


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

@app.route('/channel')
def channel_test():
    global token
    token = channel.create_channel(my_uuid)
    return render_template('channeltest.html', token=token)

@app.route('/taketurn')
def sendmessage():
    if token:
        channel.send_message(token, 'Token is set to ' + token)
    return 'channel communication!'

