/******************************************************************************/
//Html5Player v0.0.2
//(c) 2021 Benjamin Zachey
//related API: https://www.w3.org/TR/2011/WD-html5-20110113/video.html
/******************************************************************************/
function Html5Player() {
    var player = null;
    var ready = false;
    var ended = false;

    //--------------------------------------------------------------------------
    //Debug Events
    //--------------------------------------------------------------------------
    var debugEvents = {};
    var addDebugEvent = function(event) {
        if (player != null) {
            removeDebugEvent(event);
            debugEvents[event] = function() {
                TVXVideoPlugin.debug("Video event: " + event);
            };
            player.addEventListener(event, debugEvents[event]);
        }
    };
    var removeDebugEvent = function(event) {
        if (player != null && debugEvents[event] != null) {
            player.removeEventListener(event, debugEvents[event]);
            debugEvents[event] = null;
        }
    };
    var addDebugEvents = function() {
        addDebugEvent("loadstart");
        addDebugEvent("suspend");
        addDebugEvent("abort");
        addDebugEvent("error");
        addDebugEvent("emptied");
        addDebugEvent("stalled");
        addDebugEvent("loadedmetadata");
        addDebugEvent("loadeddata");
        addDebugEvent("canplay");
        addDebugEvent("canplaythrough");
        addDebugEvent("playing");
        addDebugEvent("waiting");
        addDebugEvent("seeking");
        addDebugEvent("seeked");
        addDebugEvent("ended");
        addDebugEvent("play");
        addDebugEvent("pause");
    };
    var removeDebugEvents = function() {
        removeDebugEvent("loadstart");
        removeDebugEvent("suspend");
        removeDebugEvent("abort");
        removeDebugEvent("error");
        removeDebugEvent("emptied");
        removeDebugEvent("stalled");
        removeDebugEvent("loadedmetadata");
        removeDebugEvent("loadeddata");
        removeDebugEvent("canplay");
        removeDebugEvent("canplaythrough");
        removeDebugEvent("playing");
        removeDebugEvent("waiting");
        removeDebugEvent("seeking");
        removeDebugEvent("seeked");
        removeDebugEvent("ended");
        removeDebugEvent("play");
        removeDebugEvent("pause");
    };
    //--------------------------------------------------------------------------

    var onWaiting = function() {
        TVXVideoPlugin.startLoading();
    };
    var onPlaying = function() {
        TVXVideoPlugin.stopLoading();
        TVXVideoPlugin.setState(TVXVideoState.PLAYING);
    };
    var onPaused = function() {
        TVXVideoPlugin.stopLoading();
        TVXVideoPlugin.setState(TVXVideoState.PAUSED);
    };
    var onContinue = function() {
        TVXVideoPlugin.stopLoading();
    };
    var onReady = function() {
        if (player != null && !ready) {
            ready = true;
            TVXVideoPlugin.debug("Video ready");
            TVXVideoPlugin.applyVolume();
            TVXVideoPlugin.stopLoading();
            TVXVideoPlugin.startPlayback(true);//Accelerated start
        }
    };
    var getErrorText = function(code) {
        if (code == 1) {
            //The fetching of the associated resource was aborted by the user's request.
            return "Playback Aborted";
        } else if (code == 2) {
            //Some kind of network error occurred which prevented the media from being successfully fetched, despite having previously been available.
            return "Network Error";
        } else if (code == 3) {
            //Despite having previously been determined to be usable, an error occurred while trying to decode the media resource, resulting in an error.
            return "Media Decode Error";
        } else if (code == 4) {
            //The associated resource or media provider object (such as a MediaStream) has been found to be unsuitable.
            return "Source Not Supported";
        }
        return "Unknown Error";
    };
    var getErrorMessage = function(code, message) {
        var msg = code + ": " + getErrorText(code);
        if (TVXTools.isFullStr(message)) {
            msg += ": " + message;
        }
        return msg;
    };
    var onError = function() {
        if (player != null && player.error != null) {
            TVXVideoPlugin.error("Video error: " + getErrorMessage(player.error.code, player.error.message));
            TVXVideoPlugin.stopLoading();
        }
    };
    var onEnded = function() {
        if (!ended) {
            ended = true;
            TVXVideoPlugin.debug("Video ended");
            TVXVideoPlugin.stopPlayback();
        }
    };

    this.init = function() {
        player = document.getElementById("player");
        player.addEventListener("canplay", onReady);
        player.addEventListener("error", onError);
        player.addEventListener("ended", onEnded);
        player.addEventListener("waiting", onWaiting);
        player.addEventListener("play", onContinue);
        player.addEventListener("playing", onPlaying);
        player.addEventListener("pause", onPaused);
        player.addEventListener("seeked", onContinue);
        player.addEventListener("abort", onContinue);
        addDebugEvents();
    };
    this.ready = function() {
        if (player != null) {
            TVXVideoPlugin.debug("Video plugin ready");
            var url = TVXServices.urlParams.get("url");
            if (TVXTools.isFullStr(url)) {
                TVXVideoPlugin.startLoading();
                player.src = url;
                player.load();
            } else {
                TVXVideoPlugin.warn("Video URL is missing or empty");
            }
        } else {
            TVXVideoPlugin.error("Video player is not initialized");
        }
    };
    this.dispose = function() {
        if (player != null) {
            player.removeEventListener("canplay", onReady);
            player.removeEventListener("error", onError);
            player.removeEventListener("ended", onEnded);
            player.removeEventListener("waiting", onWaiting);
            player.removeEventListener("play", onContinue);
            player.removeEventListener("playing", onPlaying);
            player.removeEventListener("pause", onPaused);
            player.removeEventListener("seeked", onContinue);
            player.removeEventListener("abort", onContinue);
            removeDebugEvents();
            player = null;
        }
    };
    this.play = function() {
        if (player != null) {
            player.play();
        }
    };
    this.pause = function() {
        if (player != null) {
            player.pause();
        }
    };
    this.stop = function() {
        if (player != null) {
            //Note: Html5 player does not support stop -> use pause
            player.pause();
        }
    };
    this.getDuration = function() {
        if (player != null) {
            return player.duration;
        }
        return 0;
    };
    this.getPosition = function() {
        if (player != null) {
            return player.currentTime;
        }
        return 0;
    };
    this.setPosition = function(position) {
        if (player != null) {
            player.currentTime = position;
        }
    };
    this.setVolume = function(volume) {
        if (player != null) {
            player.volume = volume / 100;
        }
    };
    this.getVolume = function() {
        if (player != null) {
            return player.volume * 100;
        }
        return 100;
    };
    this.setMuted = function(muted) {
        if (player != null) {
            player.muted = muted;
        }
    };
    this.isMuted = function() {
        if (player != null) {
            return player.muted;
        }
        return false;
    };
    this.getSpeed = function() {
        if (player != null) {
            return player.playbackRate;
        }
        return 1;
    };
    this.setSpeed = function(speed) {
        if (player != null) {
            player.playbackRate = speed;
        }
    };
    this.getUpdateData = function() {
        return {
            position: this.getPosition(),
            duration: this.getDuration(),
            speed: this.getSpeed()
        };
    };
}
/******************************************************************************/

/******************************************************************************/
//Setup
/******************************************************************************/
TVXPluginTools.onReady(function() {
    TVXVideoPlugin.setupPlayer(new Html5Player());
    TVXVideoPlugin.init();
});
/******************************************************************************/