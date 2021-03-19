
class AppConfig(object):
    PRODUCTION = False
    JSON_AS_ASCII = False
    UPLOAD_FOLDER = "./static/data/"
    SECRET_KEY='super secret key'
    SQLALCHEMY_ECHO = False

database_uri = 'postgresql://{dbuser}:{dbpass}@{dbhost}/{dbname}'.format(
    dbuser='rumourlens',
    dbpass='rumourlens2@21',
    dbhost='localhost',
    dbname= 'rumourlens'
)