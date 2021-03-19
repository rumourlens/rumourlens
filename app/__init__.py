from flask import Flask, render_template, request
from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from app.config import AppConfig
from app.config import database_uri

UPLOAD_FOLDER = "../static/"
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif','json'}
class ConfigClass(object):
    """ Flask application config """

    # Flask settings
    SECRET_KEY = 'This is an INSECURE secret!! DO NOT use this in production!!'

    # Flask-SQLAlchemy settings
    # 'sqlite:///basic_app.sqlite'    # File-based SQL database
    SQLALCHEMY_DATABASE_URI = database_uri
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Shown in and email templates and page footers
    USER_APP_NAME = "Flask-User QuickStart App"
    USER_ENABLE_EMAIL = False      # Disable email authentication
    USER_ENABLE_USERNAME = True    # Enable username authentication
    USER_REQUIRE_RETYPE_PASSWORD = True    # Simplify register form

    UPLOAD_FOLDER = UPLOAD_FOLDER
    JSON_AS_ASCII = False

app = Flask(__name__,template_folder='../templates',static_folder="../static/")
### QUEUE POOL ERROR POSSIBLE SOLUTIONS ###
app.config['SQLALCHEMY_POOL_SIZE'] = 200
app.config['PRESERVE_CONTEXT_ON_EXCEPTION'] = False
### QUEUE POOL ERROR POSSIBLE SOLUTIONS ###
app.config.from_object(__name__+'.ConfigClass')
db = SQLAlchemy(app)

ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif','json'}

@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.close()