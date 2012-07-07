/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:23
 */
(function (window, undefined) {
    qx.Class.define("bos.gui.PurifyOptionsWidget", {
        type: "singleton",
        extend: qx.ui.window.Window,
        construct: function() {
            qx.ui.window.Window.call(this);

            this.set({
                width: 300,
                minWidth: 200,
                maxWidth: 700,
                height: 280,
                minHeight: 200,
                maxHeight: 700,
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: (tr("purify options")),
                resizeSensitivity: 7,
                contentPadding: 0
            });

            this.setLayout(new qx.ui.layout.VBox(10, 10));

            var storage = bos.Storage.getInstance();
            var purifyOptions = storage.getPurifyOptions();

            var container = new qx.ui.groupbox.GroupBox();
            container.setLayout(new qx.ui.layout.VBox(10, 10));
            this.add(container);

            var box = new qx.ui.container.Composite(new qx.ui.layout.Grid(10, 10));
            container.add(box);

            this._inputs = new Array();
            this._inputs.push(null);
            var row = 0;
            var purifiedRes = ["", "darkwood", "runestone", "veritum", "trueseed"];
            for (var i = 1; i <= 4; i++) {
                var name = purifiedRes[i];
                var lbl = new qx.ui.basic.Label(tr(name));
                var input = this._createMinimumResLevelInput();
                this._inputs.push(input);
                input.setValue(purifyOptions.minimumResLevels[i]);

                box.add(lbl, {row: row, column: 1});
                box.add(input, {row: row, column: 0});

                row++;
            }

            this.cbIncludeCastles = new qx.ui.form.CheckBox(tr("cbIncludeCastles"));
            this.cbIncludeCastles.setToolTipText(tr("cbIncludeCastles_toolTip"));
            this.cbIncludeCastles.setValue(purifyOptions.includeCastles);
            container.add(this.cbIncludeCastles);

            row++;

            this.cbUseRecruitmentData = new qx.ui.form.CheckBox(tr("cbUseRecruitmentData"));
            this.cbUseRecruitmentData.setToolTipText(tr("cbUseRecruitmentData_toolTip"));
            this.cbUseRecruitmentData.setValue(purifyOptions.useRecruitmentData);
            container.add(this.cbUseRecruitmentData);

            row++;

            var btnSave = new qx.ui.form.Button(tr("save"));
            btnSave.setWidth(60);
            this.add(btnSave);
            btnSave.addListener("execute", this.confirm, this);

            row++;

            webfrontend.gui.Util.formatWinClose(this);

            this.moveTo(400, 200);
        },
        members: {
            _inputs: null,
            cbIncludeCastles: null,
            _createMinimumResLevelInput: function() {
                var ministerBuildPresent = webfrontend.data.Player.getInstance().getMinisterTradePresent();
                if (ministerBuildPresent) {
                    var _minimumResLevelInput = new webfrontend.gui.SpinnerInt(0, 20, 90);
                    _minimumResLevelInput.setToolTipText(tr("_minimumResLevelInput_toolTip"));
                    _minimumResLevelInput.setWidth(60);
                    return _minimumResLevelInput;
                } else {
                    _minimumResLevelInput = new webfrontend.gui.SpinnerInt(0, 50000, 50000000);
                    _minimumResLevelInput.setToolTipText(tr("_minimumResLevelInput_absolute_toolTip"));
                    _minimumResLevelInput.setWidth(100);
                    return _minimumResLevelInput;
                }
            },
            confirm: function() {

                purifyOptions = {
                    includeCastles: this.cbIncludeCastles.getValue(),
                    useRecruitmentData: this.cbUseRecruitmentData.getValue()
                };
                purifyOptions.minimumResLevels = new Array();
                purifyOptions.minimumResLevels.push(0);

                for (var i = 1; i <= 4; i++) {
                    var input = this._inputs[i];
                    var val = parseInt(input.getValue(), 10);
                    purifyOptions.minimumResLevels.push(val);
                }

                var storage = bos.Storage.getInstance();
                storage.savePurifyOptions(purifyOptions);

                this.close();
            }
        }
    });
})(window);