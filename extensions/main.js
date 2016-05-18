/**
 * Created with JetBrains WebStorm.
 * User: BJOLLING
 * Date: 12/08/12
 * Time: 20:55
 * Released under the GNU General Public License version 3
 */

loader.addFinishHandler(function() {

    console.log("[lou_extensions] Define lou_extensions.main");

    qx.Class.define("lou_extensions.main", {
        type : "singleton",
        extend : qx.core.Object,
        members : {
            app: null,
            serverBar: null,
            addScriptView: null,
            initialize : function () {
                try {
                    // button to manage scripts //
                    btn = new qx.ui.form.Button("X");
                    btn.set({width: 30, appearance: "button-text-small", toolTipText: "Open lou-extensions"});
                    btn.addListener("click", this.showManageScriptView, this);
                    this.serverBar.add(btn, {top: 2, left: 430});
                } catch (e) {
                    console.log("[lou_extensions] ERROR lou_extensions.main.initialize: " + e);
                }
            },
            showManageScriptView : function () {
                debugger;
                if(!(this.addScriptView)) {
                    this.addScriptView = new lou_extensions.ui.AddScriptView();
                };
                this.addScriptView .show();
            }
        },
        construct : function() {
            this.app = qx.core.Init.getApplication();
            this.serverBar = this.app.serverBar;
        }
    });

    function StartLouExtensions(){
        var app = qx.core.Init.getApplication();
        if( app && app.serverBar ) {
            console.log("[lou_extensions] StartLouExtensions");
            lou_extensions.main.getInstance().initialize();
        } else {
            console.log("[lou_extensions] Retrying StartLouExtensions");
            window.setTimeout(StartLouExtensions, 1000);
        }
    }

    //Start lou_extensions;
    StartLouExtensions();

});
