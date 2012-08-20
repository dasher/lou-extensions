// ==UserScript==
// @name        lou-extensions
// @namespace   https://github.com/ConanLoxley/lou-extensions
// @description Collection of extensions for Lord of Ultima (http://www.lordofultima.com/)
// @include     http://prodgame*.lordofultima.com/*
// @downloadURL https://userscripts.org/scripts/source/138566.user.js
// @updateURL   https://bit.ly/PPzl0Y
// @version     0.6.0
// @run-at      document_end
// @resource    compat/compat.qooxdoo.js                     compat/compat.qooxdoo.js
// @resource    compat/compat.lou.js                         compat/compat.lou.js
// @resource    bos/greasemonkey.light.js                    bos/greasemonkey.light.js
// @resource    bos/sprintf-0.7-beta1.js                     bos/sprintf-0.7-beta1.js
// @resource    bos/const.js                                 bos/const.js
// @resource    bos/LocalizedStrings.js                      bos/LocalizedStrings.js
// @resource    bos/gui/ResourcesFillerWidget.js             bos/gui/ResourcesFillerWidget.js
// @resource    bos/BatchResourcesFiller.js                  bos/BatchResourcesFiller.js
// @resource    bos/ResourcesFiller.js                       bos/ResourcesFiller.js
// @resource    bos/Server.js                                bos/Server.js
// @resource    bos/Storage.js                               bos/Storage.js
// @resource    bos/net/CommandManager.js                    bos/net/CommandManager.js
// @resource    bos/Tweaks.js                                bos/Tweaks.js
// @resource    bos/Main.js                                  bos/Main.js
// @resource    bos/SharestringConverter.js                  bos/SharestringConverter.js
// @resource    bos/Utils.js                                 bos/Utils.js
// @resource    bos/CityTypes.js                             bos/CityTypes.js
// @resource    bos/City.js                                  bos/City.js
// @resource    bos/gui/SummaryPage.js                       bos/gui/SummaryPage.js
// @resource    bos/gui/TradeOrdersPage.js                   bos/gui/TradeOrdersPage.js
// @resource    bos/gui/TradeRouteWidget.js                  bos/gui/TradeRouteWidget.js
// @resource    bos/gui/PurifyOptionsWidget.js               bos/gui/PurifyOptionsWidget.js
// @resource    bos/gui/PurifyResourcesPage.js               bos/gui/PurifyResourcesPage.js
// @resource    bos/gui/TradeRoutesPage.js                   bos/gui/TradeRoutesPage.js
// @resource    bos/gui/MyAlliancePage.js                    bos/gui/MyAlliancePage.js
// @resource    bos/gui/IntelligenceOptionsWidget.js         bos/gui/IntelligenceOptionsWidget.js
// @resource    bos/gui/IntelligencePage.js                  bos/gui/IntelligencePage.js
// @resource    bos/gui/PlayerInfoPage.js                    bos/gui/PlayerInfoPage.js
// @resource    bos/gui/AllianceInfoPage.js                  bos/gui/AllianceInfoPage.js
// @resource    bos/gui/IncomingAttacksPage.js               bos/gui/IncomingAttacksPage.js
// @resource    bos/gui/MassRecruitmentOptionsWidget.js      bos/gui/MassRecruitmentOptionsWidget.js
// @resource    bos/gui/MassRecruitmentPage.js               bos/gui/MassRecruitmentPage.js
// @resource    bos/gui/UnitOrdersPage.js                    bos/gui/UnitOrdersPage.js
// @resource    bos/gui/RegionPage.js                        bos/gui/RegionPage.js
// @resource    bos/gui/DungeonsPage.js                      bos/gui/DungeonsPage.js
// @resource    bos/gui/CastlesPage.js                       bos/gui/CastlesPage.js
// @resource    bos/gui/CitiesPage.js                        bos/gui/CitiesPage.js
// @resource    bos/gui/OptionsPage.js                       bos/gui/OptionsPage.js
// @resource    bos/gui/MilitaryPage.js                      bos/gui/MilitaryPage.js
// @resource    bos/gui/DefendersPage.js                     bos/gui/DefendersPage.js
// @resource    bos/gui/ExtraSummaryWidget.js                bos/gui/ExtraSummaryWidget.js
// @resource    bos/gui/SummaryWidget.js                     bos/gui/SummaryWidget.js
// @resource    bos/gui/FoodCalculatorWidget.js              bos/gui/FoodCalculatorWidget.js
// @resource    bos/gui/RecruitmentSpeedCalculatorWidget.js  bos/gui/RecruitmentSpeedCalculatorWidget.js
// @resource    bos/gui/CombatCalculatorWidget.js            bos/gui/CombatCalculatorWidget.js
// @resource    bos/ui/table/cellrenderer/Default.js         bos/ui/table/cellrenderer/Default.js
// @resource    bos/ui/table/cellrenderer/HumanTime.js       bos/ui/table/cellrenderer/HumanTime.js
// @resource    bos/ui/table/cellrenderer/ClickableLook.js   bos/ui/table/cellrenderer/ClickableLook.js
// @resource    bos/ui/table/cellrenderer/Resource.js        bos/ui/table/cellrenderer/Resource.js
// @resource    bos/ui/table/cellrenderer/FullAt.js          bos/ui/table/cellrenderer/FullAt.js
// @resource    bos/ui/table/Table.js                        bos/ui/table/Table.js

