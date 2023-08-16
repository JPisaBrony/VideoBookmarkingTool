from flask import Flask, request
import pysqlite3 as sqlite3
import json
import os

database_name = "videos.db"
# create database
db = sqlite3.connect(database_name)
db.execute("CREATE TABLE IF NOT EXISTS bookmarked_videos(id INTEGER PRIMARY KEY, video_id TEXT UNIQUE, title TEXT, timestamp INTEGER)")
db.commit()
db.close()
# setup flask app
app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>video server is running</p>"

@app.route("/update", methods = ['POST'])
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
def find_video(id):
    try:
        con = sqlite3.connect(database_name)
        res = con.execute("SELECT video_id FROM bookmarked_videos WHERE video_id = ?", (id,))
        video_id = res.fetchone()
        con.close()
        return {"saved": video_id[0]}
    except Exception as e:
        print(e)
        return {"failed": -1}
