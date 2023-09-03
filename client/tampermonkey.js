// ==UserScript==
// @name         Video Bookmarking Tool
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  bookmarking videos
// @author       JP
// @match        https://*.youtube.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @connect      *
// @noframes
// ==/UserScript==

(function() {
    'use strict';
    var endpoint = "";
    var mobile = false;
    var bookmarked = false;
    var videoID = null;
    var oldURL = "";

    var createButton = (element) => {
        var button = document.createElement('button');
        button.id = 'jp_button';
        button.innerText = 'bookmark';
        if(bookmarked) {
            button.style = 'background-color: green; color: white; margin-left: 10px';
        } else {
            button.style = 'background-color: red; color: white; margin-left: 10px';
        }
        button.onclick = (e) => {
            e.stopPropagation();
            let videoTitle = "title";
            if(mobile) {
                let yt = element.querySelectorAll("span");
                videoTitle = yt[0].innerHTML;
            } else {
                let yt = element.querySelectorAll("yt-formatted-string");
                videoTitle = yt[0].innerHTML;
            }
            let updateReq = endpoint + "update";
            if(videoID != null) {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: updateReq,
                    headers: {"Content-Type": "application/json"},
                    data: JSON.stringify({"id": videoID, "title": videoTitle}),
                    responseType: "json",
                    onload: function(resp) {
                        let json = resp.response;
                        button.style = 'background-color: green; color: white; margin-left: 10px';
                    }
                });
            }
        };
        element.append(button);
    }

    var findTitleOnPage = () => {
        if(mobile) {
            let h2 = document.querySelectorAll("h2");
            for(let i = 0; i < h2.length; i++) {
                let element = h2[i];
                if(element.classList.contains('slim-video-information-title') && element.classList.contains('slim-video-metadata-title-modern')) {
                    createButton(element);
                    break;
                }
            }
        } else {
            let h1 = document.querySelectorAll("h1");
            for(let i = 0; i < h1.length; i++) {
                let element = h1[i];
                if(element.classList.contains('style-scope') && element.classList.contains('ytd-watch-metadata')) {
                    createButton(element);
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
                responseType: "json",
                onload: function(resp) {
                    let json = resp.response;
                    if(json != null) {
                        if(json.saved != false && json.saved == videoID) {
                            bookmarked = true;
                        }
                        findTitleOnPage();
                        setTimeout(checkForButtonOnPage, 1000);
                    }
                }
            });
        }
    }

    var checkForButtonOnPage = () => {
        let jpButton = document.getElementById('jp_button');
        if(!jpButton) {
            getBookmarkedState();
        }
    }

    var checkForURLUpdates = () => {
        let url = window.location.href;
        if(url != oldURL) {
            oldURL = url;
            let jpButton = document.getElementById('jp_button');
            if(jpButton) {
                jpButton.remove();
            }
            checkForButtonOnPage();
        }
    }

    setInterval(checkForURLUpdates, 1000);
})();
