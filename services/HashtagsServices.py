from flask import json,jsonify
from app import db,app
from sqlalchemy.orm import load_only
import random
import math
import pathlib
import os
            

def getSimpleHashtags():
    hashtags = db.engine.execute(
    """
        SELECT ht.id, ht.text as text, ht.is_anomaly, ht.tweet_id,  (t.created_date - '2021-02-26'::date) as interval,  ht.score
        FROM hashtags ht
            left join tweets t on ht.tweet_id = t.id
        WHERE ht.is_deleted = false
    """
    ).fetchall()
    results = []
    for hashtag in hashtags:
        interval = 0
        if hashtag["interval"] is not None:
            interval = hashtag["interval"]  
        results.append({
            "id": "h_" + str(hashtag["id"]),
            "text": hashtag["text"],
            "is_anomaly": hashtag["is_anomaly"],
            "tweet_id": "t_" + str(hashtag["tweet_id"]),
            "interval": interval,
            "score": float(hashtag["score"]),
            "type": 4
        })
    return list(results)

def getHashtagTweets():
    hashtags = db.engine.execute(
    """
        SELECT ht.hashtag_id, ht.tweet_id, (t.created_date - '2021-02-26'::date) as interval,  least(h.score, t.score) as score
        FROM hashtag_tweet ht
            inner join hashtags h on ht.hashtag_id = h.id
            inner join tweets t on ht.tweet_id = t.id
        WHERE ht.is_deleted = false AND h.is_deleted = false
    """
    ).fetchall()
    results = []
    for hashtag in hashtags:
        results.append({
            "hashtag_id": "h_" +str(hashtag["hashtag_id"]),
            "tweet_id": "t_" + str(hashtag["tweet_id"]),
            "interval": hashtag["interval"],
            "score": float(hashtag["score"]),
        })
    return list(results)

def getTopHashtags(topX = 0):
    hashtags = db.engine.execute(
    """
        SELECT id, text,is_anomaly, usages, score
        FROM hashtags
        WHERE is_deleted = false
        order by usages desc
    """
    ).fetchall()
    results = []
    for hashtag in hashtags:
        results.append({
            "id": "h_" + str(hashtag["id"]),
            "text": hashtag["text"],
            "is_anomaly": hashtag["is_anomaly"],
            "usages": hashtag["usages"],
            "score": float(hashtag["score"]),
        })
    return list(results)

def getTotalHashtags():
    hashtags = db.engine.execute(
    """
        select count(*) from hashtags where is_deleted = false
    """
    ).fetchall()
    total = hashtags[0][0]
    totalNotDeleted = hashtags[0][0]
    return total, totalNotDeleted


def getClosestAnomaliesByHashtag(id):
    items = db.engine.execute(
    """
     WITH cte1 as 
    (
        SELECT h.id, h.text,h.is_anomaly, 4 as type, ht.tweet_id as target, h.score
        FROM hashtags h
            INNER JOIN hashtag_tweet ht ON h.id = ht.hashtag_id
        WHERE ht.id = {} and ht.is_deleted = false
    ), cte2 as
    (
        SELECT id, comment as text, is_anomaly, 2 as type, user_id as target, score
        FROM tweets 
        WHERE id in (SELECT tweet_id from hashtag_tweet WHERE hashtag_id = {})
        ORDER BY score
        LIMIT 5
    )

    SELECT  * FROM cte1
        WHERE target in (SELECT id from cte2)
    UNION
    SELECT * FROM cte2
    UNION
    SELECT id, name as text, is_anomaly, 1 as type, '-1' as target, score
    FROM users where id in (SELECT target from cte2)
    UNION
    SELECT l.id, l.text, l.is_anomaly, 3 as type , lt.tweet_id as target, l.score
    FROM links l
        INNER JOIN link_tweet lt ON l.id = lt.link_id
    WHERE l.is_deleted = false AND (lt.tweet_id IN (SELECT id from cte2))
    UNION 
    SELECT h.id, h.text, h.is_anomaly, 4 as type , ht.tweet_id as target, h.score
    FROM hashtags h
        INNER JOIN hashtag_tweet ht ON h.id = ht.hashtag_id
    WHERE h.is_deleted = false and ht.is_deleted=false AND (ht.tweet_id IN (SELECT id from cte2))
    """.format(id, id)
    ).fetchall()
    results = []
    for item in items:
        id = item["id"]
        type = item["type"]
        target = item["target"]
        if type == 1:
           id = "u_" + str(id)
        if type == 2:
           id = "t_" + str(id)
           target = 'u_' + str(target)
        if type == 3:
           id = "l_" + str(id)
           target = 't_' + str(target)
        if type == 4:
           id = "h_" + str(id)
           target = 't_' + str(target)

        results.append({
            "id": id,
            "text": item["text"],
            "is_anomaly": item["is_anomaly"],
            "type": item["type"],
            "target": target,
            "score": float(item["score"])
        })
    return list(results)

def getHashtagHistory(hashtagId):
    hashtags = db.engine.execute(
    """
        SELECT *
        FROM hashtag_history
        WHERE hashtag_id = {}
    """.format(hashtagId)
    ).fetchall()
    results = []
    for history in hashtags:
        results.append({
            "id": history["id"],
            "hashtag_id": history["hashtag_id"],
            "usages": history["usages"],
            "tracking_date": history["tracking_date"].strftime("%d.%m.%Y")
        })
    return list(results)

def getHashtag(hashtagId):
    item = db.engine.execute(
    """
        SELECT *
        FROM hashtags
        WHERE id = {}
    """.format(hashtagId)
    ).fetchall()
  
    return [dict(row) for row in item]

def getHasgtagUsages(hashtagId):
    item = db.engine.execute(
    """
        SELECT to_char(t.created_date, 'DD.MM.YYYY') as date, count(*) as total
        FROM hashtag_tweet ht
            inner join tweets t on ht.tweet_id = t.id
        WHERE ht.is_deleted = false and hashtag_id = {}
        group by to_char(t.created_date, 'DD.MM.YYYY')
        order by to_char(t.created_date, 'DD.MM.YYYY')
    """.format(hashtagId.replace('h_', ''))
    ).fetchall()
  
    return [dict(row) for row in item]

def setScore(id, score):
    sql = """
            
           UPDATE hashtag set score = {} where id = {}
          """.format(score, id)
    db.session.execute(sql)
    db.session.commit()