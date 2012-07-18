/// Dynamic script loader for lou-extensions in Google Chrome.
"use strict";
/**
 * Dynamic injection of javascript and css files based on the list
 * of 'web_accessible_resources' in the manifest.json file
 * @namespace lou_extensions
 * @version 0.5.0
 */
(function (window, undefined) {
    var lou_extensions = window.lou_extensions = {};

    /**
     * Injects a link to a javascript file in the HEAD of a document.
     * @param {string} url - location of the javascript file to inject.
     * */
    lou_extensions.injectScriptLink = function (url, mimetype) {
        var scriptElement = document.createElement('script');
        scriptElement.setAttribute("type", mimetype);
        scriptElement.setAttribute("src", url);

        if (typeof scriptElement != "undefined")
            document.getElementsByTagName("head")[0].appendChild(scriptElement);
    };

    /**
     * Injects a link to a stylesheet in the HEAD of a document.
     * @param {string} url - location of the javascript file to inject.
     * */
    lou_extensions.injectLinkStylesheet = function (url, mimetype) {
        var linkElement = document.createElement("link");
        linkElement.setAttribute("rel", "stylesheet");
        linkElement.setAttribute("type", mimetype);
        linkElement.setAttribute("href", url);

        if (typeof linkElement != "undefined")
            document.getElementsByTagName("head")[0].appendChild(linkElement);
    };

    /**
     * Analyse the manifest.json to find the accessible js and css and injects them.
     * @param manifest
     */
    lou_extensions.loadExtensions = function (manifest) {
        if (manifest != null && manifest.web_accessible_resources != null) {
            for (var i = 0; i < manifest.web_accessible_resources.length; i++) {
                try {
                    var resource = manifest.web_accessible_resources[i];

                    if (resource.indexOf('.js', resource.length - 3) !== -1) {
                        lou_extensions.injectScriptLink(chrome.extension.getURL(resource), "text/javascript");

                    } else if (resource.indexOf('.css', resource.length - 4) !== -1) {
                        lou_extensions.injectLinkStylesheet(chrome.extension.getURL(resource),"text/css");
                    }
                } catch (e) {
                    console.log('[lou-extensions] - ' + e);
                }
            }
        }
    };

    window["lou_extensions"] = lou_extensions;
})(window);

/**
 * Main function
 */
try {
    console.log('[lou-extensions] Loading LOU extensions');

    if (chrome != undefined && chrome.extension != undefined) {
        var url = chrome.extension.getURL('manifest.json');

        // load extensions manifest.json file
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send();
        var manifest = JSON.parse(xhr.responseText);
        lou_extensions.loadExtensions(manifest);
    } else {
        console('[lou-extensions] Chrome extensions not available. No lou-extensions were injected');
    }
} catch (e) {
    console('[lou-extensions]' + e);
}

