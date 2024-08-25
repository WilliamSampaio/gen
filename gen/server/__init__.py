from flask import Flask

from gen.server.blueprints import web

app = Flask(__name__)


@app.route('/online')
def hello_world():
    return {}, 200


web.init_app(app)
