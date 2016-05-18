/**
 * Created with JetBrains WebStorm.
 * User: BJOLLING
 * Date: 18/08/12
 * Time: 17:28
 * Released under the GNU General Public License version 3
 */
 
 loader.addFinishHandler(function() {

    console.log(" *** lou_extensions.ui.ListScriptView ***");

qx.Class.define("lou_extensions.ui.ListScriptView",
    {
        extend:qx.ui.window.Window,

        construct:function () {
            this.base(arguments, "Installed Scripts");

            this.setShowMinimize(false);
            this.setWidth(400);
            this.setHeight(300);
            this.setContentPadding(5);

            var layout = new qx.ui.layout.Grid(9, 5);
            layout.setRowFlex(1, 1);
            layout.setColumnFlex(0, 1);
            this.setLayout(layout);

            // Toolbar action buttons
            var toolbar = new qx.ui.container.Composite();
            var fl = new qx.ui.layout.Flow(5,5);
            fl.setAlignX( "right" );
            toolbar.setLayout(fl);
            this.add(toolbar, {row: 0, column: 0});

            // reload button
            var addScriptButton = new qx.ui.toolbar.Button("Add New Script...");
            addScriptButton.setToolTipText("Add new scripts to list");
            addScriptButton.addListener("execute", function() {
                this.fireEvent("addScript");
            }, this);
            toolbar.add(addScriptButton);

            // list of installed extensions
            var scriptList = new qx.ui.form.List();
            this.add(scriptList, {row: 1, column: 0});

        },

        // --------------------------------------------------------------------------
        // [Events]
        // --------------------------------------------------------------------------

        events : {
            "injectScript" : "qx.event.type.Event",
            "ejectScript" : "qx.event.type.Event",
            "addScript" : "qx.event.type.Event",
            "removeScript" : "qx.event.type.Event",
            "close"   : "qx.event.type.Event"
        },

        // --------------------------------------------------------------------------
        // [Members]
        // --------------------------------------------------------------------------
        members : {

        }
    }
);
});