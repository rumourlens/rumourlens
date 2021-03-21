from flask import json,jsonify
from app import db,app
from sqlalchemy.orm import load_only
import random
import math
import pathlib
import os


def getSimpleLinks():
    links = db.engine.execute(
    """
        SELECT l.id, l.text as text, l.is_anomaly, l.tweet_id, (t.created_date - '2021-02-26'::date) as interval, l.score
        FROM links  l 
            left join tweets t on l.tweet_id = t.id
        WHERE l.is_deleted = false 
    """
    ).fetchall()
    results = []
    for link in links:
        interval = 0
        if link["interval"] is not None:
            interval = link["interval"] 
        results.append({
            "id": "l_" + str(link["id"]),
            "text": link["text"],
            "is_anomaly": link["is_anomaly"],
            "tweet_id": "t_" + str(link["tweet_id"]),
            "interval": interval,
            "score": float(link["score"]),
            "type": 3
        })
    return list(results)

def getLinkTweets():
    links = db.engine.execute(
    """
        SELECT lt.link_id, lt.tweet_id, (t.created_date - '2021-02-26'::date) as interval, least(l.score, t.score) as score
        FROM link_tweet lt
            inner join links l on lt.link_id = l.id
            inner join tweets t on l.tweet_id = t.id
        WHERE lt.is_deleted = false AND l.is_deleted = false
    """
    ).fetchall()
    results = []
    for link in links:
        results.append({
            "link_id": "l_" +str(link["link_id"]),
            "tweet_id": "t_" + str(link["tweet_id"]),
            "interval": link["interval"],
            "score": float(link["score"]),
        })
    return list(results)

def getTopLinks(topX = 0):
    links = db.engine.execute(
    """
        SELECT id, text,is_anomaly, mentions, score
        FROM links
        WHERE is_deleted = false 
        order by mentions desc
    """.format()
    ).fetchall()
    results = []
    for link in links:
        results.append({
            "id": "l_" + str(link["id"]),
            "text": link["text"],
            "is_anomaly": link["is_anomaly"],
            "mentions": link["mentions"],
            "score": float(link["score"]),
        })
    return list(results)

def getTotalLinks():
    links = db.engine.execute(
    """
        SELECT COUNT(*) as total FROM links
          WHERE is_deleted = false
    """
    ).fetchall()
    total = links[0][0]
    totalNotDeleted = total
    return total, totalNotDeleted


def getClosestAnomaliesByLink(id):
    items = db.engine.execute(
    """
     WITH cte1 as 
    (
        SELECT l.id, l.text, l.is_anomaly, 3 as type, lt.tweet_id as target, l.score
        FROM links l
            INNER JOIN link_tweet lt ON l.id = lt.link_id
        WHERE l.id = {} and lt.is_deleted = false
    ), cte2 as
    (
        SELECT id, comment as text, is_anomaly, 2 as type, user_id as target, score
        FROM tweets 
        WHERE id in (SELECT tweet_id from link_tweet WHERE link_id = {})
        ORDER BY score
        LIMIT 5
    )

    SELECT * FROM cte1 
    WHERE target in (SELECT id from cte2)
    UNION
    SELECT * FROM cte2
    UNION
    SELECT id, name as text, is_anomaly, 1 as type, '-1' as target, score
    FROM users WHERE id in (SELECT target from cte2)
    UNION
    SELECT l.id, l.text, l.is_anomaly, 3 as type , lt.tweet_id as target, l.score
    FROM links l
        INNER JOIN link_tweet lt ON l.id = lt.link_id
    WHERE l.is_deleted = false and lt.is_deleted=false AND (lt.tweet_id IN (SELECT id from cte2))
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

def getLinkHistory(linkId):
    links = db.engine.execute(
    """
        SELECT *
        FROM link_history
        WHERE link_id = {}
    """.format(linkId)
    ).fetchall()
    results = []
    for history in links:
        results.append({
            "id": history["id"],
            "link_id": history["link_id"],
            "mentions": history["mentions"],
            "tracking_date": history["tracking_date"].strftime("%d.%m.%Y")
        })
    return list(results)

def getLink(linkId):
    item = db.engine.execute(
    """
        SELECT *
        FROM links
        WHERE id = {}
    """.format(linkId)
    ).fetchall()
  
    return [dict(row) for row in item]

def getLinkMentionHistory(linkId):
    item = db.engine.execute(
    """
        SELECT to_char(t.created_date, 'DD.MM.YYYY') as date, count(*) as total
        FROM link_tweet ht
            inner join tweets t on ht.tweet_id = t.id
        WHERE ht.is_deleted = false and link_id = {}
        group by to_char(t.created_date, 'DD.MM.YYYY'), t.created_date
                     order by  t.created_date

    """.format(linkId.replace('l_', ''))
    ).fetchall()
  
    return [dict(row) for row in item]

def setScore(id, score):
    sql = """
            
           UPDATE links set score = {} where id = {}
          """.format(score, id)
    db.session.execute(sql)
    db.session.commit()
