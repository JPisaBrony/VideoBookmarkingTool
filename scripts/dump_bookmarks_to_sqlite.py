from bs4 import BeautifulSoup
import sqlite3

con = sqlite3.connect("bookmarks.db")
con.execute("CREATE TABLE IF NOT EXISTS bookmarked_videos(id INTEGER PRIMARY KEY, video_id TEXT UNIQUE, title TEXT, timestamp INTEGER)")
con.commit()

file = open("bookmarks.html")
soup = BeautifulSoup(file, 'html.parser')
file.close()

for a in soup.find_all('a'):
    url = a['href']
    if 'youtube' in url and 'watch' in url:
        split = url.split("v=")
        if len(split) > 1:
            title = a.string
            title_split = title.split(" - YouTube")
            try:
                video_id = split[1][:11]
                title = title_split[0]
                timestamp = a['add_date']
                con.execute("INSERT INTO bookmarked_videos (video_id, title, timestamp) VALUES (?, ?, ?) ON CONFLICT(video_id) DO UPDATE SET title = excluded.title, timestamp = excluded.timestamp WHERE bookmarked_videos.timestamp >= excluded.timestamp", (video_id, title, timestamp))
                con.commit()
            except:
                print(split[1][:11] + " " + title_split[0] + " " + a['add_date'])

con.close()
