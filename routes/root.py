from app import app
from flask import jsonify,render_template,json,request
from services import TweetsServices, UserServices, HashtagsServices, LinksServices
from datetime import datetime
import math

@app.route("/",methods=['GET'])
def getDashboard():
    return render_template("home.html")

@app.route("/entity/getWholeGraph",methods=['GET'])
def getWholeGraph():
    users = UserServices.getSimpleUsers()
    tweets = TweetsServices.getSimpleTweets()
    links = LinksServices.getSimpleLinks()
    hashtags = HashtagsServices.getSimpleHashtags()
    hashtagTweets = HashtagsServices.getHashtagTweets()
    linkTweets = LinksServices.getLinkTweets()
    nodes = []
    edges = []
    nodes.extend(users)
    nodes.extend(tweets)
    nodes.extend(links)
    nodes.extend(hashtags)
    for tweet in tweets:
        link = {"source": tweet["user_id"], "target": tweet["id"], "interval": tweet["interval"], "score": tweet["score"]}
        edges.append(link)
    for li in linkTweets:
        link = {"source": li["tweet_id"], "target": li["link_id"], "interval": li["interval"], "score": li["score"]}
        edges.append(link)
    for hashtag in hashtagTweets:
        link = {"source": hashtag["tweet_id"], "target": hashtag["hashtag_id"], "interval": hashtag["interval"], "score": hashtag["score"]}
        edges.append(link)
    return jsonify({"nodes": nodes, "links": edges})


@app.route("/entity/getClosestAnomalies",methods=['GET'])
def getClosestAnomalies():
    idStr = request.args.get('id')
    alpha = float(request.args.get('alpha'))
    id = int(idStr.split('_')[1])
    results = []
    if "t" in idStr:
        results = TweetsServices.getClosestAnomaliesByTweet(id)
    if 'u' in idStr:
        results = UserServices.getClosestAnomalyByUser(id)
    if 'l' in idStr:
        results = LinksServices.getClosestAnomaliesByLink(id)
    if 'h' in idStr:
        results = HashtagsServices.getClosestAnomaliesByHashtag(id)
    nodes = []
    checkId = []
    edges = []
    for item in results:
        if item['id'] in checkId:
            continue
        checkId.append(item['id'])
        nodes.append(item)
    for li in results:
        if li["target"] is not None  and li["target"] != -1 and li["target"] != "-1":
            link = {"source": li["id"], "target": li["target"]}
            edges.append(link)
    return jsonify({"nodes": nodes, 'score': getSubGraphScore(nodes, alpha), "links": edges})

def getSubGraphScore(nodes, alpha_max):
    if nodes is None or len(nodes) == 0:
        return 0
    if alpha_max < 0:
        return 0
    currentScore = 0
    listAlpha = [item['score'] for item in nodes]
    listAlpha.sort()
    for alpha in listAlpha:
        if alpha > alpha_max:
            break
        lessThanAlpha = [item for item in listAlpha if item <= alpha]
        print(len(listAlpha))
        x = len(lessThanAlpha)/len(listAlpha)
        y = alpha
        if y == 0:
            y = 0.000001
        if x == 1:
            x = x - 0.000001
        kl = x*math.log10(x/y) + (1-x)*math.log10((1-x)/(1-y))
        score = len(listAlpha) * kl
        if score > currentScore:
            currentScore = score
    return currentScore/len(nodes)


@app.route("/entity/getEntity",methods=['GET'])
def getEntity():
    idStr = request.args.get('id')
    id = int(idStr.split('_')[1])
    item =  None
    if 'u' in idStr:
        item = UserServices.getUser(id)
    if 'l' in idStr:
        item = LinksServices.getLink(id)
    if 'h' in idStr:
        item = HashtagsServices.getHashtag(id)
    if 't' in idStr:
        item = TweetsServices.getTweets(id)
    if item is not None and len(item) > 0:
        item = list(item)[0]
        item["score"] = float(item["score"])
    return jsonify(item)


@app.route("/entity/adjustRumourScore",methods=['POST'])
def adjustRumourScore():
    info = request.get_json()
    print(info)
    idStr = info["id"]
    score = info["score"]
    id = int(idStr.split('_')[1])
    if 'u' in idStr:
        UserServices.setScore(id,score)
    if 'l' in idStr:
        LinksServices.setScore(id, score)
    if 'h' in idStr:
        HashtagsServices.setScore(id, score)
    if 't' in idStr:
        TweetsServices.setScore(id, score)
    return jsonify({"success":True})




