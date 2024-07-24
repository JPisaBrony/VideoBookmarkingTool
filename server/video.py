from flask import Flask, request, jsonify, render_template
import pysqlite3 as sqlite3
from functools import wraps
import json
import os

database_name = "videos.db"
api_key = "API_KEY"
# create database
db = sqlite3.connect(database_name)
db.execute("CREATE TABLE IF NOT EXISTS bookmarked_videos(id INTEGER PRIMARY KEY, video_id TEXT UNIQUE, title TEXT, timestamp INTEGER)")
db.execute("CREATE TABLE IF NOT EXISTS backlogged_videos(id INTEGER PRIMARY KEY, video_id TEXT UNIQUE, title TEXT, video_time INTEGER)")
db.commit()
db.close()
# setup flask app
app = Flask(__name__)

# basic api authentication implementation
def api_auth_required(func):
    @wraps(func)
    def decorator(*args, **kwargs):
        req_key = request.headers.get('API-Key')
        if req_key != api_key:
            return jsonify({'error': 'unauthorized'}), 401
        return func(*args, **kwargs)
    return decorator

# setup routes
@app.route("/")
def default_route():
    return "<p>video server is running</p>"

@app.route("/update", methods = ['POST'])
@api_auth_required
def update_video():
    json = request.json
    if "id" in json and "title" in json:
        try:
            con = sqlite3.connect(database_name)
            con.execute("INSERT INTO bookmarked_videos (video_id, title, timestamp) VALUES (?, ?, unixepoch()) ON CONFLICT(video_id) DO UPDATE SET title = excluded.title, timestamp = excluded.timestamp", (json["id"], json["title"]))
            con.commit()
            con.close()
            return {json["id"]: json["title"]}
        except Exception as e:
            print(e)
            print(json)
            return {"failed": -1}
    return {"failed": -1}

@app.route("/find/<string:id>")
@api_auth_required
def find_video(id):
    try:
        con = sqlite3.connect(database_name)
        res = con.execute("SELECT video_id FROM bookmarked_videos WHERE video_id = ?", (id,))
        video_id = res.fetchone()
        con.close()
        if video_id == None:
            return {"saved": ""}
        else:
            return {"saved": video_id[0]}
    except Exception as e:
        print(e)
        return {"failed": -1}

@app.route("/backlog", methods = ['POST'])
@api_auth_required
def backlog_video():
    json = request.json
    if "id" in json and "title" in json and "time" in json:
        try:
            con = sqlite3.connect(database_name)
            con.execute("INSERT INTO backlogged_videos (video_id, title, video_time) VALUES (?, ?, ?) ON CONFLICT(video_id) DO UPDATE SET title = excluded.title, video_time = excluded.video_time", (json["id"], json["title"], json['time']))
            con.commit()
            con.close()
            return {json["id"]: json["title"]}
        except Exception as e:
            print(e)
            print(json)
            return {"failed": -1}
    return {"failed": -1}

@app.route("/view-backlog", methods = ['GET'])
def view_backlog_videos():
    return render_template("backlog.html")

@app.route("/backlog", methods = ['GET'])
@api_auth_required
def backlog_videos():
    try:
        con = sqlite3.connect(database_name)
        res = con.execute("SELECT * FROM backlogged_videos")
        videos = res.fetchall()
        con.close()
        return videos
    except Exception as e:
        print(e)
        print(json)
        return {"failed": -1}

@app.route("/backlog/<string:id>", methods = ['DELETE'])
@api_auth_required
def backlog_video_delete(id):
    try:
        con = sqlite3.connect(database_name)
        res = con.execute("DELETE FROM backlogged_videos WHERE video_id = ?", (id,))
        con.commit()
        con.close()
        if res.rowcount > 0:
            return {"deleted": id}
        else:
            return {"deleted": ""}
    except Exception as e:
        print(e)
        print(json)
        return {"failed": -1}
