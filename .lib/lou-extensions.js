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
			console.log('[lou-extensions] - register ' + info.resources[i].name);
			
			// grab contents of resource-file.
			var ResourceContent = GM_getResourceText(info.resources[i].name);
		//	console.info(ResourceContent);
			// grab part after the last dot.
			var ResourceFilext = /\w+$/g.exec(info.resources[i].src)[0];
		//	console.info(ResourceFilext);
			
		//	debugger;
			
			try {
				switch( ResourceFilext ){
				case "js":
					injectScript(ResourceContent, "text/javascript", info.resources[i].name);
					break;
				case "css":
					injectStyle(ResourceContent, "text/css", info.resources[i].name);
					break;
				default:
					console.log("Don't know how to inject a resource with this file extension."
						 + "\n\tResource name: " + info.resources[i].name
						 + "\n\tResource extension: " + ResourceFilext
					);
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
				var resourceLine = resources[i].split(/\b\s+/);
				info.resources.push({
					name: resourceLine[1],
					src: resourceLine[2]
				});
			}
		}
	}
//	console.info(info);
	return info;
}
