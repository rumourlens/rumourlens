from app import app
from flask import jsonify,render_template,json, request
from services import UserServices

@app.route("/users",methods=['GET'])
def getAllUsers():
    users = UserServices.getAllUsers()
    return jsonify(users)


@app.route("/user/getTopUsers",methods=['GET'])
def getTopUsers():
    users = UserServices.getTopUsers(10)
    return jsonify(users)

@app.route("/user/getTotalUsers",methods=['GET'])
def getTotalUsers():
    total, totalNotDeleted = UserServices.getTotalUsers()
    return jsonify({"total": total, "totalNotDeleted": totalNotDeleted})

@app.route("/user/getCreatedByDate",methods=['GET'])
def getCreatedUsersByDate():
    results = UserServices.getCreatedDateHistogram()
    return jsonify({"results": results})

@app.route("/user/getUserFeatureHistory",methods=['GET'])
def getUserFeatureHistory():
    idStr = request.args.get('id')
    field = request.args.get('field')
    id = int(idStr.split('_')[1])
    results = UserServices.getUserFeaturesHistory(id, field)
    return jsonify({"results": results})