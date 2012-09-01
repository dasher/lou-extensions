/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:33
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.CastlesPage");

    qx.Class.define("bos.gui.CastlesPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("castles"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();
            var columnNames;
            if( locale == "de") {
                columnNames = [ "Id", "Name", "Pos", "Nahrung", "Nahrung: Lagerkapazität", "Keine Nahrung mehr am", "Einheiten", "Rekutierungsliste", "Orders", "TS der Einheiten die z.Z. verfügbar sind", "Holz: Lagerkapazität", "Eisen: Lagerkapazität", "Verteidiger (Doppelklicken zum Auswählen)"];
            } else {
                columnNames = [ "Id", "Name", "Pos", "Food", "Food: storage capacity", "Food empty in", "Units", "Units queue", "Orders", "Not raiding", "Wood: storage capacity", "Iron: storage capacity", "Defenders (dbl click to select)"];
            }
            var columnIds = ["id", "name", "position", "foodLevel", "foodFree", "foodEmptyAt", "unitsLevel", "unitQueue", "activeOrders", "unitsAtHome", "woodFree", "ironFree", "summary_defenders"];

            this._tableModel.setColumns(columnNames, columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(5, true);
            this._tableModel.setColumnEditable(12, true);

            var custom = {
                tableColumnModel : function(obj) {
                    return new qx.ui.table.columnmodel.Resize(obj);
                }
            };

            this.table = new bos.ui.table.Table(this._tableModel, custom);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            var res = webfrontend.res.Main.getInstance();

            columnModel.setColumnVisible(0, false);
            columnModel.setDataCellRenderer(1, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            var foodRenderer = new qx.ui.table.cellrenderer.Conditional("right", "", "", "");
            foodRenderer.addNumericCondition("<", 25, null, bos.Const.RESOURCE_RED, null, null);
            foodRenderer.addNumericCondition(">=", 25, null, bos.Const.TABLE_DEFAULT_COLOR, null, null);
            foodRenderer.addNumericCondition(">=", 50, null, bos.Const.RESOURCE_YELLOW, null, null);
            foodRenderer.addNumericCondition(">=", 75, null, bos.Const.RESOURCE_GREEN, null, null);
            columnModel.setDataCellRenderer(3, foodRenderer);

            columnModel.setDataCellRenderer(5, new bos.ui.table.cellrenderer.HumanTime(true));
            columnModel.setDataCellRenderer(7, new bos.ui.table.cellrenderer.HumanTime());

            var unitsRenderer = new qx.ui.table.cellrenderer.Conditional("right", "", "", "");
            unitsRenderer.addNumericCondition("<", 25, null, bos.Const.RESOURCE_RED, null, null);
            unitsRenderer.addNumericCondition(">=", 25, null, bos.Const.TABLE_DEFAULT_COLOR, null, null);
            unitsRenderer.addNumericCondition(">=", 50, null, bos.Const.RESOURCE_YELLOW, null, null);
            unitsRenderer.addNumericCondition(">=", 75, null, bos.Const.RESOURCE_GREEN, null, null);
            columnModel.setDataCellRenderer(6, unitsRenderer);

            var tcm = this.table.getTableColumnModel();
            var resizeBehavior = tcm.getBehavior();
            resizeBehavior.setWidth(1, 100);
            resizeBehavior.setWidth(2, 64);
            resizeBehavior.setWidth(3, 50);
            resizeBehavior.setWidth(4, 120);
            resizeBehavior.setWidth(5, 100);
            resizeBehavior.setWidth(6, 50);
            resizeBehavior.setWidth(7, 100);
            resizeBehavior.setWidth(8, 50);
            resizeBehavior.setWidth(9, 80);
            resizeBehavior.setWidth(10, 90);
            resizeBehavior.setWidth(11, 90);
            resizeBehavior.setWidth(12, "1*");
            resizeBehavior.setMinWidth(12, 100);

            this.add(this.table, {flex: 1});
        },
        members: {
            fillRequests: new Array(),
            createRowData: function() {
                var rowData = [];

                var castles = bos.CityTypes.getInstance().getCastles();

                var cities = webfrontend.data.Player.getInstance().cities;
                var server = bos.Server.getInstance();

                for (var key in castles) {
                    var cityId = parseInt(castles[key]);
                    var c = cities[cityId];

                    if (c == null) {
                        continue;
                    }

                    var unknownValue = "";

                    var row = [];
                    this._addBlankValuesToRow(row, this._tableModel);
                    row["id"] = cityId;
                    row["name"] = c.name;
                    row["position"] = c.xPos + ":" + c.yPos;

                    var city = server.cities[cityId];
                    if (city != undefined) {

                        var wood = parseInt(city.getResourceCount(bos.Const.WOOD));
                        var iron = parseInt(city.getResourceCount(bos.Const.IRON));
                        var food = parseInt(city.getResourceCount(bos.Const.FOOD));

                        var maxFood = city.getResourceMaxStorage(bos.Const.FOOD);

                        row["woodFree"] = parseInt(city.getResourceMaxStorage(bos.Const.WOOD)) - wood;
                        row["ironFree"] = parseInt(city.getResourceMaxStorage(bos.Const.IRON)) - iron;
                        row["foodFree"] = maxFood - food;

                        if (maxFood > 0) {
                            row["foodLevel"] = parseInt(100 * food / maxFood);
                            row["foodLevel"] = row["foodLevel"];
                        }

                        if (city.getUnitLimit() > 0) {
                            var totalUnits = city.getUnitCount() + city.getUnitsInQueue();
                            row["unitsLevel"] = parseInt(100 * totalUnits / city.getUnitLimit());
                            row["unitsLevel"] = row["unitsLevel"];
                        }

                        var foodBallance = city.getFoodBalance();
                        if (foodBallance >= 0) {
                            row["foodEmptyAt"] = "food positive";
                        } else {
                            var totalConsumption = city.getFoodConsumption() + city.getFoodConsumptionSupporter() + city.getFoodConsumptionQueue();
                            var emptyAt = city.getResourceStorageEmptyTime(bos.Const.FOOD, totalConsumption);
                            var timeDiff = emptyAt - new Date();
                            row["foodEmptyAt"] = parseInt(timeDiff / 1000);
                        }

                        row["unitQueue"] = city.unitQueueOcuppied();
                        row["activeOrders"] = city.getUnitOrders() != null ? city.getUnitOrders().length : 0;

                        var sum = [];
                        getSummaryWidget()._addDefendersToRow(city, row, sum);
                    }

                    if (getSummaryWidget()._populateResources(row, cityId)) {
                        if (row["foodMax"] > 0) {
                            row["foodLevel"] = parseInt(100 * row["food"] / row["foodMax"]);
                            row["foodLevel"] = row["foodLevel"];
                        }
                    }

                    rowData.push(row);
                }

                return rowData;
            },
            _shouldBeIncluded: function(city) {
                return true;
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                var cityId = rowData["id"];
                switch (event.getColumn()) {
                    case 1:
                        this._louApp.setMainView("c", cityId, -1, -1);
                        break;
                    case 2:
                        var cities = webfrontend.data.Player.getInstance().cities;
                        var city = cities[cityId];
                        if (city != null) {
                            var x = parseInt(city["xPos"], 10);
                            var y = parseInt(city["yPos"], 10);

                            this._louApp.setMainView('r', 0, x * this._louApp.visMain.getTileWidth(), y * this._louApp.visMain.getTileHeight());
                        }
                        break;
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                var fillMenu = new qx.ui.menu.Menu();

                var fillWithWood = new qx.ui.menu.Button(tr("wood"), null);
                fillWithWood.addListener("execute", function(event) {
                    var cities = bos.CityTypes.getInstance().getCastles();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.WOOD);
                }, this);
                fillMenu.add(fillWithWood);

                var fillWithStone = new qx.ui.menu.Button(tr("stone"), null);
                fillWithStone.addListener("execute", function(event) {
                    var cities = bos.CityTypes.getInstance().getCastles();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.STONE);
                }, this);
                fillMenu.add(fillWithStone);

                var fillWithIron = new qx.ui.menu.Button(tr("iron"), null);
                fillWithIron.addListener("execute", function(event) {
                    var cities = bos.CityTypes.getInstance().getCastles();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.IRON);
                }, this);
                fillMenu.add(fillWithIron);

                var fillWithFood = new qx.ui.menu.Button(tr("food"), null);
                fillWithFood.addListener("execute", function(event) {
                    var cities = bos.CityTypes.getInstance().getCastles();
                    bos.BatchResourcesFiller.getInstance().fillCitiesWithResources(cities, bos.Const.FOOD);
                }, this);
                fillMenu.add(fillWithFood);

                var btnFillWith = new qx.ui.form.MenuButton(tr("fill with"), null, fillMenu);
                toolBar.add(btnFillWith);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    this.updateView();
                }, this);

                return toolBar;
            }
        }
    });
});