from flask import Flask
from flask_cors import CORS

from gen.server.blueprints import api, web

app = Flask(__name__)

CORS(app)


@app.route('/online')
def hello_world():
    return {}, 200


web.init_app(app)
api.init_app(app)
