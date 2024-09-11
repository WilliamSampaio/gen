import base64
from datetime import date
from io import BytesIO

import pytesseract
from flask import Blueprint, request
from PIL import Image

from gen import database as db
from gen.database import (
    add_maternal_filiation,
    add_paternal_filiation,
    add_root,
    add_tree_node,
    get_tree_node,
    update_tree_node,
)
from gen.database.entities import TreeNode

api = Blueprint('api', __name__, url_prefix='/api')


@api.route('/', methods=['GET'])
def index():
    return {'hello': 'world!'}, 200


@api.route('/node', methods=['POST'])
def add_nodes():
    data = request.get_json()
    for node in data:
        if 'id' not in node:
            print(node)
            print()
            continue
        tree_node = get_tree_node(node['id'])
        if tree_node is None:
            tree_node = TreeNode()
            tree_node.id = node['id']
            tree_node.name = node['name']
            tree_node.gender = node['gender'] if 'gender' in node else ''
            years = treats_years(node['years'])
            if years[0] is not None:
                tree_node.born_in = date(year=years[0], month=1, day=1)
            if years[1] is not None:
                tree_node.died_in = date(year=years[1], month=1, day=1)
            add_tree_node(tree_node)
            if node['is_root'] is True:
                add_root(node['id'])
            if 'father_id' in node:
                add_paternal_filiation(node['father_id'], node['id'])
            if 'mother_id' in node:
                add_maternal_filiation(node['mother_id'], node['id'])
                print(node['id'], node['name'])
        else:
            update = {}
            if node['id'] == data[0]['id']:
                update[TreeNode.scraped] = True
            if len(data) == 1:
                update[TreeNode.leaf] = True
            if bool(update):
                update_tree_node(tree_node.id, update)
                print('(UPDATE)', node['id'], node['name'])
    return {}, 201


@api.route('/roots')
def get_roots():
    data = db.get_roots()
    return data, 200


@api.route('/leaves')
def get_leaves():
    data = db.get_leaves()
    return data, 200


@api.route('/image', methods=['POST'])
def scan_doc():
    data = request.get_json()
    image = Image.open(
        BytesIO(base64.b64decode(data['base64']))
    )
    # image.save('teste.jpg')
    text = pytesseract.image_to_string(image)
    print(text)


def init_app(app):
    app.register_blueprint(api)


def treats_years(years: str):
    try:
        born = int(years[:4])
    except ValueError:
        born = None
    try:
        died = int(years[-4:])
    except ValueError:
        died = None
    return (born, died)
