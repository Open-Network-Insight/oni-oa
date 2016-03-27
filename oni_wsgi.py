from flask import Flask, json

from api import blueprint as api_blueprint
from dns import blueprint as dns_blueprint
from flask.ext.cors import CORS

################
# App settings #
################
APPLICATION_ROOT = '/app'

####################
# Create Flask app #
####################
app = Flask(__name__, static_url_path=APPLICATION_ROOT + '/static')

# Register modules

# API
app.register_blueprint(api_blueprint, url_prefix=APPLICATION_ROOT + '/api')
app.config.update(json.load(open('api/config/config.json')))

# Allow cross origin requuests on API
cors = CORS(app, resources={APPLICATION_ROOT + r'/api/*': {'origins': '*'}})

# DNS
app.register_blueprint(dns_blueprint, url_prefix=APPLICATION_ROOT + '/dns')

######################
# Load Configuration #
######################

# Load default configuration
app.config.from_object(__name__)

# Load user overrides
app.config.from_pyfile('config.settings.py', silent=True)
