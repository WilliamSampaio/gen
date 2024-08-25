from flask import Blueprint, render_template

web = Blueprint(
    'web', __name__, template_folder='pages', static_folder='assets'
)


@web.route('/')
def index():
    return render_template('index.html')


def init_app(app):
    app.register_blueprint(web)
