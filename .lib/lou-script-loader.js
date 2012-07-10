function loader() {
}
;

loader.supportFlash = function () {
    if (window.ActiveXObject !== undefined) {
        try {
            var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            return (axo != null);
        }
        catch (e) {
            return false;
        }
    }

    return true;
}

loader.loadSoundConfig = function () {
    try {
        if (window.localStorage !== undefined) {
            var localconfig = window.localStorage.getItem(storePrefix + "Audio");

            if (localconfig != null) {
                if (typeof (JSON) != 'undefined')
                    localconfig = JSON.parse(localconfig);
                else
                    localconfig = eval('(' + localconfig + ')');

                if (localconfig.on != undefined)
                    soundConfig.on = localconfig.on;

                if (localconfig.music != undefined)
                    soundConfig.music = localconfig.music;

                if (localconfig.ambient != undefined)
                    soundConfig.ambient = localconfig.ambient;

                if (localconfig.ui != undefined)
                    soundConfig.ui = localconfig.ui;
            }
        }
    }
    catch (e) {
    }

    this.updateSound();
}

loader.toggleSound = function () {
    soundConfig.on = !soundConfig.on;
    this.updateSound();

    if (loader.onSoundChange != null)
        loader.onSoundChange();
}

loader.updateSound = function () {
    try {
        if (window.localStorage !== undefined && typeof (JSON) != 'undefined') {
            window.localStorage.setItem(storePrefix + "Audio", JSON.stringify(soundConfig));
        }
    }
    catch (e) {
    }

    document.getElementById("soundctrl").style.backgroundPosition = soundConfig.on ? "-41px 0px" : "0px 0px";

    if (this.soundSM2Object) {
        if (soundConfig.on)
            this.soundSM2Object.unmute();
        else
            this.soundSM2Object.mute();

        return;
    }

    if (this.soundHtml5Object) {
        if (soundConfig.on)
            this.soundHtml5Object.volume = (soundConfig.music / 100);
        else
            this.soundHtml5Object.volume = 0;

        return;
    }

    if (this.supportSound && soundConfig.on) {
        if (loader.canHTML5Audio)
            this.startHtml5Sound();
        else
            this.startSM2Sound();
    }
}

loader.startSM2Sound = function () {
    loader.soundSM2Object = soundManager.createSound({
        id:'loading',
        url:TOD_Sound + '.mp3',
        volume:soundConfig.music,
        onfinish:loader.soundSM2End
    });
    loader.soundSM2Object.play();
}

loader.soundSM2End = function () {
    delete loader.soundSM2Object;
    loader.soundSM2Object = null;

    if (loader.onIntroDone != null)
        loader.onIntroDone();
}

loader.startHtml5Sound = function () {
    loader.soundHtml5Object = new Audio(TOD_Sound + (loader.canPlayMp3 ? ".mp3" : ".ogg"));
    loader.soundHtml5Object.volume = (soundConfig.music / 100);
    loader.soundHtml5Object.autoplay = true;
    loader.soundHtml5Object.addEventListener("ended", function () {
        document.body.removeChild(loader.soundHtml5Object);
        delete loader.soundHtml5Object;
        loader.soundHtml5Object = null;

        if (loader.onIntroDone != null)
            loader.onIntroDone();
    }, true);
    document.body.appendChild(loader.soundHtml5Object);
}

loader.isPlayingIntro = function () {
    return (loader.soundHtml5Object != null || loader.soundSM2Object != null)
}

loader.setVolume = function (on, volume) {
    soundConfig.on = on;
    soundConfig.music = volume;

    if (!on)
        volume = 0;

    if (loader.soundHtml5Object)
        loader.soundHtml5Object.volume = (volume / 100);

    if (loader.soundSM2Object)
        loader.soundSM2Object.setVolume(volume);
}

