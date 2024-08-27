from flask import Blueprint, request

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/', methods=['GET'])
def index():
    return {'hello': 'world!'}, 200


@api.route('/node', methods=['POST'])
def add_nodes():
    data = request.get_json()
    print(data)
    return {}, 201


def init_app(app):
    app.register_blueprint(api)
