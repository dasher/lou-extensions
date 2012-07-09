/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:34
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.CitiesPage");

    qx.Class.define("bos.gui.CitiesPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("cities"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["id", "name", "position", "reference", "wood", "wood/h", "woodMax", "woodFree", "woodIncoming", "woodFullAt", "stone", "stone/h", "stoneMax", "stoneFree", "stoneIncoming", "stoneFullAt", "iron", "iron/h", "ironMax", "ironFree", "ironIncoming", "ironFullAt", "food", "food/h", "foodMax", "foodFree", "foodIncoming", "foodFullAt", "gold/h", "buildQueue", "unitQueue", "carts", "ships", "lastUpdated"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(1, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(2, 64);
            columnModel.setColumnWidth(3, 160);

            //hide all "*/h", "*Max", "*Free", "*Incoming", "*FullAt" columns
            var columnsPerRes = 6;
            var columnsBeforeWood = 4;
            for (var res = 1; res <= 4; res++) {
                var col = columnsBeforeWood + (res - 1) * columnsPerRes;
                col++; //skip resource count column
                columnModel.setColumnVisible(col++, false);
                columnModel.setColumnVisible(col++, false);
                columnModel.setColumnVisible(col++, false);
                columnModel.setColumnVisible(col++, false);
                columnModel.setColumnVisible(col++, false);
            }

            //gold/h
            var goldColumn = columnsBeforeWood + 4 * columnsPerRes;
            columnModel.setColumnVisible(goldColumn, false);

            columnModel.setDataCellRenderer(1, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setDataCellRenderer(goldColumn + 1, new bos.ui.table.cellrenderer.HumanTime());
            columnModel.setDataCellRenderer(goldColumn + 2, new bos.ui.table.cellrenderer.HumanTime());
            columnModel.setDataCellRenderer(goldColumn + 5, new bos.ui.table.cellrenderer.HumanTime(2));

            var resTypes = ["gold", "wood", "stone", "iron", "food"];
            for (var res = 1; res <= 4; res++) {
                var col = columnsBeforeWood + (res - 1) * columnsPerRes;
                var resType = resTypes[res];
                var resRenderer = new bos.ui.table.cellrenderer.Resource("right", "", "", "", resType + "Max", resType + "Free");
                columnModel.setDataCellRenderer(col, resRenderer);
            }

            var foodPerHourRenderer = new qx.ui.table.cellrenderer.Conditional("right", "", "", "");
            foodPerHourRenderer.addNumericCondition("<", 0, null, bos.Const.RESOURCE_RED, null, null);
            foodPerHourRenderer.addNumericCondition(">=", 0, null, bos.Const.RESOURCE_GREEN, null, null);
            columnModel.setDataCellRenderer(columnsBeforeWood + (4 - 1) * columnsPerRes + 1, foodPerHourRenderer);

            this.add(this.table, {flex: 1});
        },
        members: {
            table: null,
            _tableModel: null,
            sbCityType: null,
            sbContinents: null,
            createRowData: function() {

                var rowData = [];
                var cities = webfrontend.data.Player.getInstance().cities;
                var unknownValue = "";

                var sum = [];
                this._addBlankValuesToRow(sum, this._tableModel);
                sum["id"] = "Total";
                sum["name"] = "Total";

                var resTypes = ["wood", "stone", "iron", "food"];
                for (var i = 0; i < resTypes.length; i++) {
                    var res = resTypes[i];
                    sum[res] = 0;
                    sum[res + "/h"] = 0;
                    sum[res + "Max"] = 0;
                    sum[res + "Free"] = 0;
                    sum[res + "Incoming"] = 0;
                }

                sum["ts"] = 0;
                sum["gold/h"] = 0;
                sum["summary_defenders_ts"] = 0;

                var totalCarts = 0;
                var availableCarts = 0;
                var totalShips = 0;
                var availableShips = 0;

                var selectedCityType = null;
                var sel = this.sbCityType.getSelection();
                if (sel != null && sel.length > 0) {
                    selectedCityType = sel[0].getModel();
                }

                var selectedContinent = this.sbContinents.getSelection()[0].getModel();

                var summary = getSummaryWidget();
                var server = bos.Server.getInstance();
                for (var key in cities) {

                    var c = cities[key];

                    if (!bos.Utils.shouldCityBeIncluded(c, selectedCityType, selectedContinent)) {
                        continue;
                    }

                    var row = [];
                    this._addBlankValuesToRow(row, this._tableModel);
                    row["id"] = key;
                    row["name"] = c.name;
                    row["position"] = c.xPos + ":" + c.yPos;
                    row["lastUpdated"] = "";

                    row["reference"] = c.reference;

                    if (server.cities[key] == undefined) {

                        var resCity = server.cityResources["c" + key];
                        if (resCity != null) {
                            this._updateRowFromResCity(resCity, row);
                        }
                    } else {
                        var city = server.cities[key];

                        row["wood"] = parseInt(city.getResourceCount(bos.Const.WOOD));
                        row["wood/h"] = parseInt(city.getResourceGrowPerHour(bos.Const.WOOD));
                        row["woodMax"] = parseInt(city.getResourceMaxStorage(bos.Const.WOOD));
                        row["woodIncoming"] = parseInt(city.getTradeIncomingResources(bos.Const.WOOD));
                        row["woodFullAt"] = city.getResourceStorageFullTime(bos.Const.WOOD);
                        row["stone"] = parseInt(city.getResourceCount(bos.Const.STONE));
                        row["stone/h"] = parseInt(city.getResourceGrowPerHour(bos.Const.STONE));
                        row["stoneMax"] = parseInt(city.getResourceMaxStorage(bos.Const.STONE));
                        row["stoneIncoming"] = parseInt(city.getTradeIncomingResources(bos.Const.STONE));
                        row["stoneFullAt"] = city.getResourceStorageFullTime(bos.Const.STONE);
                        row["iron"] = parseInt(city.getResourceCount(bos.Const.IRON));
                        row["iron/h"] = parseInt(city.getResourceGrowPerHour(bos.Const.IRON));
                        row["ironMax"] = parseInt(city.getResourceMaxStorage(bos.Const.IRON));
                        row["ironIncoming"] = parseInt(city.getTradeIncomingResources(bos.Const.IRON));
                        row["ironFullAt"] = city.getResourceStorageFullTime(bos.Const.IRON);
                        row["food"] = parseInt(city.getResourceCount(bos.Const.FOOD));
                        row["food/h"] = parseInt(city.getFoodBalance());
                        row["foodMax"] = parseInt(city.getResourceMaxStorage(bos.Const.FOOD));
                        row["foodIncoming"] = parseInt(city.getTradeIncomingResources(bos.Const.FOOD));
                        row["foodFullAt"] = city.getResourceStorageFullTime(bos.Const.FOOD);

                        row["woodFree"] = row["woodMax"] - row["wood"];
                        row["stoneFree"] = row["stoneMax"] - row["stone"];
                        row["ironFree"] = row["ironMax"] - row["iron"];
                        row["foodFree"] = row["foodMax"] - row["food"];

                        row["buildQueue"] = city.buildQueueOcuppied();
                        row["unitQueue"] = city.unitQueueOcuppied();

                        row["lastUpdated"] = city.getLastUpdated();

                        var dg = city.getTraders();
                        if (dg != null) {
                            row["carts"] = dg[bos.Const.TRADE_TRANSPORT_CART].count.toString() + "/" + dg[bos.Const.TRADE_TRANSPORT_CART].total;
                            row["ships"] = dg[bos.Const.TRADE_TRANSPORT_SHIP].count.toString() + "/" + dg[bos.Const.TRADE_TRANSPORT_SHIP].total;

                            totalCarts += dg[bos.Const.TRADE_TRANSPORT_CART].total;
                            availableCarts += dg[bos.Const.TRADE_TRANSPORT_CART].count;
                            totalShips += dg[bos.Const.TRADE_TRANSPORT_SHIP].total;
                            availableShips += dg[bos.Const.TRADE_TRANSPORT_SHIP].count;
                        } else {
                            row["carts"] = "0/0";
                            row["ships"] = "0/0";
                        }

                    }

                    summary._populateResources(row, key);

                    for (var i = 0; i < resTypes.length; i++) {
                        var t = resTypes[i];

                        if (qx.lang.Type.isNumber(row[t]))
                            sum[t] += row[t];

                        t = resTypes[i] + "/h";
                        if (qx.lang.Type.isNumber(row[t]))
                            sum[t] += row[t];

                        t = resTypes[i] + "Max";
                        if (qx.lang.Type.isNumber(row[t]))
                            sum[t] += row[t];

                        t = resTypes[i] + "Free";
                        if (qx.lang.Type.isNumber(row[t]))
                            sum[t] += row[t];

                        t = resTypes[i] + "Incoming";
                        if (qx.lang.Type.isNumber(row[t]))
                            sum[t] += row[t];

                    }

                    if (qx.lang.Type.isNumber(row["gold/h"])) {
                        sum["gold/h"] += row["gold/h"];
                    }

                    rowData.push(row);
                }

                sum["carts"] = availableCarts + "/" + totalCarts;
                sum["ships"] = availableShips + "/" + totalShips;

                rowData.push(sum);

                return rowData;
            },
            _shouldBeIncluded: function(city) {
                var selectedCityType = null;
                var sel = this.sbCityType.getSelection();
                if (sel != null && sel.length > 0) {
                    selectedCityType = sel[0].getModel();
                }

                var selectedContinent = this.sbContinents.getSelection()[0].getModel();

                return bos.Utils.shouldCityBeIncluded(city, selectedCityType, selectedContinent);
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                var cityId = rowData["id"];
                if (cityId == "Total") {
                    return;
                }
                switch (event.getColumn()) {
                    case 1:
                        a.setMainView("c", cityId, -1, -1);
                        break;
                    case 2:
                        var cities = webfrontend.data.Player.getInstance().cities;
                        var city = cities[cityId];
                        if (city != null) {

                            var x = parseInt(city["xPos"], 10);
                            var y = parseInt(city["yPos"], 10);

                            a.setMainView('r', 0, x * a.visMain.getTileWidth(), y * a.visMain.getTileHeight());
                        }
                        break;
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbCityType = bos.Utils.createCitiesTypesSelectBox();
                bos.Utils.populateCitiesTypesSelectBox(this.sbCityType);
                bos.Storage.getInstance().addListener("changeCustomCityTypesVersion", function(event) {
                    bos.Utils.populateCitiesTypesSelectBox(this.sbCityType);
                }, this);
                this.sbCityType.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbCityType);

                this.sbContinents = bos.Utils.createCitiesContinentsSelectBox();
                this.sbContinents.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbContinents);

                this.btnRefreshResources = new qx.ui.form.Button(tr("btnRefreshResources"));
                this.btnRefreshResources.setToolTipText(tr("btnRefreshResources_toolTip"));
                this.btnRefreshResources.setWidth(120);
                if (locale == "de") {
                    this.btnRefreshResources.setWidth(150);
                }

                var btnRefreshView = new qx.ui.form.Button(tr("btnRefreshView"));
                btnRefreshView.setToolTipText(tr("btnRefreshView_toolTip"));
                btnRefreshView.setWidth(120);
                btnRefreshView.addListener("execute", this.updateView, this);

                var ministerTradePresent = webfrontend.data.Player.getInstance().getMinisterTradePresent();
                if (!ministerTradePresent) {
                    toolBar.add(this.btnRefreshResources);
                    toolBar.add(btnRefreshView);
                }
                this.btnRefreshResources.addListener("execute", function(evt) {
                    var summary = getSummaryWidget();
                    summary._requestedResourceRefreshView = true;
                    summary.fetchResources();
                }, this);

                var btnFetchCities = new qx.ui.form.Button(tr("btnFetchCities"));
                btnFetchCities.setToolTipText(tr("btnFetchCities_toolTip"));
                btnFetchCities.setWidth(100);
                btnFetchCities.addListener("execute", this.fetchCities, this);
                toolBar.add(btnFetchCities);

                var fillMenu = new qx.ui.menu.Menu();

                var fillWithWood = new qx.ui.menu.Button(tr("wood"), null);
                fillWithWood.addListener("execute", function(event) {
                    var cities = this._createCitiesIds();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.WOOD);
                }, this);
                fillMenu.add(fillWithWood);

                var fillWithStone = new qx.ui.menu.Button(tr("stone"), null);
                fillWithStone.addListener("execute", function(event) {
                    var cities = this._createCitiesIds();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.STONE);
                }, this);
                fillMenu.add(fillWithStone);

                var fillWithIron = new qx.ui.menu.Button(tr("iron"), null);
                fillWithIron.addListener("execute", function(event) {
                    var cities = this._createCitiesIds();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.IRON);
                }, this);
                fillMenu.add(fillWithIron);

                var fillWithFood = new qx.ui.menu.Button(tr("food"), null);
                fillWithFood.addListener("execute", function(event) {
                    var cities = this._createCitiesIds();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.FOOD);
                }, this);
                fillMenu.add(fillWithFood);

                var btnFillWith = new qx.ui.form.MenuButton(tr("fill with"), null, fillMenu);
                toolBar.add(btnFillWith);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setToolTipText(tr("btnCsvExport_toolTip"));
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

                var btnHelp = new qx.ui.form.Button(tr("help"));
                btnHelp.setWidth(120);
                toolBar.add(btnHelp);
                btnHelp.addListener("execute", function(evt) {
                    var dialog = new webfrontend.gui.ConfirmationWidget();
                    if (locale == "de"){
                        dialog.showGenericNotice("Summary Hilfe", "Die Städte werden nach speziellen Zeichen in den Referenzen sortiert.Diese Zeichen werden durch *Zeichen* makiert und können an einer beliebigen Stelle in der Referenz stehen. Als Beispiel: 'Kont 23_3 *CM*'würde eine Burg darstellen, welche auch Mondsteine herstellen kann.", "C - Burg (Castle), M - Mondstein, W - Lager(Warehouse), B - In Bau/Aufbau, D - Defensive, G - Gold", "webfrontend/ui/bgr_popup_survey.gif");
                    }
                    else {
                        dialog.showGenericNotice("Summary Help", "Cities are categorized according to special pattern in city reference. Pattern is *OPTIONS* and could be placed anywhere. For example '*CM* some more info' means castle which could produce moonstones", "C - Castle, M - Moonstones, W - Warehouse, B - Building, D - Defensive, G - Gold", "webfrontend/ui/bgr_popup_survey.gif");
                    }

                    qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                    dialog.show();
                }, this);

                return toolBar;
            },
            _createCitiesIds: function() {
                var rows = this.createRowData();

                var citiesIds = [];

                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    var cityId = row["id"];
                    if (cityId != "Total") {
                        citiesIds.push(cityId);
                    }
                }
                return citiesIds;
            },
            fetchCities: function() {
                var citiesIds = this._createCitiesIds();
                var server = bos.Server.getInstance();
                server.pollCities(citiesIds);
            }
        }
    });
});