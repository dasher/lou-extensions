/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:20
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.FoodCalculatorWidget");

    qx.Class.define("bos.gui.FoodCalculatorWidget", {
        type: "singleton",
        extend: webfrontend.gui.OverlayWidget,
        construct: function() {
            webfrontend.gui.OverlayWidget.call(this);

            this.clientArea.setLayout(new qx.ui.layout.VBox(5));

            this.setTitle(tr("food calculator"));
            var res = webfrontend.res.Main.getInstance();
            var scroll = new qx.ui.container.Scroll();
            this.clientArea.add(scroll, {flex: true});

            var box = new qx.ui.container.Composite(new qx.ui.layout.Dock());
            scroll.add(box);

            this.unitContainer = new qx.ui.groupbox.GroupBox();
            this.unitContainer.setLayout(new qx.ui.layout.Basic());
            box.add(this.unitContainer, {row: 0, column: 0});

            this.units = new Object;

            var maxUnitsPerColumn = 9;
            var unitHeight = 42;
            for (var key in res.units) {
                var u = res.units[key];
                if (u.x < 0 || u.y < 0) continue;
                var x = u.x * 560;
                var y = u.y * unitHeight;
                if (u.y >= maxUnitsPerColumn) {
                    x += 292;
                    y = (u.y - maxUnitsPerColumn) * unitHeight;
                }
                this.units[key] = this.createUnitSlot(x, y, u, this.unitContainer);
            }
            this.unitContainer.setMinHeight((maxUnitsPerColumn + 1) * unitHeight);

            this.clientArea.add(this.createFooter());

        },
        members: {
            units: null,
            unitContainer: null,
            summary: null,
            sbAdd: null,
            addDefendersFromReport: false,
            lblFoodConsumption: null,
            btnClear: null,
            btnCalc: null,
            activateOverlay: function(activated) {
                //nothing
            },
            clearAll: function() {
                this.clear(this.units);
            },
            clear: function(list) {
                for (var key in list) {
                    var inputs = list[key];
                    inputs.count.setValue(0);
                }
            },
            createUnitSlot: function(x, y, unit, container) {
                var res = webfrontend.res.Main.getInstance();
                var img = null;
                if (unit.mimg >= 0) {
                    var fi = res.getFileInfo(unit.mimg);
                    img = new qx.ui.basic.Image(webfrontend.config.Config.getInstance().getUIImagePath(fi.url));
                    img.setWidth(29);
                    img.setHeight(29);
                    img.setScale(true);

                    var tt = new qx.ui.tooltip.ToolTip(unit.dn);
                    img.setToolTip(tt);
                    container.add(img, {
                        left: x,
                        top: y + 6
                    });
                }

                var lblUnitName = new qx.ui.basic.Label(unit.dn);
                container.add(lblUnitName, {
                    left: x + 40,
                    top: y + 10
                });

                var countInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                countInput.setWidth(120);
                container.add(countInput, {
                    left: x + 120,
                    top: y + 6
                });
                a.setElementModalInput(countInput);

                var result = {
                    'image': img,
                    'count': countInput
                };
                return result;
            },
            spinnerTextUpdate: function(e) {
                if (e.getData().length == 0) this.buildCount.setValue(0);
            },
            createFooter: function() {
                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));

                var label;

                this.btnCalc = new qx.ui.form.Button(locale == "de" ? "Einheiten zu Nahrung" : "Units to food");
                this.btnCalc.setWidth(150);
                this.btnCalc.setToolTipText(locale == "de" ? "Berechnet den Nahrungsbedarf pro Stunde der aufgelisteten Einheiten" : "Calculates the food consumtion/h for the selected units");
                container.add(this.btnCalc);
                this.btnCalc.addListener("click", this.calculateFoodConsumption, this);

                this.btnRevCalc = new qx.ui.form.Button(locale == "de" ? "Nahrung zu Einheiten" : "Food to units");
                this.btnRevCalc.setToolTipText(locale == "de" ? "Berechnet die maximale Einheitenzahl für die eingegebene Nahrungsmenge" : "Calculates the max. unit count for the entered food");
                this.btnRevCalc.setWidth(150);
                container.add(this.btnRevCalc);
                this.btnRevCalc.addListener("click", this.calculateUnitsPerConsumption, this);

                this.btnClear = new qx.ui.form.Button(tr("clear"));
                this.btnClear.setWidth(70);
                container.add(this.btnClear);
                this.btnClear.addListener("click", this.clearAll, this);

                label = new qx.ui.basic.Label(locale == "de" ? "Nahrungsbedarf:" : "Consumption:");
                label.setMarginLeft(20);
                container.add(label);

                this.lblFoodConsumption = new qx.ui.basic.Label("");
                container.add(this.lblFoodConsumption);

                return container;
            },
            onAdd: function() {

            },
            calculateFoodConsumption: function() {

                var res = webfrontend.res.Main.getInstance();
                var sum = 0;
                for (var key in this.units) {
                    var u = res.units[key];
                    var inputs = this.units[key];

                    var count = parseInt(inputs.count.getValue(), 10);
                    if (count > 0) {
                        sum += count * u.f;
                    }
                }
                var perH = Math.round(sum / 24.0);
                this.lblFoodConsumption.setValue(perH + "/h");
            },
            calculateUnitsPerConsumption: function() {
                var s = prompt(locale == "de" ? "Bitte gebe das Nahrungseinkommen pro Stunde ein" : "Please enter food per hour");
                if (s != null && s != "") {
                    var foodPerHoour = parseInt(s, 10);
                    var res = webfrontend.res.Main.getInstance();


                    for (var key in this.units) {
                        var u = res.units[key];
                        var inputs = this.units[key];

                        var count = Math.round(24.0 * foodPerHoour / u.f);
                        inputs.count.setValue(count);
                    }
                    this.lblFoodConsumption.setValue("N/A");
                }
            }
        }
    });
});