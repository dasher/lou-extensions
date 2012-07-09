/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:31
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.MassRecruitmentPage");

    qx.Class.define("bos.gui.MassRecruitmentPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("recruitment"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.buttonActiveUrl = webfrontend.config.Config.getInstance().getImagePath("ui/btn_army_overview.gif");

            this.add(this._createToolBar());

            this.cityIdColumn = 8;
            this.typeColumn = 9;
            var columnNames = [tr("city/order"), tr("action"), tr("status"), tr("missing"), tr("resourcesFor"), tr("recruiting"), tr("available"), tr("recruitmentTime"), tr("cityId"), tr("type")];

            this.tree = new qx.ui.treevirtual.TreeVirtual(columnNames, {
                tableColumnModel: function(d) {
                    return new qx.ui.table.columnmodel.Basic(d);
                }
            });
            this.tree.addListener("cellClick", this._handleCellClick, this);
            this.tree.setStatusBarVisible(false);
            this.tree.setAlwaysShowOpenCloseSymbol(false);
            this.tree.set({
                rowHeight: 19,
                headerCellHeight: 22,
                focusCellOnMouseMove: false,
                columnVisibilityButtonVisible: false
            });
            var eU = "#564d48";
            var fi = "#c9ae7c";
            var eY = "#70645d";
            var fa = "#f3d298";
            var fm = "#373930";
            var eQ = "#4d4f46";
            var eP = "#4f5245";

            var eE = {
                sBgcolFocusedSelected: eY,
                sBgcolFocused: eY,
                sBgcolSelected: eU,
                sBgcolEven: eU,
                sBgcolOdd: eU,
                sColSelected: fa,
                sColNormal: fa,
                sColHorLine: fi,
                sStyleHorLine: "1px solid "
            };
            var eF = {
                sBgcolFocusedSelected: eP,
                sBgcolFocused: eP,
                sBgcolSelected: fm,
                sBgcolEven: fm,
                sBgcolOdd: fm,
                sColSelected: fa,
                sColNormal: fa,
                sColHorLine: eQ,
                sStyleHorLine: "1px dotted "
            };
            this.tree.setDataRowRenderer(new webfrontend.gui.TreeRowRendererCustom(this.tree, eE, eF));

            var tcm = this.tree.getTableColumnModel();
            tcm.setDataCellRenderer(0, new webfrontend.data.TreeDataCellRendererCustom({
                leafIcon: false
            }));
            tcm.setColumnVisible(this.cityIdColumn, false);
            tcm.setColumnVisible(this.typeColumn, false);

            this.tree.setMetaColumnCounts([-1]);

            tcm.setColumnWidth(0, 150);
            tcm.setColumnWidth(1, 75);
            tcm.setColumnWidth(2, 60);

            for (var i = 3; i <= 7; i++) {
                tcm.setColumnWidth(i, 100);
                //tcm.setColumnSortable(i, true);
            }
            /*
             tcm.setDataCellRenderer(1, new webfrontend.gui.CellRendererHtmlCustom({
             sBorderRCol: "#4d4f46"
             }));
             */

            for (var i = 1; i <= 7; i++) {
                tcm.setDataCellRenderer(i, new webfrontend.gui.CellRendererHtmlCustom({
                    sBorderRCol: "#4d4f46"
                }));
            }


            tcm.addListener("widthChanged", this._treeWidthChanged, this)

            this.add(this.tree, { flex: 1 } );

            bos.Storage.getInstance().addListener("changeRecruitmentOrdersVersion", this.updateWholeView, this);
        },
        members: {
            tree: null,
            cityIdColumn: null,
            typeColumn: null,
            _optionsWidget: null,
            sbCityType: null,
            _sendingStatuses: {},
            buttonActiveUrl: null,
            sbMissingCount: null,
            cities: {},
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbCityType = bos.Utils.createCitiesTypesSelectBox();
                bos.Utils.populateCitiesTypesSelectBox(this.sbCityType, true);

                bos.Storage.getInstance().addListener("changeCustomCityTypesVersion", function(event) {
                    bos.Utils.populateCitiesTypesSelectBox(this.sbCityType, true);
                }, this);

                this.sbCityType.addListener("changeSelection", this.updateWholeView, this);
                toolBar.add(this.sbCityType);

                this.sbMissingCount = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });
                this.sbMissingCount.setToolTipText(tr("missing"));
                this.sbMissingCount.add(new qx.ui.form.ListItem(tr("Any"), null, -1));
                this.sbMissingCount.add(new qx.ui.form.ListItem(tr(">0"), null, 0));
                this.sbMissingCount.add(new qx.ui.form.ListItem(tr(">10k"), null, 10000));
                this.sbMissingCount.add(new qx.ui.form.ListItem(tr(">30k"), null, 30000));
                this.sbMissingCount.add(new qx.ui.form.ListItem(tr(">100k"), null, 100000));
                this.sbMissingCount.addListener("changeSelection", this.updateWholeView, this);
                toolBar.add(this.sbMissingCount);

                var btnRecruitAll = new qx.ui.form.Button(tr("btnRecruitAll"));
                btnRecruitAll.setToolTipText(tr("btnRecruitAll_toolTip"));
                btnRecruitAll.setWidth(100);
                btnRecruitAll.addListener("execute", this.recruitAll, this);
                toolBar.add(btnRecruitAll);

                var btnEnableMassRecruitment = new qx.ui.form.Button(tr("btnEnableMassRecruitment"));
                btnEnableMassRecruitment.setToolTipText(tr("btnEnableMassRecruitment_toolTip"));
                btnEnableMassRecruitment.setWidth(100);
                btnEnableMassRecruitment.addListener("execute", this.enableMassRecruitment, this);
                toolBar.add(btnEnableMassRecruitment);

                var btnDisableMassRecruitment = new qx.ui.form.Button(tr("btnDisableMassRecruitment"));
                btnDisableMassRecruitment.setToolTipText(tr("btnDisableMassRecruitment_toolTip"));
                btnDisableMassRecruitment.setWidth(100);
                btnDisableMassRecruitment.addListener("execute", this.disableMassRecruitment, this);
                toolBar.add(btnDisableMassRecruitment);

                var btnRefreshView = new qx.ui.form.Button(tr("btnRefreshView"));
                btnRefreshView.setToolTipText(tr("btnRefreshView_toolTip"));
                btnRefreshView.setWidth(100);
                btnRefreshView.addListener("execute", this.updateWholeView, this);
                toolBar.add(btnRefreshView);

                var btnHelp = new qx.ui.form.Button(tr("help"));
                btnHelp.setWidth(120);
                toolBar.add(btnHelp);
                btnHelp.addListener("execute", function(evt) {
                    var dialog = new webfrontend.gui.ConfirmationWidget();
                    dialog.showGenericNotice(tr("help"), tr("bos.gui.MassRecruitmentPage.help"), tr("bos.gui.MassRecruitmentPage.help2"), "webfrontend/ui/bgr_popup_survey.gif");

                    qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                    dialog.show();
                }, this);

                var btnExportSettings = new qx.ui.form.Button(tr("btnExportSettings"));
                btnExportSettings.setToolTipText(tr("btnExportSettings_toolTip"));
                btnExportSettings.setWidth(120);
                btnExportSettings.addListener("execute", this.exportSettings, this);
                toolBar.add(btnExportSettings);

                var btnImportSettings = new qx.ui.form.Button(tr("btnImportSettings"));
                btnImportSettings.setToolTipText(tr("btnImportSettings_toolTip"));
                btnImportSettings.setWidth(120);
                btnImportSettings.addListener("execute", this.importSettings, this);
                toolBar.add(btnImportSettings);

                var btnDefenceMinisterSetTargetArmy = new qx.ui.form.Button(tr("btnDefenceMinisterSetTargetArmy"));
                btnDefenceMinisterSetTargetArmy.setToolTipText(tr("btnDefenceMinisterSetTargetArmy_toolTip"));
                btnDefenceMinisterSetTargetArmy.setWidth(120);
                btnDefenceMinisterSetTargetArmy.addListener("execute", this.defenceMinisterSetTargetArmy, this);
                toolBar.add(btnDefenceMinisterSetTargetArmy);

                return toolBar;
            },
            defenceMinisterSetTargetArmy: function() {
                //SetTargetArmy
                //"cityid":"3670229","units":[{"t":"17","c":780}]}
                //{"cityId":"10354721","units":[{"type":"7","count":168500,"time":6}

                var cities = webfrontend.data.Player.getInstance().cities;

                var orders = bos.Storage.getInstance().getRecruitmentOrders();
                for (var i = 0; i < orders.length; i++) {
                    var order = orders[i];
                    if (!cities.hasOwnProperty(order.cityId)) {
                        //city has different owner, skip it
                        continue;
                    }

                    var units = new Array();
                    for (var u = 0; u < order.units.length; u++) {
                        var o = order.units[u];
                        units.push({
                            t: o.type,
                            c: o.count
                        });
                    }

                    var request = {
                        cityid: order.cityId,
                        units: units
                    };

                    bos.net.CommandManager.getInstance().sendCommand("SetTargetArmy", request, this, this._parseSetTargetArmyResponse, request);
                }
            },
            _parseSetTargetArmyResponse: function(isOk, result, context) {

            },
            enableMassRecruitment: function() {
                var widget = this._getOptionsWidget();
                widget.prepareView();
                widget.open();
            },
            disableMassRecruitment: function() {
                var city = webfrontend.data.City.getInstance();
                var storage = bos.Storage.getInstance();
                var order = storage.findRecruitmentOrderById(city.getId());
                if (order != null) {
                    if (confirm(tr("are you sure?"))) {
                        storage.removeRecruitmentOrder(city.getId());
                    }
                }
            },
            _shouldCityBeIncluded: function(city, order) {

                var sel = this.sbCityType.getSelection();
                if (sel == null || sel.length == 0) {
                    return false;
                }
                var reqType = sel[0].getModel();
                if (reqType != "A") {
                    var type = bos.CityTypes.getInstance().parseReference(city.reference);
                    switch (reqType) {
                        case 'C':
                            if (!type.isCastle) return false;
                            break;
                        case 'D':
                            if (!type.isDefensive) return false;
                            break;
                    }
                }

                var minimalMissing = parseInt(this.sbMissingCount.getSelection()[0].getModel());
                if (minimalMissing != -1) {
                    var res = webfrontend.res.Main.getInstance();

                    var server = bos.Server.getInstance();
                    var storedCity = server.cities[order.cityId];
                    if (storedCity == undefined) {
                        return true;
                    }

                    var totalMissing = 0;
                    for (var j = 0; j < order.units.length; j++) {
                        var unit = order.units[j];


                        var details = this._calculateUnitDetails(unit, storedCity);
                        var heads = res.units[unit.type].uc;

                        if (heads > 1) {
                            totalMissing += details.missing * heads;
                        } else {
                            totalMissing += details.missing;
                        }
                    }

                    if (totalMissing < minimalMissing) {
                        return false;
                    }
                }

                return true;
            },
            _treeWidthChanged: function(e) {
                var ed = e.getData();
                if (ed.col == 1 && ed.newWidth != 75) {
                    var tcm = this.tree.getTableColumnModel();
                    tcm.setColumnWidth(ed.col, 75);
                }
            },
            _getOptionsWidget: function() {
                if (this._optionsWidget == null) {
                    this._optionsWidget = new bos.gui.MassRecruitmentOptionsWidget();
                }
                return this._optionsWidget;
            },
            updateWholeView: function() {
                this.cities.reset = true;
                this.updateView();
            },
            updateView: function() {
                var storage = bos.Storage.getInstance();
                var orders = storage.getRecruitmentOrders();

                var model = this.tree.getDataModel();

                if (this.cities.hasOwnProperty("reset")) {
                    model.clearData();
                    this.cities = {};
                }

                var cities = webfrontend.data.Player.getInstance().cities;
                var res = webfrontend.res.Main.getInstance();
                var server = bos.Server.getInstance();
                for (var i = 0; i < orders.length; i++) {
                    var order = orders[i];
                    if (!cities.hasOwnProperty(order.cityId)) {
                        //city has different owner, skip it
                        continue;
                    }
                    var city = cities[order.cityId];
                    if (!this._shouldCityBeIncluded(city, order)) {
                        continue;
                    }

                    var storedCity = server.cities[order.cityId];
                    var unitLimit = 0;
                    var unitCount = new Object();
                    if (storedCity != undefined) {
                        unitLimit = storedCity.getUnitLimit();

                        //var h = f.getUnitLimit() - f.getUnitCount() - f.getUnitsInQueue();
                    } else {
                        bos.Utils.handleError("No data about city. Please visit " + bos.Utils.convertIdToCoodrinates(order.cityId));
                        continue;
                    }

                    var currentTS = this._currentTSInCity(storedCity);
                    var recruitingInCity = this._calculateTotalRecruitingUnits(storedCity);
                    var bid;
                    if (!this.cities.hasOwnProperty(order.cityId)) {
                        bid = model.addBranch(null, city.name, true);
                        this.cities[order.cityId] = {
                            bid: bid,
                            leafs: []
                        }
                        model.setState(bid, {
                            icon: "",
                            iconSelected: ""
                        });
                    } else {
                        bid = this.cities[order.cityId].bid;
                    }
                    var treeData = this.cities[order.cityId];

                    var totalMissing = 0;
                    var totalResourcesFor = 0;
                    var totalRecruited = 0;
                    var totalCount = 0;
                    var ordersAvailableForRecruitment = 0;

                    var textColor = bos.Const.TABLE_DEFAULT_COLOR;
                    for (var j = 0; j < order.units.length; j++) {
                        var unit = order.units[j];

                        var lid;
                        if (treeData.leafs.length <= j) {
                            lid = model.addLeaf(bid, unit.count + " " + formatUnitType(unit.type, unit.count));
                            treeData.leafs.push(lid);
                        } else {
                            lid = treeData.leafs[j];
                        }
                        var details = this._calculateUnitDetails(unit, storedCity);

                        var freeSpaceInBarracks = storedCity.getUnitLimit() - currentTS - recruitingInCity;
                        var availableSpace = freeSpaceInBarracks;
                        var heads = res.units[unit.type].uc;
                        if (heads > 1) {
                            availableSpace = Math.floor(availableSpace / heads);
                        }

                        if (details.missing > 0 && details.resourcesFor > 0 && availableSpace >= heads) {
                            model.setColumnData(lid, 1, this._createActionButton(tr("recruit")));
                            ordersAvailableForRecruitment++;
                        } else {
                            model.setColumnData(lid, 1, "");
                        }
                        var status = this._getStatus(order.cityId, j);
                        if (status != undefined) {
                            model.setColumnData(lid, 2, this.translateStatus(status.status));
                            //secondRow["status"] = human_time(Math.floor((now - status.date) / 1000));
                        } else {
                            model.setColumnData(lid, 2, "");
                        }
                        model.setColumnData(lid, 3, bos.Utils.makeColorful(details.missing, textColor));
                        model.setColumnData(lid, 4, bos.Utils.makeColorful(details.resourcesFor, textColor));
                        model.setColumnData(lid, 5, bos.Utils.makeColorful(details.recruited, textColor));
                        model.setColumnData(lid, 6, bos.Utils.makeColorful(details.currentCount, textColor));
                        model.setColumnData(lid, 7, bos.Utils.makeColorful(unit.time, textColor));
                        model.setColumnData(lid, this.cityIdColumn, order.cityId);
                        model.setColumnData(lid, this.typeColumn, j);

                        totalMissing += details.missing;
                        totalResourcesFor += details.resourcesFor;
                        totalRecruited += details.recruited;
                        totalCount += details.currentCount;
                    }

                    if (ordersAvailableForRecruitment > 0) {
                        model.setColumnData(bid, 1, this._createActionButton(tr("recruit")));
                    } else {
                        model.setColumnData(bid, 1, "");
                    }
                    model.setColumnData(bid, 3, bos.Utils.makeColorful(totalMissing, textColor));
                    model.setColumnData(bid, 4, bos.Utils.makeColorful(totalResourcesFor, textColor));
                    model.setColumnData(bid, 5, bos.Utils.makeColorful(totalRecruited, textColor));
                    model.setColumnData(bid, 6, bos.Utils.makeColorful(totalCount, textColor));
                    model.setColumnData(bid, this.cityIdColumn, order.cityId);
                    model.setColumnData(bid, this.typeColumn, -1);

                }

                model.setData();
            },
            _createActionButton: function(caption, color) {
                var format = "<div style=\"background-image:url(%1);color:%3;cursor:pointer;margin-left:-6px;margin-right:-6px;margin-bottom:-3px;font-size:11px;height:19px\" align=\"center\">%2</div>";
                if (color == undefined) {
                    color = "#f3d298";
                }
                return qx.lang.String.format(format, [this.buttonActiveUrl, caption, color]);
            },
            _calculateTotalRecruitingUnits: function(storedCity) {
                if (storedCity.unitQueue == null) {
                    return 0;
                }
                var res = webfrontend.res.Main.getInstance();
                var recruiting = 0;
                for (var k = 0; k < storedCity.unitQueue.length; k++) {
                    var uq = storedCity.unitQueue[k];
                    if (uq.end >= webfrontend.data.ServerTime.getInstance().getServerStep()) {
                        recruiting += uq.left * res.units[uq.type].uc;
                    }
                }
                return recruiting;
            },
            _currentTSInCity: function(storedCity) {
                var ts = 0;
                if (storedCity.getUnits() != null) {
                    var res = webfrontend.res.Main.getInstance();
                    for (var key in storedCity.getUnits()) {
                        var item = (storedCity.getUnits())[key];

                        var unit = res.units[key];
                        ts += item.total * unit.uc;
                    }
                }
                return ts;
            },
            _calculateUnitDetails: function(unit, storedCity) {
                var o = {
                    currentCount: 0,
                    recruited: 0,
                    missing: 0,
                    resourcesFor: 0
                };

                var currentItem = (storedCity.getUnits())[unit.type];
                if (currentItem != undefined) {
                    o.currentCount = currentItem.total;
                }

                if (storedCity.unitQueue != null) {
                    for (var k = 0; k < storedCity.unitQueue.length; k++) {
                        var uq = storedCity.unitQueue[k];
                        if (uq.end >= webfrontend.data.ServerTime.getInstance().getServerStep()) {
                            if (uq.type == unit.type) {
                                o.recruited += uq.left;
                            }
                        }
                    }
                }

                o.missing = Math.max(0, unit.count - o.currentCount - o.recruited);

                var resources = new Array();
                resources[0] = webfrontend.data.Player.getInstance().getGold();
                var row = [];
                var summary = getSummaryWidget();
                if (summary._populateResources(row, storedCity.getId())) {
                    resources[1] = row["wood"];
                    resources[2] = row["stone"];
                    resources[3] = row["iron"];
                    resources[4] = row["food"];
                }

                var maxRecruitable = [0, -1, -1, -1, -1];
                if (resources.length >= 5) {
                    var res = webfrontend.res.Main.getInstance();
                    var u = res.units[unit.type];
                    if (u.g == 0) {
                        maxRecruitable[0] = -1;
                    } else {
                        maxRecruitable[0] = Math.floor(resources[0] / u.g);
                    }

                    for (var resType in u.res) {
                        var req = u.res[resType];
                        maxRecruitable[resType] = Math.floor(resources[resType] / req);
                    }

                    o.resourcesFor = bos.Const.INF;

                    for (var i = 0; i <= 4; i++) {
                        var min = maxRecruitable[i];
                        if (min != -1) {
                            o.resourcesFor = Math.min(o.resourcesFor, min);
                        }
                    }
                }

                return o;
            },
            recruitAll: function() {
                var cities = webfrontend.data.Player.getInstance().cities;
                var orders = bos.Storage.getInstance().getRecruitmentOrders();
                this._sendingStatuses = {};
                for (var i = 0; i < orders.length; i++) {
                    var order = orders[i];
                    if (!cities.hasOwnProperty(order.cityId)) {
                        //city has different owner, skip it
                        continue;
                    }
                    var city = cities[order.cityId];
                    if (!this._shouldCityBeIncluded(city, order)) {
                        continue;
                    }
                    this.recruit(order.cityId, -1, false);
                }
            },
            _handleCellClick: function(e) {

                var row = this.tree.getDataModel().getRowData(e.getRow());
                var cityId = row[this.cityIdColumn];

                switch (e.getColumn()) {
                    case 0:
                        a.setMainView("c", cityId, -1, -1);
                        break;
                    case 1:
                        //action
                        this.recruit(cityId, row[this.typeColumn], true);
                        break;
                }
            },
            recruit: function(cityId, type, manual) {
                //type = -1 whole city, else index in units

                var order = bos.Storage.getInstance().findRecruitmentOrderById(cityId);
                if (order == null) {
                    bos.Utils.handleError("Couldnt find recruitment order for cityId=" + cityId);
                    return;
                }

                var server = bos.Server.getInstance();
                var storedCity = server.cities[cityId];
                if (storedCity == null) {
                    bos.Utils.handleError("Couldnt find saved city data for cityId=" + cityId);
                    return;
                }

                var recruitingInCity = this._calculateTotalRecruitingUnits(storedCity);
                var currentTS = this._currentTSInCity(storedCity);
                var freeSpaceInBarracks = storedCity.getUnitLimit() - currentTS - recruitingInCity;
                if (freeSpaceInBarracks <= 0) {
                    if (manual) {
                        bos.Utils.handleWarning("No free space in barracks");
                    }
                    return;
                }

                var res = webfrontend.res.Main.getInstance();

                for (var i = 0; i < order.units.length; i++) {
                    if (type != -1 && type != i) {
                        continue;
                    }
                    var unit = order.units[i];

                    var availableSpace = freeSpaceInBarracks;
                    var heads = res.units[unit.type].uc;
                    if (heads > 1) {
                        availableSpace = Math.floor(availableSpace / heads);
                    }

                    var details = this._calculateUnitDetails(unit, storedCity);

                    var count = Math.min(details.missing, details.resourcesFor, availableSpace);
                    if (count <= 0) {
                        continue;
                    }

                    var units = new Array();
                    units.push({
                        t: unit.type,
                        c: count
                    });

                    var context = {
                        order: order,
                        orderIndex: i,
                        units: units
                    };

                    bos.net.CommandManager.getInstance().sendCommand("StartUnitProduction", {
                        cityid: cityId,
                        units: units,
                        isPaid: true
                    }, this, this._parseResponse, context);

                    freeSpaceInBarracks -= count * heads;
                }
            },
            _parseResponse: function(isOk, errorCode, context) {
                try {
                    if (isOk == false || errorCode == null) {
                        //comm error
                        this._setStatus(context, -1);
                    } else {
                        this._setStatus(context, parseInt(errorCode));
                    }
                    this.updateView();
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },
            _setStatus: function(context, status) {

                var newStatus = {
                    status: status,
                    date: new Date()
                };

                this._sendingStatuses["o" + context.order.cityId + "_" + context.orderIndex] = newStatus;

                if (status == 0) {
                    var server = bos.Server.getInstance();
                    var storedCity = server.cities[context.order.cityId];
                    if (storedCity != undefined) {
                        if (storedCity.unitQueue == null) {
                            storedCity.unitQueue = new Array();
                        }

                        var start = webfrontend.data.ServerTime.getInstance().getServerStep();
                        if (storedCity.unitQueue.length > 0) {
                            var lastOrder = storedCity.unitQueue[storedCity.unitQueue.length - 1];
                            if (lastOrder.end > start) {
                                start = lastOrder.end;
                            }
                        }

                        var unit = context.units[0];

                        var usedRecruitmentOrder = context.order.units[context.orderIndex];

                        var end = start + usedRecruitmentOrder.time * unit.c;

                        var uq = {
                            id: -1,
                            type: unit.t,
                            count: unit.c,
                            batch: 1,
                            left: unit.c,
                            start: start,
                            end: end,
                            isPaid: true
                        };

                        storedCity.unitQueue.push(uq);
                        storedCity.unitsInQueue += unit.c;

                        server.markCityDirty(storedCity.getId());
                    }
                }
            },
            _getStatus: function(cityId, orderIndex) {
                return this._sendingStatuses["o" + cityId + "_" + orderIndex];
            },
            translateStatus: function(status) {
                if (status == 0) {
                    return "OK";
                }
                if (status == -1) {
                    return "Comm. err";
                }
                var errors = "";
                if ((status & 0x01) != 0) errors += "I";
                if ((status & 0x02) != 0) errors += "R";
                if ((status & 0x04) != 0) errors += "Q";
                if ((status & 0x08) != 0) errors += "T";
                if ((status & 0x10) != 0) errors += "B";
                if ((status & 0x20) != 0) errors += "G";
                return errors;
            },
            _sortCities: function(tcm) {
                var data = tcm.getData();
                if (data.length == 0 || data[0].children.length == 0) {
                    return;
                }

                data[0].children.sort(function(a, b) {
                    var o1 = data[a].label.toLowerCase();
                    var o2 = data[b].label.toLowerCase();
                    if (o1 < o2) return -1;
                    if (o1 > o2) return 1;
                    return 0;
                });
            },
            exportSettings: function() {
                var storage = bos.Storage.getInstance();
                var orders = storage.getRecruitmentOrders();

                var json = qx.util.Json.stringify(orders);
                bos.Utils.displayLongText(json);
            },
            importSettings: function() {
                bos.Utils.inputLongText(function (json) {
                    var storage = bos.Storage.getInstance();
                    storage.importRecruitmentOrders(json);
                });
            }
        }
    });
});