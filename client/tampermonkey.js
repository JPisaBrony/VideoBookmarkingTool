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
    document.body.addEventListener("yt-navigate-finish", function() {
        var endpoint = "";
        var url = window.location.href;
        var videoID = url.split("v=")[1];
        if(videoID != null) {
            videoID = videoID.substring(0, 11);
        }
        var mobile = false;
        var bookmarked = false;
        if(url[8] == 'm') {
            mobile = true;
        }

        var makeSureButtonExists = () => {
            let jpButton = document.getElementById('jp_button');
            if(!jpButton) {
                setTimeout(checkExists, 1000);
            }
        }

        var createButton = (element, isMobile) => {
            let videoTitle = "title";
            if(isMobile) {
                let yt = element.querySelectorAll("span");
                videoTitle = yt[0].innerHTML;
            } else {
                let yt = element.querySelectorAll("yt-formatted-string");
                videoTitle = yt[0].innerHTML;
            }
            var button = document.createElement('button');
            button.id = 'jp_button';
            button.innerText = 'bookmark';
            if(bookmarked) {
                button.style = 'background-color: green; color: white; margin-left: 10px';
            } else {
                button.style = 'background-color: red; color: white; margin-left: 10px';
            }
            button.onclick = () => {
                let updateReq = endpoint + "update";
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
            };
            element.append(button);
            setTimeout(makeSureButtonExists, 1000);
        }

        var checkForTitleMobile = (element) => {
            if(element.classList.contains('slim-video-information-title') && element.classList.contains('slim-video-metadata-title-modern')) {
                createButton(element, true);
                return true;
            }
        }

        var checkForTitle = (element) => {
            if(element.classList.contains('style-scope') && element.classList.contains('ytd-watch-metadata')) {
                createButton(element, false);
                return true;
            }
        }

        var checkExists = () => {
            let rerun = true;
            if(mobile) {
                let h2 = document.querySelectorAll("h2");
                for(let i = 0; i < h2.length; i++) {
                    if(checkForTitleMobile(h2[i])) {
                        rerun = false;
                    }
                }
            } else {
                let h1 = document.querySelectorAll("h1");
                for(let i = 0; i < h1.length; i++) {
                    if(checkForTitle(h1[i])) {
                        rerun = false;
                    }
                }
            }
            if(rerun) {
                setTimeout(checkExists, 1000);
            }
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
                        if(json.saved != false && json.saved != "") {
                            bookmarked = true;
                        }
                        makeSureButtonExists();
                    }
                }
            });
        }
    });
})();
