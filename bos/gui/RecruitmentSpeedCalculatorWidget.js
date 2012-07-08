/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:22
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.RecruitmentSpeedCalculatorWidget");

    qx.Class.define("bos.gui.RecruitmentSpeedCalculatorWidget", {
        type: "singleton",
        extend: webfrontend.gui.OverlayWidget,
        construct: function() {
            webfrontend.gui.OverlayWidget.call(this);

            this.clientArea.setLayout(new qx.ui.layout.VBox(5));

            this.setTitle(locale == "de" ? "Rekutiergeschwindigkeits Kalkulator" : "Recruitment speed calculator");
            var res = webfrontend.res.Main.getInstance();
            var scroll = new qx.ui.container.Scroll();
            this.clientArea.add(scroll, {flex: true});

            var box = new qx.ui.container.Composite(new qx.ui.layout.Dock());
            scroll.add(box, {flex: true});

            this.mainContainer = new qx.ui.groupbox.GroupBox();
            this.mainContainer.setLayout(new qx.ui.layout.Grid(10, 10));
            box.add(this.mainContainer, {edge: "center"});

            this.config = [
                {buildingId: "15", units: ["1"], times: [50]},
                {buildingId: "16", units: ["6", "3", "4"], times: [200, 250, 300]},
                {buildingId: "36", units: ["7", "12"], times: [600, 1300]},
                {buildingId: "17", units: ["8", "11", "9"], times: [300, 500, 600]},
                {buildingId: "18", units: ["13", "2", "14"], times: [2500, 3500, 4000]},
                {buildingId: "19", units: ["16", "15", "17"], times: [25000, 40000, 80000]},
                {buildingId: "37", units: ["5", "10", "19"], times: [350, 700, 60000]}
            ];

            for (var row = 0; row < this.config.length; row++) {
                var o = this.config[row];
                o.result = this._addRow(row + 1, o.buildingId, o.units);
            }

            this.mainContainer.setMinHeight(100);

            this.clientArea.add(this.createFooter());

            this.calculate();
        },
        members: {
            mainContainer: null,
            sbUnitTypes: null,
            btnClear: null,
            btnCalc: null,
            btnReverseCalc: null,
            activateOverlay: function(activated) {
                //nothing
            },
            clearAll: function() {
                for (var i = 0; i < this.config.length; i++) {
                    var c = this.config[i];
                    var inputs = c.result;
                    inputs.speed.setValue(100);
                }
                this.calculate();

            },
            _addRow: function(row, buildingId, units) {
                var res = webfrontend.res.Main.getInstance();
                var result = new Object();

                var label;

                label = new qx.ui.basic.Label(res.buildings[buildingId].dn);
                this.mainContainer.add(label, {
                    row: row,
                    column: 0
                });

                result.speed = new webfrontend.gui.SpinnerInt(0, 100, 1000000);
                result.speed.setWidth(80);
                this.mainContainer.add(result.speed, {
                    row: row,
                    column: 1
                });

                result.units = [];
                for (var i = 0; i < units.length; i++) {
                    var unit = units[i];
                    label = new qx.ui.basic.Label(res.units[unit].dn);
                    this.mainContainer.add(label, {
                        row: row,
                        column: i + 2
                    });
                    result.units.push(label);
                }

                return result;
            },
            createFooter: function() {
                var box = new qx.ui.container.Composite(new qx.ui.layout.Flow(5, 5));

                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));
                box.add(container);

                var label;

                this.btnCalc = new qx.ui.form.Button(locale == "de" ? "Berechne" :"Calculate");
                this.btnCalc.setWidth(120);
                container.add(this.btnCalc);
                this.btnCalc.addListener("click", this.calculate, this);

                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));
                box.add(container);

                this.sbUnitTypes = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                var res = webfrontend.res.Main.getInstance();
                for (var key in res.units) {
                    var u = res.units[key];
                    if (parseInt(key) > 19) {
                        break;
                    }
                    this.sbUnitTypes.add(new qx.ui.form.ListItem(u.dn, null, key));
                }
                container.add(this.sbUnitTypes);

                this.btnRevCalc = new qx.ui.form.Button(locale == "de" ? "Zeit zu Prozentsatz" : "Time to speed");
                this.btnRevCalc.setWidth(120);
                container.add(this.btnRevCalc);
                this.btnRevCalc.addListener("click", this.timeToSpeedCalculate, this);

                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));
                box.add(container);

                this.btnClear = new qx.ui.form.Button(tr("clear"));
                this.btnClear.setWidth(120);
                container.add(this.btnClear);
                this.btnClear.addListener("click", this.clearAll, this);

                return box;
            },
            timeToSpeedCalculate: function() {
                var reqUnitId = this.sbUnitTypes.getSelection()[0].getModel();
                var s = prompt(locale == "de" ? "Bitte gebe die Rekrutierzeit in Sekunden an." : "Please enter recruitment time in seconds:");
                if (s != null && s != "") {
                    var unitEvery = parseInt(s, 10);
                    if (unitEvery <= 0) {
                        bos.Utils.handleWarning("Invalid value");
                        return;
                    }

                    for (var i = 0; i < this.config.length; i++) {
                        var c = this.config[i];
                        var inputs = c.result;

                        for (var j = 0; j < c.units.length; j++) {
                            var unitId = c.units[j];
                            if (reqUnitId == unitId) {

                                var speed = Math.round((c.times[j] * 100) / (unitEvery + 0.4999999)) + 1;
                                inputs.speed.setValue(speed)

                                i = this.config.length;
                                break;
                            }
                        }

                    }

                    this.calculate();
                }
            },
            calculate: function() {

                var res = webfrontend.res.Main.getInstance();

                for (var i = 0; i < this.config.length; i++) {
                    var c = this.config[i];
                    var inputs = c.result;
                    var speed = parseInt(inputs.speed.getValue());

                    for (var j = 0; j < c.units.length; j++) {
                        var unitId = c.units[j];
                        var label = inputs.units[j];
                        var unitEvery = Math.max(1, Math.round((c.times[j] * 100) / speed));
                        label.setValue(res.units[unitId].dn + ": " + unitEvery + "s");
                        label.setToolTipText(webfrontend.Util.getTimespanString(unitEvery));
                    }

                }
            }
        }
    });
});