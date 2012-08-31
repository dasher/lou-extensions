/**
 * Created by TriMoon <http://claimid.com/trimoon>
 * Date: 2012/08/29
 * LoU Tweak:
 * 		Author: AmpliDude
 * 		Script: http://userscripts.org/scripts/show/80532
 */
function LT_checkIfLoaded() {
	console.log("[LT_checkIfLoaded] Try loading louTweak");
	try {
		if (typeof qx != 'undefined') {
			a = qx.core.Init.getApplication(); // application
			c = a.cityInfoView;
			ch = a.chat;
			wdst = webfrontend.data.ServerTime.getInstance().refTime;
			if (a && c && ch && wdst) {
				console.log("[LT_checkIfLoaded] Initialize louTweak.main");
				window.louTweak.main.getInstance().initialize();
			} else {
				console.log("[LT_checkIfLoaded] Retrying in a second because application is not yet ready");
				window.setTimeout(LT_checkIfLoaded, 1000);
			}
		} else {
			console.log("[LT_checkIfLoaded] Retrying in a second because application is not yet ready");
			window.setTimeout(LT_checkIfLoaded, 1000);
		}
	} catch (e) {
		if (typeof console != 'undefined') console.log(e);
		else if (window.opera) opera.postError(e);
		else GM_log(e);
	}
}
loader.addFinishHandler(LT_checkIfLoaded);
