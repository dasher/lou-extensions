/**
 * Injects a link to a javascript file in the HEAD of a document.
 * @param {string} jsContent - Source code of script to inject
 * @param {string} mimeType - type of script e.g. "text/javascript"
 * @param {string} scriptId - assigns an Id to the script tag
 */
function injectScript(jsContent, mimeType, scriptId) {
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
function injectStyle(cssContent, mimeType, styleId) {
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
	
	if (("resources" in info) && (info.resources !== null)) {
		
		for (var i = 0; i < info.resources.length; i++) {
			var resourceName = info.resources[i];
			console.log('[lou-extensions] - register ' + resourceName);
			
			var text = GM_getResourceText(resourceName);
			
			//https://github.com/ConanLoxley/lou-extensions/issues/4
			//As of Greasemonkey 1.0, detection of the resource's mimetype has changed.
			//var mimeType = /data:(.+?);/.exec(GM_getResourceURL(resourceName))[1];
			
			debugger;
			
			try {
				if (resourceName.indexOf('.js', resourceName.length - 3) !== -1) {
					injectScript(text, "text/javascript", resourceName);
					
				} else if (resourceName.indexOf('.css', resourceName.length - 4) !== -1) {
					injectStyle(text, "text/css", resourceName);
				} else {
					console.log("Don't know how to inject a resource with this file extension. "
						 + "Resource name: " + resourceName);
				}
			} catch (e) {
				console.log('[lou-extensions] - ' + e);
			}
		}
	}
};

/**
 * Gets the GM_info and adds an array of resource names defined in the meta data
 * @returns {Object} GM_info with possibly empty array of resource names
 */
function getScriptMetaData() {
	
	//built-in meta data
	var info = GM_info;
	
	//add resources from meta data
	if (!("resources" in info)) {
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
	
	if (info.resources.length > 0) {
		loadExtensions(info);
	} else {
		console.log("[lou-extensions] No resources found in MetaData block. No lou-extensions were injected");
	}
} catch (e) {
	console.log("[lou-extensions]" + e.toSource());
}
