from app import app
from flask import jsonify,render_template,json,request
from services import HashtagsServices

@app.route("/hashtag/getTopHashtags",methods=['GET'])
def getTopHashtags():
    hashtags = HashtagsServices.getTopHashtags(10)
    return jsonify(hashtags)

@app.route("/hashtag/getTotalHashtags",methods=['GET'])
def getTotalHashtags():
    total, totalNotDeleted = HashtagsServices.getTotalHashtags()
    return jsonify({"total": total, "totalNotDeleted": totalNotDeleted})


@app.route("/hashtag/getUsageHistory",methods=['GET'])
def getHashtagUsageHistory():
    idStr = request.args.get('id')
    results = HashtagsServices.getHasgtagUsages(idStr)
    return jsonify({"results": results})