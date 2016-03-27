
import os
from flask import Flask, abort, request, jsonify, g, url_for, session
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.httpauth import HTTPBasicAuth
from flask.ext.cors import CORS, cross_origin
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import (TimedJSONWebSignatureSerializer
                          as Serializer, BadSignature, SignatureExpired)
from auth import generate_token

# initialization
app = Flask(__name__)
CORS(app, resources={r'/api/v1/*': {"origins": "*"}}, allow_headers="Content-Type")
app.config['SECRET_KEY'] = 'MjQ4LDE4OCwzNCwxNDQsMTk3LDEyMywxMTYsMTUzLDEsMTY3'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['CORS_HEADERS'] = 'Content-Type'

# extensions
db = SQLAlchemy(app)
auth = HTTPBasicAuth()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(32), index=True)
    password_hash = db.Column(db.String(64))

    def hash_password(self, password):
        self.password_hash = pwd_context.encrypt(password)

    def verify_password(self, password):
        return pwd_context.verify(password, self.password_hash)


    @staticmethod
    def verify_auth_token(token):
        s = Serializer(app.config['SECRET_KEY'])
        try:
            data = s.loads(token)
        except SignatureExpired:
            return None    # valid token, but expired
        except BadSignature:
            return None    # invalid token
        user = User.query.get(data['id'])
        return user

 
    @staticmethod
    def login(username=None, password=None):          
        user = User.query.filter_by(username=username).first()
        # import pdb; pdb.set_trace()
        if not user or not user.verify_password(password):
            return "" #Invalid user or password", 400  
        return generate_token({"userid": user.username})
 

 
@app.route('/api/v1/token')
def get_auth_token():
    token = g.user.generate_auth_token(600)
    return jsonify({'token': token.decode('ascii'), 'duration': 600})



@auth.verify_password
def verify_password(username_or_token, password):
    # first try to authenticate by token
    user = User.verify_auth_token(username_or_token)
    if not user:
        # try to authenticate with username/password
        user = User.query.filter_by(username=username_or_token).first()
        if not user or not user.verify_password(password):
            return False
    g.user = user
    return True
	



@app.route('/api/v1/logout')
def logout():
    session.pop('logged_in', None)
    return jsonify({'result': 'LOGGEDOFF'})

@app.route('/api/v1/verify_token', methods=['POST'])
def verify_token():
    token = request.json.get('token')
    user = User.verify_auth_token(token)
    status = {"result":True}
    if not user:
        status["result"] = False
        status["details"] = "Invalid Auth Token."
    return jsonify(status)

@app.route('/api/v1/users', methods=['POST'])
def create_user():
    username = request.json.get('username')
    password = request.json.get('password')
    if username is None or password is None:
        abort(400)    # missing arguments
    if User.query.filter_by(username=username).first() is not None:
        abort(400)    # existing user
    user = User(username=username)
    user.hash_password(password)
    db.session.add(user)
    db.session.commit()
    return (jsonify({'username': user.username}), 201,
            {'Location': url_for('get_user', id=user.id, _external=True)})


@app.route('/api/v1/users/<int:id>')
def get_user(id):
    user = User.query.get(id)
    if not user:
        abort(400)
    return jsonify({'username': user.username})
 

if __name__ == '__main__':
    if not os.path.exists('db.sqlite'):
        db.create_all()
    app.run(debug=True)
