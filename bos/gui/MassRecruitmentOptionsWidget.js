/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:30
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.MassRecruitmentOptionsWidget");

    qx.Class.define("bos.gui.MassRecruitmentOptionsWidget", {
        extend: qx.ui.window.Window,
        construct: function() {
            qx.ui.window.Window.call(this);

            this.set({
                width: 640,
                minWidth: 200,
                maxWidth: 700,
                height: 540,
                minHeight: 200,
                maxHeight: 700,
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: (tr("mass recruitment")),
                resizeSensitivity: 7,
                contentPadding: 0
            });

            this.setLayout(new qx.ui.layout.VBox(5));

            var res = webfrontend.res.Main.getInstance();
            var scroll = new qx.ui.container.Scroll();
            this.add(scroll, {flex: true});

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
                this.units[key] = this.createUnitSlot(x, y, u, this.unitContainer, key);
            }
            this.unitContainer.setMinHeight((maxUnitsPerColumn + 1) * unitHeight);

            this.lblUnitsInCity = new qx.ui.basic.Label(tr("in city:"));
            this.unitContainer.add(this.lblUnitsInCity, {
                left: 2,
                top: maxUnitsPerColumn * unitHeight + 10
            });

            this.add(this.createFooter());

            webfrontend.gui.Util.formatWinClose(this);

            this.moveTo(400, 200);

        },
        members: {
            units: null,
            unitContainer: null,
            lblUtilisation: null,
            editedOrder: null,
            productionInfo: null,
            lblUnitsInCity: null,
            clearAll: function() {
                this.clear(this.units);
            },
            clear: function(list) {
                for (var key in list) {
                    var inputs = list[key];
                    inputs.count.setValue(0);
                }
            },
            createUnitSlot: function(x, y, unit, container, unitType) {
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
                lblUnitName.setRich(true);
                container.add(lblUnitName, {
                    left: x + 40,
                    top: y + 10
                });

                var countInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                countInput.addListener("changeValue", this.updateView, this);
                countInput.setWidth(100);
                container.add(countInput, {
                    left: x + 120,
                    top: y + 6
                });
                qx.core.Init.getApplication().setElementModalInput(countInput);

                var btnMax = new qx.ui.form.Button("Max");
                btnMax.setWidth(50);
                container.add(btnMax, {
                    left: x + 230,
                    top: y + 6
                });
                btnMax.addListener("click", function(event) {
                    this._toMax(unitType);
                }, this);

                var result = {
                    'image': img,
                    'count': countInput,
                    'label': lblUnitName,
                    'name': unit.dn
                };
                return result;
            },
            createFooter: function() {
                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));

                var btnOk = new qx.ui.form.Button(tr("OK"));
                btnOk.setWidth(150);
                container.add(btnOk);
                btnOk.addListener("click", this.confirm, this);

                var btnClear = new qx.ui.form.Button(tr("clear"));
                btnClear.setWidth(70);
                container.add(btnClear);
                btnClear.addListener("click", this.clearAll, this);

                var btnAddCityUnits = new qx.ui.form.Button(tr("add city units"));
                btnAddCityUnits.setWidth(110);
                container.add(btnAddCityUnits);
                btnAddCityUnits.addListener("click", this.addCityUnits, this);

                this.lblUtilisation = new qx.ui.basic.Label("");
                container.add(this.lblUtilisation);

                return container;
            },
            confirm: function() {
                var city = webfrontend.data.City.getInstance();

                var order = {
                    cityId: city.getId(),
                    units: new Array()
                };

                var res = webfrontend.res.Main.getInstance();
                var totalTS = 0;
                for (var key in this.units) {
                    var u = res.units[key];
                    var inputs = this.units[key];

                    var count = parseInt(inputs.count.getValue(), 10);
                    if (count > 0) {
                        var info = this._findProductionInfo(key);
                        if (info == null) {
                            bos.Utils.handleError("Couldn't find production info for unit type " + key);
                            return;
                        }
                        totalTS += count * getUnitRequiredSpace(key);
                        var u = {
                            type: key,
                            count: count,
                            time: info.ti
                        };
                        order.units.push(u);
                    }
                }

                if (totalTS == 0) {
                    bos.Utils.handleWarning(tr("please enter some unit count"));
                    return;
                }

                if (totalTS > city.getUnitLimit()) {
                    bos.Utils.handleWarning("You have entered " + totalTS + "TS while max for this city is " + city.getUnitLimit());
                    return;
                }

                var storage = bos.Storage.getInstance();
                if (this.editedOrder == null) {
                    storage.addRecruitmentOrder(order);
                } else {
                    this.editedOrder.units = order.units;

                    storage.saveRecruitmentOrders();
                    storage.setRecruitmentOrdersVersion(storage.getRecruitmentOrdersVersion() + 1);
                }

                this.editedOrder == null;

                this.close();

            },
            _calculateTS: function() {
                var res = webfrontend.res.Main.getInstance();

                var totalTS = 0;
                for (var key in this.units) {
                    var u = res.units[key];
                    var inputs = this.units[key];

                    var count = parseInt(inputs.count.getValue(), 10);
                    if (count > 0) {
                        totalTS += count * getUnitRequiredSpace(key);
                    }
                }
                return totalTS;
            },
            _toMax: function(unitType) {
                var inputs = this.units[unitType];
                var count = parseInt(inputs.count.getValue(), 10);

                var ts = this._calculateTS();
                var city = webfrontend.data.City.getInstance();
                var max = city.getUnitLimit();

                var heads = getUnitRequiredSpace(unitType);
                var c = max - ts + count * heads;
                if (heads > 1) {
                    c = Math.floor(c / heads);
                }
                inputs.count.setValue(c);
            },
            updateView: function() {
                var city = webfrontend.data.City.getInstance();
                var current = this._calculateTS();
                var max = city.getUnitLimit();
                this.lblUtilisation.setValue(current + " / " + max + " TS");
            },
            prepareView: function() {
                var city = webfrontend.data.City.getInstance();

                this.clearAll();
                var storage = bos.Storage.getInstance();
                this.editedOrder = storage.findRecruitmentOrderById(city.getId());
                if (this.editedOrder != null) {
                    var res = webfrontend.res.Main.getInstance();
                    for (var i = 0; i < this.editedOrder.units.length; i++) {
                        var o = this.editedOrder.units[i];
                        var inputs = this.units[o.type];
                        inputs.count.setValue(o.count);
                    }
                }

                var inCity = "";
                if (city.getUnits() != null) {
                    for (var key in city.getUnits()) {
                        var unit = (city.getUnits())[key];
                        if (inCity.length > 0) {
                            inCity += ", ";
                        }
                        inCity += unit.total + " " + formatUnitType(key, unit.total);
                    }
                }
                this.lblUnitsInCity.setValue(tr("in city:") + inCity);

                this.requestProductionInfo();
                this.updateView();
            },
            addCityUnits: function() {
                var city = webfrontend.data.City.getInstance();

                if (city.getUnits() != null) {
                    for (var key in city.getUnits()) {
                        var unit = (city.getUnits())[key];
                        if (this.units.hasOwnProperty(key)) {
                            this.units[key].count.setValue(unit.total);
                        }
                    }
                }
            },
            requestProductionInfo: function() {
                this.productionInfo = null;
                webfrontend.net.CommandManager.getInstance().sendCommand("GetUnitProductionInfo", {
                    cityid: webfrontend.data.City.getInstance().getId()
                }, this, this._onProductionInfo);
            },
            _onProductionInfo: function(isOk, result) {
                if (!isOk || result == null) {
                    return;
                }
                this.productionInfo = result;

                for (var i = 0; i < this.productionInfo.u.length; i++) {
                    var info = this.productionInfo.u[i];
                    if (this.units.hasOwnProperty(info.t) && info.r != null && info.r.length > 0) {
                        var u = this.units[info.t];
                        if (info.r[0].b == 0) {
                            u.label.setValue("<strong>" + u.name + "</strong>");
                        } else {
                            u.label.setValue(u.name);
                        }
                    }
                }
            },
            _findProductionInfo: function(unitType) {
                if (this.productionInfo == null) {
                    return null;
                }
                for (var i = 0; i < this.productionInfo.u.length; i++) {
                    var info = this.productionInfo.u[i];
                    if (info.t == unitType) {
                        return info;
                    }
                }
                return null;
            }
        }
    });
});