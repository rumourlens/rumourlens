from app import app
from flask import jsonify,render_template,json
from services import TweetsServices

@app.route("/tweets",methods=['GET'])
def getAllTweets():
    tweets = TweetsServices.getAllTweets()
    return jsonify(tweets)

@app.route("/tweet/getTopTweets",methods=['GET'])
def getTopTweets():
    tweets = TweetsServices.getTopTweets(10)
    return jsonify(tweets)

@app.route("/tweet/getTotalTweets",methods=['GET'])
def getTotalTweets():
    total, totalNotDeleted = TweetsServices.getTotalTweets()
    return jsonify({"total": total, "totalNotDeleted": totalNotDeleted})


@app.route("/tweet/getCreatedByDate",methods=['GET'])
def getCreatedTweetsByDate():
    results = TweetsServices.getCreatedDateHistogram()
    return jsonify({"results": results})
