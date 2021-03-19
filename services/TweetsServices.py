from flask import json,jsonify
from app import db,app
from sqlalchemy.orm import load_only
import random
import math
import pathlib
import os
from datetime import datetime
            

def getSimpleTweets():
    tweets = db.engine.execute(
    """
        SELECT id, comment as text, is_anomaly, user_id, (created_date - '2021-02-26'::date) as interval, score
        FROM tweets
        WHERE is_deleted = false
    """
    ).fetchall()
    results = []
    for tweet in tweets:
        results.append({
            "id": "t_" + str(tweet["id"]),
            "text": tweet["text"],
            "is_anomaly": tweet["is_anomaly"],
            "user_id": "u_" + str(tweet["user_id"]),
            "interval": tweet["interval"],
            "score": float(tweet["score"]),
            "type": 2
        })
    return list(results)


def getTopTweets(topX = 10):
    tweets = db.engine.execute(
    """
       WITH summary AS (
            SELECT *,
                ROW_NUMBER() OVER(PARTITION BY p.comment 
                                        ORDER BY p.retweet_count + p.favourite_count DESC) AS rk
            FROM tweets p
            WHERE is_deleted = false
        )
        SELECT id, comment as text, is_anomaly, user_id, retweet_count, favourite_count, score, created_date
        FROM summary
        WHERE rk = 1
        ORDER BY retweet_count + favourite_count DESC
    """
    ).fetchall()
    results = []
    for tweet in tweets:
        results.append({
            "id": "t_" + str(tweet["id"]),
            "text": tweet["text"],
            "is_anomaly": tweet["is_anomaly"],
            "user_id": "u_" + str(tweet["user_id"]),
            "retweet_count": tweet["retweet_count"],
            "favourite_count": tweet["favourite_count"],
            "score": float(tweet["score"]),
            "created_date": datetime.strftime(tweet["created_date"], "%Y-%m-%d")
        })
    return list(results)

def getTotalTweets():
    tweets = db.engine.execute(
    """
        
        SELECT COUNT(*) as total FROM tweets WHERE is_deleted = false
    """
    ).fetchall()
    total = tweets[0][0]
    totalNotDeleted = total
    return total, totalNotDeleted


def getClosestAnomaliesByTweet(id):
    items = db.engine.execute(
    """
    WITH cte1 as 
    (
        SELECT id,name as text,is_anomaly, 1 as type, -1 as target, score
        FROM users 
        WHERE id = (SELECT user_id from tweets WHERE id = {})
    ), cte2 as
    (
        SELECT id, comment as text, is_anomaly, 2 as type, user_id as target, score
        FROM tweets 
        WHERE user_id = (SELECT user_id from tweets WHERE id =  {})
                AND id != {}
                AND is_deleted = false
        ORDER BY score
        LIMIT 4
    )

    SELECT  * FROM cte1 
    UNION
    SELECT * FROM cte2
    UNION
    SELECT id, comment as text, is_anomaly, 2 as type, user_id as target, score
    FROM tweets
    WHERE id =  {}
    UNION
    SELECT l.id, l.text, l.is_anomaly, 3 as type , lt.tweet_id as target, l.score
    FROM links l
        INNER JOIN link_tweet lt ON l.id = lt.link_id
    WHERE lt.is_deleted = false AND l.is_deleted = false AND (lt.tweet_id = {} OR lt.tweet_id IN (SELECT id from cte2))
    UNION 
    SELECT h.id, h.text, h.is_anomaly, 4 as type , ht.tweet_id as target, h.score
    FROM hashtags h
        INNER JOIN hashtag_tweet ht ON h.id = ht.hashtag_id
    WHERE h.is_deleted = false and ht.is_deleted = false AND (ht.tweet_id = {} OR ht.tweet_id IN (SELECT id from cte2))
    """.format(id, id,id,id,id,id)
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
           target ="u_" + str(target)
        if type == 3:
           id = "l_" + str(id)
           target ="t_" + str(target)
        if type == 4:
           id = "h_" + str(id)
           target ="t_" + str(target)
        results.append({
            "id": id,
            "text": item["text"],
            "is_anomaly": item["is_anomaly"],
            "type": item["type"],
            "target": target,
            "score": float(item["score"])
        })
    return list(results)

def getTweets(tweetId):
    tweets = db.engine.execute(
    """
        SELECT *,  to_char(created_date, 'DD.MM.YYYY') as date
        FROM tweets
        WHERE id = {}
    """.format(tweetId)
    ).fetchall()
  
    return [dict(row) for row in tweets]

def getCreatedDateHistogram():
    item = db.engine.execute(
    """
       SELECT (now()::date - t.created_date::date)  AS days
        FROM  tweets t
        WHERE is_deleted = false 
        order by days
    """
    ).fetchall()
  
    return [row["days"] for row in item]

def setScore(id, score):
    sql = """
            
           UPDATE tweets set score = {} where id = {}
          """.format(score, id)
    db.session.execute(sql)
    db.session.commit()

