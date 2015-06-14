from flask import Flask, request

app = Flask(__name__, static_url_path='')
app.config['DEBUG'] = False


@app.route('/')
def home():
    return app.send_static_file('index.html')

@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('notfound.html')
