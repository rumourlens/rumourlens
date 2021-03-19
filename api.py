from routes import *
from app import app
from flask_cors import CORS, cross_origin
# from mongoengine import connect

if __name__ == '__main__':
    CORS(app)
    # connect('FakeNews',host='mongodb://localhost:27017/')
    app.config['JSON_AS_ASCII'] = False
    app.run(host='0.0.0.0', debug=True, threaded=True, port=8888)
