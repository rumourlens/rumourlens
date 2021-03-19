from flask import json,jsonify
from app import db,app
from sqlalchemy.orm import load_only
import random
import math
import pathlib
import os
            
def getSimpleUsers():
    users = db.engine.execute(
    """
       SELECT id, name as text, is_anomaly, ((SELECT MIN(created_date) from tweets t where t.user_id = users.id and t.is_deleted= false) - '2021-02-26'::date) as interval, score
        FROM users 
        WHERE is_deleted = false
        and exists (select 1 from tweets where user_id = users.id)
    """
    ).fetchall()
    results = []
    for user in users:
        results.append({
            "id": "u_" + str(user["id"]),
            "text": user["text"],
            "is_anomaly": user["is_anomaly"],
            "interval":  user["interval"],
            "score": float(user["score"]),
            "type": 1
        })
    return list(results)

def getTopUsers(topX = 10):
    users = db.engine.execute(
    """
        SELECT id, full_name as text, is_anomaly, followers_count, friends_count, favourites_count, score
        FROM users
        WHERE is_deleted = false
        ORDER By followers_count DESC
    """
    ).fetchall()
    results = []
    for user in users:
        results.append({
            "id": "u_" + str(user["id"]),
            "text": user["text"],
            "is_anomaly": user["is_anomaly"],
            "followers_count": user["followers_count"],
            "friends_count": user["friends_count"],
            "favourites_count": user["favourites_count"],
            "score": float(user["score"])
        })
    return list(results)

def getTotalUsers():
    users = db.engine.execute(
    """
        SELECT COUNT(*) as total FROM users
        UNION
        SELECT COUNT(*) as total FROM users WHERE is_deleted = false
        ORDER BY total DESC
    """
    ).fetchall()
    total = users[0][0]
    totalNotDeleted = users[1][0]
    return total, totalNotDeleted

def getClosestAnomalyByUser(id):
    items = db.engine.execute(
    """
       WITH cte1 as 
        (
            SELECT id,name as text,is_anomaly, 1 as type, '-1' as target, score
            FROM users WHERE id = {}
        ), cte2 as
        (
            SELECT id, comment as text, is_anomaly, 2 as type,  CONCAT('u_', CAST(user_id as text)) as target, score
            FROM tweets WHERE user_id = {}
            ORDER BY score asc
            LIMIT 5
        )

        SELECT  * FROM cte1 
        UNION
        SELECT * FROM cte2
        UNION
        SELECT l.id, l.text, l.is_anomaly, 3 as type , CONCAT('t_', CAST(lt.tweet_id as text)) as target, l.score
        FROM links l
            INNER JOIN link_tweet lt ON l.id = lt.link_id
        WHERE l.is_deleted = false AND (lt.tweet_id IN (SELECT id from cte2))
        UNION 
        SELECT h.id, h.text, h.is_anomaly, 4 as type , CONCAT('t_', CAST(ht.tweet_id as text)) as target, h.score
        FROM hashtags h
            INNER JOIN hashtag_tweet ht ON h.id = ht.hashtag_id
        WHERE h.is_deleted = false AND (ht.tweet_id IN (SELECT id from cte2))
    """.format(id, id)
    ).fetchall()
    results = []
    for item in items:
        id = item["id"]
        type = item["type"]
        if type == 1:
           id = "u_" + str(id)
        if type == 2:
           id = "t_" + str(id)
        if type == 3:
           id = "l_" + str(id)
        if type == 4:
           id = "h_" + str(id)
        results.append({
            "id": id,
            "text": item["text"],
            "is_anomaly": item["is_anomaly"],
            "type": item["type"],
            "target": item["target"],
            "score": float(item["score"])
        })
    return list(results)



def getUser(userId):
    user = db.engine.execute(
    """
        SELECT *, to_char(created_date, 'DD.MM.YYYY') as date
        FROM users
        WHERE id = {}
    """.format(userId)
    ).fetchall()
  
    return [dict(row) for row in user]


def getCreatedDateHistogram():
    item = db.engine.execute(
    """
        SELECT (now()::date - t.created_date::date)  AS days
        FROM  users t
        WHERE is_deleted = false 
        order by days
    """
    ).fetchall()
  
    return [row["days"] for row in item]

def getUserFeaturesHistory(userId, field):
    sql =  """
        SELECT id, tracking_date, followers_count as count
        FROM user_history
        WHERE user_id = {}
    """.format(userId)
    if field =="friend":
        sql =  """
        SELECT id, tracking_date, friends_count as count
        FROM user_friend
        WHERE user_id = {}
    """.format(userId)
    if field =="favourite":
        sql =  """
            SELECT id, tracking_date, favourites_count as count
            FROM user_favourite
            WHERE user_id = {}
        """.format(userId)
    userHistories = db.engine.execute(
        sql
    ).fetchall()
    results = []
    for history in userHistories:
        results.append({
            "total": history["count"],
            "date": history["tracking_date"].strftime("%d.%m.%Y")
        })
    return list(results)

def setScore(id, score):
    sql = """
            
           UPDATE users set score = {} where id = {}
          """.format(score, id)
    db.session.execute(sql)
    db.session.commit()
