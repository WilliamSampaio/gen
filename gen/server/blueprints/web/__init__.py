from flask import Blueprint, render_template, request

from gen.database import get_roots

web = Blueprint(
    'web', __name__, template_folder='pages', static_folder='assets'
)


@web.route('/')
def index():
    root_id = request.args.get('root')
    print(root_id)
    roots = get_roots()
    return render_template('index.html', data={'roots': roots})


def init_app(app):
    app.register_blueprint(web)
