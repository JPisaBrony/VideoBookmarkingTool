import pysqlite3 as sqlite3
import json

con = sqlite3.connect("json.db")
con.execute("CREATE TABLE IF NOT EXISTS bookmarked_videos(id INTEGER PRIMARY KEY, video_id TEXT UNIQUE, title TEXT, timestamp INTEGER)")
con.commit()

video_list = {
    "saved": {},
    "watching": {}
}

with open("videos.json") as f:
    video_list = json.load(f)

for video_id, title in video_list["saved"].items():
    con.execute("INSERT INTO bookmarked_videos (video_id, title, timestamp) VALUES (?, ?, unixepoch()) ON CONFLICT(video_id) DO UPDATE SET title = excluded.title, timestamp = excluded.timestamp", (video_id, title))
    con.commit()
