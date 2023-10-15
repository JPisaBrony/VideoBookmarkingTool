import sqlite3

con = sqlite3.connect("bookmarks.db")
con2 = sqlite3.connect("videos.db")

cur = con2.execute("SELECT * FROM bookmarked_videos")
for row in cur.fetchall():
    try:
        con.execute("INSERT INTO bookmarked_videos (video_id, title, timestamp) VALUES (?, ?, ?) ON CONFLICT(video_id) DO UPDATE SET title = excluded.title, timestamp = excluded.timestamp WHERE bookmarked_videos.timestamp >= excluded.timestamp", (row[1], row[2], row[3]))
        con.commit()
    except:
        print(row)

con.close()
con2.close()
