from flask import Flask, request

app = Flask(__name__, static_url_path='')
app.config['DEBUG'] = False

#from oauth2client import client, crypt
CLIENT_ID = "256313654719-omu1i4n9m8rvd7fbpfgqk8p110cqbh2m.apps.googleusercontent.com"


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
    print request.form
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

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('notfound.html')

@app.errorhandler(403)
def page_forbidden(e):
    return app.send_static_file('forbidden.html')
