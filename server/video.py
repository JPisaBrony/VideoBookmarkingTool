from flask import Flask, request
import json
import os

app = Flask(__name__)
filename = 'videos.json'

@app.route("/")
def hello_world():
    return "<p>video server is running</p>"

video_list = {
    "saved": {},
    "watching": {}
}
if os.path.isfile(filename):
    with open(filename) as f:
        video_list = json.load(f)

def save_json_file():
    with open(filename, 'w') as f:
        json.dump(video_list, f)

@app.route("/add/<string:id>", methods = ['POST'])
def add_video(id):
    video_list["saved"][id] = 0
    save_json_file()
    return {"saved": id}

@app.route("/update", methods = ['POST'])
def update_video():
    json = request.json
    if "id" in json and "title" in json:
        video_list["saved"][json["id"]] = json["title"]
        save_json_file()
        return {json["id"]: json["title"]}
    return {"failed": -1}

@app.route("/find/<string:id>")
def find_video(id):
    if id in video_list["saved"]:
        return {"saved": id}
    return {"saved": ""}

@app.route("/videos")
def list_videos():
    return video_list
