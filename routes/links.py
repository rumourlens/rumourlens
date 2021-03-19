from app import app
from flask import jsonify,render_template,json, request
from services import LinksServices

@app.route("/links",methods=['GET'])
def getAllLinks():
    links = LinksServices.getAllLinks()
    return jsonify(links)

@app.route("/link/getTopLinks",methods=['GET'])
def getTopLinks():
    links = LinksServices.getTopLinks(10)
    return jsonify(links)

@app.route("/link/getTotalLinks",methods=['GET'])
def getTotalLinks():
    total, totalNotDeleted = LinksServices.getTotalLinks()
    return jsonify({"total": total, "totalNotDeleted": totalNotDeleted})

@app.route("/link/getMentionHistory",methods=['GET'])
def getLinkMentionHistory():
    idStr = request.args.get('id')
    results = LinksServices.getLinkMentionHistory(idStr)
    return jsonify({"results": results})