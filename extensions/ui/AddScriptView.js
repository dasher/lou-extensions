/**
 * Created with JetBrains WebStorm.
 * User: BJOLLING
 * Date: 4/08/12
 * Time: 20:51
 * Released under the GNU General Public License version 3
 */

loader.addFinishHandler(function() {

    console.log(" *** lou_extensions.ui.AddScriptView ***");

    qx.Class.define("lou_extensions.ui.AddScriptView",
    {
        extend:qx.ui.window.Window,
        events : {
            "browse" : "qx.event.type.Event",
            "download"   : "qx.event.type.Event",
            "addScript" : "qx.event.type.Event",
            "cancel"   : "qx.event.type.Event"
        },
        construct:function () {

            this.base(arguments, "Add new script");

            this.addListener("resize", this.center);
            this.setShowMinimize(false);
            this.setWidth(400);
            this.setHeight(300);
            this.setContentPadding(5);

            var layout = new qx.ui.layout.Grid(9, 5);
            layout.setColumnAlign(0, "left", "top");
            layout.setColumnAlign(2, "right", "top");
            layout.setRowFlex(3, 1);
            layout.setColumnFlex(1, 1);
            this.setLayout(layout);

            // open file from File or Web
            var isFromFile = new qx.ui.form.RadioButton("File");
            var fileName = new lou_extensions.widgets.UploadField("fileName", "Browse...");
            var isFromUrl = new qx.ui.form.RadioButton("Url");
            var url = new qx.ui.form.TextField();
            var downloadUrlButton = new qx.ui.form.Button("Download");
            downloadUrlButton.setWidth(80);

            downloadUrlButton.addListener("execute", function() {
                this.fireEvent("download");
            }, this);

            var fromGroup = new qx.ui.form.RadioGroup();
            fromGroup.add(isFromFile, isFromUrl);
            isFromFile.setValue(true);

            isFromFile.bind("value", fileName, "enabled");
            isFromUrl.bind("value", url, "enabled");
            isFromUrl.bind("value", downloadUrlButton, "enabled");

            this.add(isFromFile, {row:0, column:0});
            this.add(fileName, {row:0, column:1, colSpan:2});
            //this.add(browseFileButton, {row:0, column:2})
            this.add(isFromUrl, {row:1, column:0});
            this.add(url, {row:1, column:1});
            this.add(downloadUrlButton, {row:1, column:2})

            // text area for script preview
            var label = new qx.ui.basic.Label("Script Preview:");
            this.add(label, {row:2, column:0, colSpan: 3} );
            var scriptContent = new qx.ui.form.TextArea();
            this.add(scriptContent, {row:3, column:0, colSpan: 3})

            fileName.bind("fileText", scriptContent, "value");

            // Toolbar action buttons
            var toolbar = new qx.ui.container.Composite();
            var fl = new qx.ui.layout.Flow(5,5);
            fl.setAlignX( "right" );
            toolbar.setLayout(fl);

            var cancelScriptButton = new qx.ui.form.Button("Cancel");
            cancelScriptButton.setWidth(80);
            toolbar.add(cancelScriptButton);
            var addScriptButton = new qx.ui.form.Button("Add Script");
            addScriptButton.setWidth(80);
            toolbar.add(addScriptButton);
            this.add(toolbar, {row: 4, column: 0, colSpan: 3});

            cancelScriptButton.addListener("execute", function() {
                this.close();
            }, this);

            addScriptButton.addListener("execute", function() {
                this.fireDataEvent("addScript", scriptContent.getValue());
            }, this);
        }
    });
});