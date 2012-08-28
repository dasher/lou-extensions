/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:40
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.SummaryWidget");

    qx.Class.define("bos.gui.SummaryWidget", {
        type: "singleton",
        extend: qx.ui.window.Window,
        implement: [webfrontend.net.IUpdateConsumer],
        construct: function() {

            qx.ui.window.Window.call(this);
            this.setLayout(new qx.ui.layout.Dock());

            var maxWidth = qx.bom.Viewport.getWidth(window);
            var maxHeight = qx.bom.Viewport.getHeight(window);

            var pos = bos.Storage.getInstance().getSummaryPosition();
            if (pos == null) {
                pos = {
                    left: 400,
                    top: 150,
                    width: Math.max(600, qx.bom.Viewport.getWidth(window) - 420),
                    height: 500
                }
            } else {
                if (pos.left >= maxWidth) {
                    pos.left = 0;
                }
                if (pos.top >= maxHeight) {
                    pos.top = 0;
                }
            }

            this.set({
                width: pos.width,
                minWidth: 200,
                maxWidth: parseInt(maxWidth * 0.9),
                height: pos.height,
                minHeight: 200,
                maxHeight: parseInt(qx.bom.Viewport.getWidth(window) * 0.9),
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: ("Summary"),
                resizeSensitivity: 7,
                contentPadding: 0

            });

            this.moveTo(pos.left, pos.top);

            this.tabView = new qx.ui.tabview.TabView().set({
                contentPadding: 5
            });
            this.tabView.setAppearance("tabview");

            this.citiesTab = new bos.gui.CitiesPage();
            this.tabView.add(this.citiesTab);

            this.militaryTab = new bos.gui.MilitaryPage();
            this.tabView.add(this.militaryTab);

            this.defendersTab = new bos.gui.DefendersPage();
            this.tabView.add(this.defendersTab);

            this.castlesTab = new bos.gui.CastlesPage();
            this.tabView.add(this.castlesTab);

            this.purifyResourcesTab = new bos.gui.PurifyResourcesPage();
            this.tabView.add(this.purifyResourcesTab);

            this.massRecruitmentTab = new bos.gui.MassRecruitmentPage();
            this.tabView.add(this.massRecruitmentTab);

            if (false) {
                //disabled
                this.dungeonsTab = new bos.gui.DungeonsPage();
                this.tabView.add(this.dungeonsTab);

                this.regionTab = new bos.gui.RegionPage();
                this.tabView.add(this.regionTab);
            }

            this.tradeOrdersTab = new bos.gui.TradeOrdersPage();
            this.tabView.add(this.tradeOrdersTab);

            this.tradeRoutesTab = new bos.gui.TradeRoutesPage();
            this.tabView.add(this.tradeRoutesTab);

            this.unitOrdersTab = new bos.gui.UnitOrdersPage();
            this.tabView.add(this.unitOrdersTab);

            this.incomingAttacksTab = new bos.gui.IncomingAttacksPage();
            this.tabView.add(this.incomingAttacksTab);

            this.optionsTab = new bos.gui.OptionsPage();
            this.tabView.add(this.optionsTab);

            this.tabView.addListener("changeSelection", this.onChangeTab, this);

            this.add(this.tabView);

            this.cities = new Array();
            webfrontend.gui.Util.formatWinClose(this);

            this.guardianTimer = new qx.event.Timer(10500);
            this.guardianTimer.addListener("interval", this.checkAndReattachConsumers, this);
            this.guardianTimer.start();

            if (webfrontend.data.Player.getInstance().getMinisterTradePresent()) {
                this.startCosumingRESO();
            }

            if (webfrontend.data.Player.getInstance().getMinisterMilitaryPresent()) {
                this.unitOrdersTab.startRefreshingFromServer();
            }

        },
        statics: {
            _defaultSortComparatorInsensitiveAscending : function(row1, row2) {
                //summary row always at the bottom
                if (row1[0] == "Total") {
                    return 1;
                }

                if (row2[0] == "Total") {
                    return -1;
                }

                var obj1 = null;
                if (row1[arguments.callee.columnIndex] != null)
                    obj1 = (row1[arguments.callee.columnIndex].toLowerCase ?
                        row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);

                var obj2 = null;
                if (row2[arguments.callee.columnIndex] != null)
                    obj2 = (row2[arguments.callee.columnIndex].toLowerCase ?
                        row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);

                var n1 = qx.lang.Type.isNumber(obj1);
                var n2 = qx.lang.Type.isNumber(obj2);
                if (n1 && n2) {
                    var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
                    if (result != null) {
                        if (result == 0) {
                            return row1[0] > row2[0] ? 1 : -1;
                        }
                        return result;
                    }
                }

                if (n1 && !n2) {
                    return -1;
                }

                if (!n1 && n2) {
                    return 1;
                }

                if (obj1 > obj2) {
                    return 1;
                } else if (obj1 < obj2) {
                    return -1;
                }

                return row1[0] > row2[0] ? 1 : -1;
            },
            _defaultSortComparatorInsensitiveDescending : function(row1, row2) {
                //summary row always at the bottom
                if (row1[0] == "Total") {
                    return 1;
                }
                if (row2[0] == "Total") {
                    return -1;
                }

                var obj1 = null;
                if (row1[arguments.callee.columnIndex] != null)
                    obj1 = (row1[arguments.callee.columnIndex].toLowerCase ?
                        row1[arguments.callee.columnIndex].toLowerCase() : row1[arguments.callee.columnIndex]);

                var obj2 = null;
                if (row2[arguments.callee.columnIndex] != null)
                    obj2 = (row2[arguments.callee.columnIndex].toLowerCase ?
                        row2[arguments.callee.columnIndex].toLowerCase() : row2[arguments.callee.columnIndex]);

                var n1 = qx.lang.Type.isNumber(obj1);
                var n2 = qx.lang.Type.isNumber(obj2);
                if (n1 && n2) {
                    var result = isNaN(obj1) ? isNaN(obj2) ?  0 : 1 : isNaN(obj2) ? -1 : null;
                    if (result != null) {
                        if (result == 0) {
                            return row1[0] < row2[0] ? 1 : -1;
                        }
                    }
                }

                if (n1 && !n2) {
                    return -1;
                }

                if (!n1 && n2) {
                    return 1;
                }

                if (obj1 < obj2)
                    return 1;
                if (obj1 > obj2)
                    return -1;

                return row1[0] > row2[0] ? 1 : -1;
            }
        },
        members: {
            tabView: null,
            citiesTab: null,
            militaryTab: null,
            defendersTab: null,
            dungeonsTab: null,
            regionTab: null,
            unitOrdersTab: null,
            tradeOrdersTab: null,
            tradeRoutesTab: null,
            incomingAttacksTab: null,
            castlesTab: null,
            purifyResourcesTab: null,
            optionsTab: null,

            _requestedResourceType: 1,
            _requestedResourceCity: 0,
            _requestedResourceFetchedCities: null,
            _requestedResourceRefreshView: false,
            _requestResourcesProgressDialog: null,
            _waitingForFullMessage: true,

            cities: null,
            resfHandlerAdded: false,

            updateManagerConsumers: [],
            guardianTimer: null,
            lastUpdateViewTime: 0,
            getRequestDetails: function(dt) {
                if (this._waitingForFullMessage) {
                    return "a";
                } else {
                    return "";
                }
            },
            dispatchResults: function(du) {
                if (this._waitingForFullMessage) {
                    this._waitingForFullMessage = false;
                }
                if (du == null || du.length == 0) return;

                for (var i = 0, count = du.length; i < count; i++) {
                    var dv = du[i];
                    this.cities[dv.i] = dv;
                }

                this.updateView(true);
            },
            startCosumingRESO: function() {
                if (!this.resfHandlerAdded) {
                    webfrontend.net.UpdateManager.getInstance().addConsumer("RESO", this);
                    this.updateManagerConsumers.push("RESO");
                    this.resfHandlerAdded = true;
                }
            },
            checkAndReattachConsumers: function() {
                var manager = webfrontend.net.UpdateManager.getInstance();
                for (var c = 0; c < this.updateManagerConsumers.length; c++) {
                    var code = this.updateManagerConsumers[c];
                    var attached = false;
                    for (var i = 0; i < manager.reciever.length; i++) {
                        var item = manager.reciever[i];
                        if (item != null && item.code == code && item.consumer == this) {
                            attached = true;
                            break;
                        }
                    }
                    if (!attached) {
                        manager.addConsumer(code, this);
                    }
                }
            },
            onTick: function() {

            },
            onChangeTab: function() {

                if ((this.dungeonsTab != null && this.tabView.isSelected(this.dungeonsTab)) || (this.regionTab != null && this.tabView.isSelected(this.regionTab))) {
                    this._forceRegionMap();
                }

                this.updateView();
            },
            activateOverlay: function(show) {
                var server = bos.Server.getInstance();
                if (show) {
                    server.addListener("bos.data.changeLastUpdatedCityId", this.updateView, this);
                } else {
                    server.removeListener("bos.data.changeLastUpdatedCityId", this.updateView, this);
                }
            },
            _createExportButton: function() {
                var btnExport = new qx.ui.form.Button(locale == "de" ? "Exportiere zu csv" : "Export to csv");
                btnExport.setToolTipText(locale == "de" ? "Exportiert die Tabelle ins csv Format" : "Exports table in csv format");
                btnExport.setWidth(120);
                return btnExport;
            },
            loadPersistedCities: function() {
                var savedCities = bos.Storage.getInstance().getSavedCities();
                var cities = webfrontend.data.Player.getInstance().cities;

                var server = bos.Server.getInstance();

                var count = 0;
                for (var key in savedCities) {
                    var cityId = parseInt(savedCities[key]);
                    if (server.cities[cityId] == undefined && cities[cityId] != undefined && !isNaN(cityId)) {
                        var loaded = bos.Storage.getInstance().loadCity(cityId);
                        server.cities[cityId] = loaded;
                        count++;
                    }
                }

                this.updateView();

            },
            loadPersistedTableSettings: function() {
                var storage = bos.Storage.getInstance();

                if (storage.getCitiesTableSettings() != null) {
                    this.citiesTab.table.applyTableSettings(storage.getCitiesTableSettings(), "Cities");
                }
                if (storage.getMilitaryTableSettings() != null) {
                    this.militaryTab.table.applyTableSettings(storage.getMilitaryTableSettings(), "Military");
                }
                if (storage.getMoonstonesTableSettings() != null) {
                    this.purifyResourcesTab.table.applyTableSettings(storage.getMoonstonesTableSettings(), "Moonstones");
                }
            },
            _disposeRequestResourcesProgressDialog: function() {
                if (this._requestResourcesProgressDialog != null) {
                    this._requestResourcesProgressDialog.disable();
                    this._requestResourcesProgressDialog.destroy();
                    this._requestResourcesProgressDialog = null;
                }
            },
            fetchResources: function() {
                this._disposeRequestResourcesProgressDialog();

                this._requestResourcesProgressDialog = new webfrontend.gui.ConfirmationWidget();
                this._requestResourcesProgressDialog.showInProgressBox(tr("fetching resources, please wait"));
                qx.core.Init.getApplication().getDesktop().add(this._requestResourcesProgressDialog, {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                });
                this._requestResourcesProgressDialog.show();

                this._requestedResourceCity = webfrontend.data.City.getInstance().getId();
                this._requestedResourceType = bos.Const.WOOD;
                this._requestedResourceFetchedCities = [];

                var server = bos.Server.getInstance();
                server.cityResources = {};
                this._fetchResourcesImpl();
            },
            _fetchResourcesImpl: function() {
                this._requestedResourceFetchedCities["c" + this._requestedResourceCity] = true;
                bos.net.CommandManager.getInstance().sendCommand("TradeSearchResources", {
                    cityid: this._requestedResourceCity,
                    resType: this._requestedResourceType,
                    minResource: 0,
                    maxTime: 24 * webfrontend.data.ServerTime.getInstance().getStepsPerHour()
                }, this, this._processTradeSearchResources);
            },
            _processTradeSearchResources: function(r, n) {
                if (r == false || n == null) return;

                //[{"i":7667741,"la":140698,"lt":2400,"n":"041 Wroclaw","rc":140698,"sa":0,"sg":false,"st":4800}
                //al = land capacity
                //as = sea capacity
                //i = cityId
                //n = cityName
                //rc = resources count
                //sg = sieged?
                //tl = land transport time, if < 0 then city not reachable
                //ts = sea transport time, if < 0 then city not reachable

                var resourceType = this._requestedResourceType;
                var lastUpdated = new Date();

                var server = bos.Server.getInstance();
                for (var i = 0; i < n.length; i++) {

                    var c = {
                        cityId: n[i].i,
                        //city: n[i].n,
                        timeLand: n[i].lt,
                        timeSea: n[i].st,
                        seaTransportTime: n[i].st,
                        landTransportTime: n[i].lt,
                        sieged: n[i].sg,
                        resources: [null, null, null, null, null],
                        lastUpdated: lastUpdated
                    };

                    var prevCity = server.cityResources["c" + c.cityId];
                    if (prevCity != null) {
                        for (var res = 1; res <= 4; res++) {
                            c.resources[res] = prevCity.resources[res];
                        }
                        prevCity.resources = null;
                    }

                    var resCount = n[i].rc;

                    c.resources[resourceType] = {
                        count: resCount,
                        amountLand: n[i].la,
                        amountSea: n[i].sa
                    }
                    server.cityResources["c" + c.cityId] = c;

                    var realCity = server.cities[c.cityId];
                    if (realCity != null && realCity.resources.hasOwnProperty(resourceType)) {
                        realCity.setResourceCount(resourceType, resCount);

                        /*
                         var diff = Math.abs(realCity.getResourceCount(resourceType) - resCount);
                         if (diff > 5000) {
                         //big diff means city storage has been changed
                         alert("city " + realCity.getName() + " res=" + resourceType + " good: " + resCount + " bad: " + realCity.getResourceCount(resourceType));
                         }
                         */
                    }

                }

                if (this._requestedResourceType < 4) {
                    this._requestedResourceType++;
                    this._fetchResourcesImpl();
                } else {
                    this._prepareNextTradeSearchResourcesBatch();
                }

            },
            _prepareNextTradeSearchResourcesBatch: function() {
                var cities = webfrontend.data.Player.getInstance().cities;

                var server = bos.Server.getInstance();
                for (var key in cities) {
                    var cacheKey = "c" + key;
                    var resCity = server.cityResources[cacheKey];
                    if (resCity == null && this._requestedResourceFetchedCities[cacheKey] == null) {
                        this._requestedResourceCity = parseInt(key);
                        this._requestedResourceType = bos.Const.WOOD;
                        this._fetchResourcesImpl();
                        return;
                    }
                }

                //details about every city has been already fetched or there was some error during fetching
                server.setCityResourcesUpdateTime(new Date());
                if (this._requestedResourceRefreshView) {
                    this._requestedResourceRefreshView = false;
                    this.updateView();
                    this._disposeRequestResourcesProgressDialog();
                }

            },
            _updateRowFromResCity: function(resCity, row) {
                if (resCity.resources[1] != null) {
                    row["wood"] = resCity.resources[1].count;
                }
                if (resCity.resources[2] != null) {
                    row["stone"] = resCity.resources[2].count;
                }
                if (resCity.resources[3] != null) {
                    row["iron"] = resCity.resources[3].count;
                }
                if (resCity.resources[4] != null) {
                    row["food"] = resCity.resources[4].count;
                }
            },
            _populateResources: function(row, cityId) {
                if (!this.cities.hasOwnProperty(cityId)) {
                    return false;
                }

                var st = webfrontend.data.ServerTime.getInstance();
                var serverStep = st.getServerStep();
                var stepsPerHour = st.getStepsPerHour();

                var c = this.cities[cityId];

                var resTypes = ["", "wood", "stone", "iron", "food"];

                var gold = Math.round(c.g * stepsPerHour);
                row["gold/h"] = gold;

                for (var i = 0; i < c.r.length; i++) {
                    var res = c.r[i];
                    var timeDiff = serverStep - res.s;
                    var delta = res.d;
                    var count = timeDiff * delta + res.b;
                    count = Math.max(0, Math.min(count, res.m));

                    var key = resTypes[res.i];
                    row[key] = Math.floor(count);
                    row[key + "/h"] = Math.round(delta * stepsPerHour);
                    row[key + "Max"] = res.m;
                    row[key + "Free"] = res.m - row[key];
                    row[key + "Offers"] = res.o;
                    row[key + "Incoming"] = res.t;

                    if (res.i == 4) {
                        var foodBallance = row[key + "/h"]
                        if (foodBallance >= 0) {
                            row["foodEmptyAt"] = "food positive";
                        } else {
                            //var n = res.s + r.b / -(foodBallance);
                            var n = Math.floor(serverStep + count / -delta);
                            var emptyAt;
                            if (webfrontend.data.ServerTime.getInstance().getServerStep() >= n) {
                                emptyAt = 0;
                                row["foodEmptyAt"] = "storage empty";
                            } else {
                                emptyAt = webfrontend.data.ServerTime.getInstance().getStepTime(n);
                                row["foodEmptyAt"] = parseInt((emptyAt - new Date()) / 1000);
                            }
                        }
                    }
                }
                return true;
            },
            _addDefendersToRow: function(city, row, sum) {
                row["ts"] = 0;
                row["summary_military"] = "";
                row["unitsAtHome"] = 0;
                for (var i = 1; i <= 19; i++) {
                    var unitKey = "unit_" + i;
                    if (i == 18) continue;
                    var unit = city.getUnitTypeInfo(i);
                    row[unitKey] = unit.total;
                    row["unit_def_" + i] = unit.count;
                    row["unitsAtHome"] += unit.count;
                    if (sum[unitKey] == null || sum[unitKey] == "") {
                        sum[unitKey] = 0;
                    }
                    sum[unitKey] += unit.total;

                    var space = unit.total * getUnitRequiredSpace(i);
                    row["ts"] += space;
                    sum["ts"] += space;

                    if (unit.total > 0) {
                        if (row["summary_military"].length > 0) {
                            row["summary_military"] += ", ";
                        }
                        row["summary_military"] += unit.total + " " + formatUnitType(i, unit.total);
                    }
                }

                if (city.getSupportOrders() != null) {
                    for (var i = 0; i < city.getSupportOrders().length; i++) {
                        var order = city.getSupportOrders()[i];
                        if (order.state = 4 && order.units != null) {
                            for (var u = 0; u < order.units.length; u++) {
                                var unit = order.units[u];
                                row["unit_def_" + unit.type] += unit.count;
                            }
                        }
                    }
                }

                row["summary_defenders_ts"] = 0;
                row["summary_defenders"] = "";
                for (var i = 1; i <= 19; i++) {
                    var unitKey = "unit_def_" + i;
                    if (i == 18) continue;
                    if (row[unitKey] != "0" && row[unitKey] != null) {
                        if (row["summary_defenders"].length > 0) {
                            row["summary_defenders"] += ", ";
                        }
                        row["summary_defenders"] += row[unitKey] + " " + formatUnitType(i, row[unitKey]);

                        if (sum[unitKey] == null || sum[unitKey] == "") {
                            sum[unitKey] = 0;
                        }
                        sum[unitKey] += row[unitKey];
                        var space = row[unitKey] * getUnitRequiredSpace(i);
                        row["summary_defenders_ts"] += space;
                        sum["summary_defenders_ts"] += space;
                    }
                }


                sum["summary_military"] = "";
                for (var i = 1; i <= 19; i++) {
                    var unitKey = "unit_" + i;
                    if (i == 18) continue;
                    if (sum[unitKey] != "0" && sum[unitKey] != null && sum[unitKey] != "") {
                        if (sum["summary_military"].length > 0) {
                            sum["summary_military"] += ", ";
                        }
                        sum["summary_military"] += sum[unitKey] + " " + formatUnitType(i, sum[unitKey]);
                    }
                }

                sum["summary_defenders"] = "";
                for (var i = 1; i <= 19; i++) {
                    var unitKey = "unit_def_" + i;
                    if (i == 18) continue;
                    if (sum[unitKey] != "0" && sum[unitKey] != null && sum[unitKey] != "") {
                        if (sum["summary_defenders"].length > 0) {
                            sum["summary_defenders"] += ", ";
                        }
                        sum["summary_defenders"] += sum[unitKey] + " " + formatUnitType(i, sum[unitKey]);
                    }
                }
            },
            _forceRegionMap: function() {
                var app = qx.core.Init.getApplication();
                if (app.visMain.getMapMode() != "r") {
                    var cityId = webfrontend.data.City.getInstance().getId();
                    var city = webfrontend.data.Player.getInstance().cities[cityId];
                    var x = city.xPos;
                    var y = city.yPos;
                    app.setMainView('r', 0, x * app.visMain.getTileWidth(), y * app.visMain.getTileHeight());
                }
            },
            updateView: function(isAutoRefreshed) {

                var startTime = (new Date()).getTime();

                if (!this.isSeeable()) {
                    //console.log("Main summary view is hidden, nothing to update");
                    return;
                }

                if (isAutoRefreshed === true && startTime - this.lastUpdateViewTime <= bos.Const.MIN_INTERVAL_BETWEEN_AUTO_REFRESHES) {
                    //console.log("summary was recently auto updated skipping update");
                    return;
                }

                if (this.tabView.isSelected(this.citiesTab)) {
                    this.citiesTab.updateView();
                } else if (this.tabView.isSelected(this.militaryTab)) {
                    this.militaryTab.updateView();
                } else if (this.tabView.isSelected(this.defendersTab)) {
                    this.defendersTab.updateView();
                } else if (this.dungeonsTab != null && this.tabView.isSelected(this.dungeonsTab)) {
                    this.dungeonsTab.updateView();
                } else if (this.regionTab != null && this.tabView.isSelected(this.regionTab)) {
                    this.regionTab.updateView();
                } else if (this.tabView.isSelected(this.unitOrdersTab)) {
                    this.unitOrdersTab.updateView();
                } else if (this.tabView.isSelected(this.tradeOrdersTab)) {
                    this.tradeOrdersTab.updateView();
                } else if (this.tabView.isSelected(this.tradeRoutesTab)) {
                    this.tradeRoutesTab.updateView();
                } else if (this.tabView.isSelected(this.incomingAttacksTab)) {
                    this.incomingAttacksTab.updateView();
                } else if (this.tabView.isSelected(this.purifyResourcesTab)) {
                    this.purifyResourcesTab.updateView();
                } else if (this.tabView.isSelected(this.massRecruitmentTab)) {
                    this.massRecruitmentTab.updateView();
                } else if (this.tabView.isSelected(this.castlesTab)) {
                    this.castlesTab.updateView();
                }

                var server = bos.Server.getInstance();
                if (this.citiesTab.btnRefreshResources != null && server.getCityResourcesUpdateTime() != null) {
                    this.citiesTab.btnRefreshResources.setToolTipText("Resources refreshed at: " + qx.util.format.DateFormat.getDateTimeInstance().format(server.getCityResourcesUpdateTime()));
                }

                this.optionsTab.cbPersistCities.setValue(bos.Storage.getInstance().getPersistingCitiesEnabled());

                var finishTime = (new Date()).getTime();
                //console.log("summary.updateView took " + (finishTime - startTime) + "ms , previous update ended " + (startTime - this.lastUpdateViewTime) + "ms before current one started");
                this.lastUpdateViewTime = finishTime;
            }
        }
    });
});