loader.centerdiv = function (divid) {
    var scrolledX, scrolledY;
    if (self.pageYOffset) {
        scrolledX = self.pageXOffset;
        scrolledY = self.pageYOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {
        scrolledX = document.documentElement.scrollLeft;
        scrolledY = document.documentElement.scrollTop;
    } else if (document.body) {
        scrolledX = document.body.scrollLeft;
        scrolledY = document.body.scrollTop;
    }

    var centerX, centerY;
    if (self.innerHeight) {
        centerX = self.innerWidth;
        centerY = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) {
        centerX = document.documentElement.clientWidth;
        centerY = document.documentElement.clientHeight;
    } else if (document.body) {
        centerX = document.body.clientWidth;
        centerY = document.body.clientHeight;
    }

    var o = document.getElementById(divid);
    var r = o.style;

    var leftOffset = scrolledX + (centerX - o.offsetWidth) / 2;
    var topOffset = scrolledY + (centerY - o.offsetHeight) / 2;
    r.top = topOffset + 'px';
    r.left = leftOffset + 'px';
    r.display = "block";
}

loader.updateDownload = function () {
    if (loader.downloadScript.size <= 0)
        return;

    var p = loader.downloadScript.done / loader.downloadScript.size;
    document.getElementById("progressBar").style.width = (p * 254).toString() + "px";

    if (loader.complete == false && loader.downloadScript.done == loader.downloadScript.size) {
        loader.complete = true;

        // Make chrome happy
        setTimeout(function () {
            var code = loader.downloadScript.data.join('');
            eval(code);

            /*                    {
             var elem = document.createElement("script");
             elem.charset = "utf-8";
             elem.text = code;
             var head = document.getElementsByTagName("head")[0];
             head.appendChild(elem);
             }*/

            delete loader.downloadScript;

            if (loader.helperFrame) {
                document.body.removeChild(loader.helperFrame);
                delete loader.helperFrame;
                loader.helperFrame = null;
            }

            if (loader.finishHandler !== undefined) {
                for (var i = 0; i < loader.finishHandler.length; i++)
                    loader.finishHandler[i]();
            }

        }, 0);
    }
}

loader.onScriptSize = function (size) {
    loader.lastDownloadTime = (new Date).getTime();
    loader.downloadScript.size = size;
    loader.updateDownload();
}

loader.onScriptData = function (data) {
    loader.lastDownloadTime = (new Date).getTime();
    loader.downloadScript.data.push(data);
    loader.downloadScript.done += data.length;
    loader.updateDownload();
}

loader.startDownload = function () {
    loader.lastDownloadTime = (new Date).getTime();
    var frame = document.createElement("iframe");
    frame.style.position = "absolute";
    frame.style.top = "-100px";
    frame.style.left = "-100px";
    frame.style.width = "0px";
    frame.style.height = "0px";
    body = document.body;
    body.insertBefore(frame, body.firstChild);
    loader.helperFrame = frame;

    var path = "data_" + Language + ".html";

    if (typeof (LandingPageURL) != 'undefined' && typeof (PerforceChangelist) != 'undefined' && PerforceChangelist > 0)
        path = PerforceChangelist.toString() + '/' + path;

    frame.src = path
}

loader.onSM2Loaded = function () {
    soundManager = new SoundManager();

    soundManager.onready(function (oStatus) {
        loader.startDownload();

        if (!oStatus.success) {
            loader.supportSound = false;
            return;
        }

        loader.canPlayMp3 = true;
        loader.supportSound = true;

        if (soundConfig.on)
            loader.startSM2Sound();
    });
}

// use this to add functions that should be called after loading is complete
loader.addFinishHandler = function (func) {
    if (loader.finishHandler == undefined)
        loader.finishHandler = new Array();

    loader.finishHandler.push(func);
}

window.onload = function () {
    loader.centerdiv("loadingscreen");

    try {
        myAudio = new Audio("");

        if (myAudio.canPlayType) {
            loader.canPlayOgg = ("no" != myAudio.canPlayType("audio/ogg")) && ("" != myAudio.canPlayType("audio/ogg"));
            loader.canPlayMp3 = ("no" != myAudio.canPlayType("audio/mpeg")) && ("" != myAudio.canPlayType("audio/mpeg"));
        }
    }
    catch (e) {
        loader.canPlayOgg = false;
        loader.canPlayMp3 = false;
    }

    loader.canHTML5Audio = loader.canPlayOgg || loader.canPlayMap3;

    document.getElementById("tod_image").setAttribute("src", TOD_Image);
    document.getElementById("tip_title").innerHTML = TOD_Title;
    ;
    document.getElementById("tip_text").innerHTML = TOD_Text;
    document.getElementById("tip_loading").innerHTML = TOD_Loading;

    loader.downloadScript = { done:0, size:-1, data:new Array() };
    loader.downloadScript.data.push("window.qx={};qx.$$domReady = true;");
    loader.complete = false;

    if (loader.canHTML5Audio) {
        loader.supportSound = true;
        loader.loadSoundConfig();
        loader.startDownload();
    }
    else {
        if (loader.supportFlash()) {
            var elem = document.createElement("script");
            elem.charset = "utf-8";
            var path = "script/soundmanager2.js";

            if (typeof (LandingPageURL) != 'undefined' && typeof (PerforceChangelist) != 'undefined' && PerforceChangelist > 0)
                path = PerforceChangelist.toString() + '/' + path;

            elem.src = path;

            var head = document.getElementsByTagName("head")[0];
            head.appendChild(elem);

            // load SM2
            loader.loadSoundConfig();
        }
        else {
            loader.supportSound = false;
            loader.loadSoundConfig();
            loader.startDownload();
        }
    }

    loader.updateInterval = setInterval(function () {
        loader.centerdiv("loadingscreen");

        /*                if (loader.lastDownloadTime !== undefined)
         {
         var diff = (new Date).getTime() - loader.lastDownloadTime;

         if (diff > 5000 && loader.complete == false)
         {
         window.location.href = TOD_ErrorURL;
         }
         }*/

    }, 100);
}