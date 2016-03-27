from flask import Blueprint, render_template

blueprint = Blueprint('flows', __name__, template_folder='templates', static_folder='static')

@blueprint.route('/')
@blueprint.route('/index')
def index():
  return render_template('flows/index.html')

