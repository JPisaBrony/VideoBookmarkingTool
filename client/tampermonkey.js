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
// ==/UserScript==

(function() {
    'use strict';
    var endpoint = "";
    var url = window.location.href;
    var videoID = url.split("v=", 11)[1];
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

    var createButton = (x, isMobile) => {
        let videoTitle = "title";
        if(isMobile) {
            let yt = x.querySelectorAll("span");
            videoTitle = yt[0].innerHTML;
        } else {
            let yt = x.querySelectorAll("yt-formatted-string");
            videoTitle = yt[0].innerHTML;
        }
        var button = document.createElement('button');
        button.id = 'jp_button';
        button.innerText = 'bookmark';
        if(bookmarked) {
            button.style = 'background-color: green';
        } else {
            button.style = 'background-color: red';
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
                    button.style = 'background-color: green';
                }
            });
        };
        x.append(button);
        setTimeout(makeSureButtonExists, 1000);
    }

    var checkForTitleMobile = (x) => {
        if(x.classList.contains('slim-video-information-title') && x.classList.contains('slim-video-metadata-title-modern')) {
            createButton(x, true);
            return true;
        }
    }

    var checkForTitle = (x) => {
        if(x.classList.contains('style-scope') && x.classList.contains('ytd-watch-metadata')) {
            createButton(x, false);
            return true;
        }
    }

    var checkExists = () => {
        var rerun = true;
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
                setTimeout(checkExists, 1000);
            }
        }
    });
})();
