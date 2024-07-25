// ==UserScript==
// @name         Video Bookmarking Tool
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  bookmarking videos
// @author       JP
// @match        https://*.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @connect      *
// @grant        window.close
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    var endpoint = "http://localhost:8080/";
    var apiKey = "API_KEY";
    var mobile = false;
    var bookmarked = false;
    var videoID = null;
    var oldURL = "";

    var createDiv = (element) => {
        var div = document.createElement('jp_div');
        div.id = 'jp_div';
        // bookmarked buton
        var bookmark_button = document.createElement("button");
        bookmark_button.innerText = 'bookmark';
        if(bookmarked) {
            bookmark_button.style = 'background-color: green; color: white; margin-left: 10px';
        } else {
            bookmark_button.style = 'background-color: red; color: white; margin-left: 10px';
        }
        bookmark_button.onclick = (e) => {
            e.stopPropagation();
            let videoTitle = "title";
            if(mobile) {
                let yt = element.querySelectorAll("span");
                videoTitle = yt[0].innerText;
            } else {
                let yt = element.querySelectorAll("yt-formatted-string");
                videoTitle = yt[0].innerText;
            }
            let updateReq = endpoint + "update";
            if(videoID != null) {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: updateReq,
                    headers: {"Content-Type": "application/json", "API-Key": apiKey},
                    data: JSON.stringify({"id": videoID, "title": videoTitle}),
                    responseType: "json",
                    onload: function(resp) {
                        let json = resp.response;
                        bookmark_button.style = 'background-color: green; color: white; margin-left: 10px';
                    }
                });
            }
        };
        // backlog button
        var backlog_button = document.createElement("button");
        backlog_button.innerText = 'backlog';
        backlog_button.style = "margin-left: 10px";
        backlog_button.onclick = (e) => {
            e.stopPropagation();
            let videoTitle = "title";
            if(mobile) {
                let yt = element.querySelectorAll("span");
                videoTitle = yt[0].innerText;
            } else {
                let yt = element.querySelectorAll("yt-formatted-string");
                videoTitle = yt[0].innerText;
            }
            let updateReq = endpoint + "backlog";
            if(videoID != null) {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: updateReq,
                    headers: {"Content-Type": "application/json", "API-Key": apiKey},
                    data: JSON.stringify({"id": videoID, "title": videoTitle, "time": 0}),
                    responseType: "json",
                    onload: function(resp) {
                        if(resp.status == 200) {
                            window.close();
                        }
                    }
                });
            }
        };
        // add both buttons to the div and then to the page
        div.append(bookmark_button);
        div.append(backlog_button);
        element.append(div);
    }

    var findTitleOnPage = () => {
        if(mobile) {
            let h2 = document.querySelectorAll("h2");
            for(let i = 0; i < h2.length; i++) {
                let element = h2[i];
                if(element.classList.contains('slim-video-information-title') && element.classList.contains('slim-video-metadata-title-modern')) {
                    createDiv(element);
                    break;
                }
            }
        } else {
            let h1 = document.querySelectorAll("h1");
            for(let i = 0; i < h1.length; i++) {
                let element = h1[i];
                if(element.classList.contains('style-scope') && element.classList.contains('ytd-watch-metadata')) {
                    createDiv(element);
                    break;
                }
            }
        }
    }

    var getBookmarkedState = () => {
        bookmarked = false;
        let url = window.location.href;
        videoID = url.split("v=")[1];
        if(videoID != null) {
            videoID = videoID.substring(0, 11);
        }
        if(url[8] == 'm') {
            mobile = true;
        }
        if(videoID != null) {
            var getReq = endpoint + "find/" + videoID;
            GM_xmlhttpRequest({
                method: "GET",
                url: getReq,
                headers: {"API-Key": apiKey},
                responseType: "json",
                onload: function(resp) {
                    let json = resp.response;
                    if(json != null) {
                        if(json.saved != false && json.saved == videoID) {
                            bookmarked = true;
                        }
                        findTitleOnPage();
                        setTimeout(checkForDivOnPage, 1000);
                    }
                }
            });
        }
    }

    var checkForDivOnPage = () => {
        let jpDiv = document.getElementById("jp_div");
        if(!jpDiv) {
            getBookmarkedState();
        }
    }

    var checkForURLUpdates = () => {
        let url = window.location.href;
        if(url != oldURL) {
            oldURL = url;
            let jpDiv = document.getElementById('jp_div');
            if(jpDiv) {
                jpDiv.remove();
            }
            checkForDivOnPage();
        }
    }

    setInterval(checkForURLUpdates, 1000);
})();
