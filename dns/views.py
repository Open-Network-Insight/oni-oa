from flask import Blueprint, render_template

blueprint = Blueprint('dns', __name__, template_folder='templates', static_folder='static')

@blueprint.route('/')
@blueprint.route('/index')
def index():
  return render_template('dns/suspicious.html')

@blueprint.route('/story_board')
def story_board():
  return render_template('dns/story_board.html')

@blueprint.route('/threat_investigation')
def threat_investigation():
  return render_template('dns/threat_investigation.html')