// ==/UserScript==

/**
 * Injects a link to a javascript file in the HEAD of a document.
 * @param {string} jsContent - Source code of script to inject
 * @param {string} mimeType - type of script e.g. "text/javascript"
 * @param {string} scriptId - assigns an Id to the script tag
 */
function injectScript (jsContent, mimeType, scriptId) {
    var scriptElement = document.createElement('script');
    scriptElement.setAttribute("type", mimeType);
    scriptElement.setAttribute("id", scriptId);
    scriptElement.innerHTML = jsContent;
    document.getElementsByTagName("head")[0].appendChild(scriptElement);
};

/**
 * Injects a link to a stylesheet in the HEAD of a document.
 * @param {string} cssContent - css code to inject
 * @param {string} mimeType - type of css e.g. "text/css"
 * @param {string} styleId - assigns an Id to the style tag
 */
function injectStyle (cssContent, mimeType, styleId) {
    var styleElement = document.createElement("style");
    styleElement.setAttribute("type", mimeType);
    styleElement.setAttribute("id", styleId);
    styleElement.innerHTML = cssContent;
    document.getElementsByTagName("head")[0].appendChild(styleElement);
};

/**
 * Analyse the GM_info to find the resource js and injects them.
 * @param manifest
 */
function loadExtensions(info) {

    if (("resources" in info) &&  (info.resources !== null)) {

        for (var i = 0; i < info.resources.length; i++) {
            var resourceName = info.resources[i];
            console.log('[lou-extensions] - register ' + resourceName);

            var text = GM_getResourceText(resourceName);
            var mimeType = /data:(.+?);/.exec(GM_getResourceURL(resourceName))[1];

            if(mimeType.indexOf('script') > -1 ) {
                injectScript(text, mimeType, resourceName);
            } else if(mimeType.indexOf('css') > -1) {
                injectStyle(text, mimeType, resourceName);
            }
            else {
                console.log("Don't know how to inject a resource with mime-type: "
                    + mimeType + ". Resource name: " + resourceName);
            }
        }
    }
}
;

/**
 * Gets the GM_info and adds an array of resource names defined in the meta data
 * @returns {Object} GM_info with possibly empty array of resource names
 */
function getScriptMetaData(){

    //built-in meta data
    var info = GM_info;

    //add resources from meta data
    if( !("resources" in info) ) {
        info.resources = [];
        var resources = info.scriptMetaStr.match(/\/\/ @resource.*/g);

        if (resources != null) {
            for (var i = 0; i < resources.length; i++) {
                var resourceName = resources[i].split(/\b\s+/)[1];
                info.resources.push(resourceName);
            }
        }
    }
    return info;
}

/**
 * Main function
 */
try {
    console.log("[lou-extensions] Loading LOU extensions.");

    var info = getScriptMetaData();

    if( info.resources.length > 0 ) {
        loadExtensions(info);
    } else {
        console.log("[lou-extensions] No resources found in MetaData block. No lou-extensions were injected");
    }
} catch (e) {
    console.log("[lou-extensions]" + e.toSource());
}