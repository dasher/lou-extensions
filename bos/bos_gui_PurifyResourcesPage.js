/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:23
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.PurifyResourcesPage");

    qx.Class.define("bos.gui.PurifyResourcesPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("purify"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();
            var columnIds = ["id", "name", "position", "reference", "wood", "woodMax", "woodFree", "stone", "stoneMax", "stoneFree", "iron", "ironMax", "ironFree", "food", "foodMax", "foodFree", "purifiable", "darkwood", "runestone", "veritum", "trueseed"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(16, false);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", function(event) {
                this._handleCellClick(event, this._tableModel);
            }, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(1, 100);
            columnModel.setDataCellRenderer(1, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setColumnWidth(2, 64);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            var index = 4;
            for (var res = 1; res <= 4; res++) {
                columnModel.setColumnWidth(index++, 90);
                columnModel.setColumnVisible(index++, false);
                columnModel.setColumnVisible(index++, false);
            }

            var woodRenderer = new bos.ui.table.cellrenderer.Resource("right", "", "", "", "woodMax", "woodFree");
            columnModel.setDataCellRenderer(4, woodRenderer);

            var stoneRenderer = new bos.ui.table.cellrenderer.Resource("right", "", "", "", "stoneMax", "stoneFree");
            columnModel.setDataCellRenderer(7, stoneRenderer);

            var ironRenderer = new bos.ui.table.cellrenderer.Resource("right", "", "", "", "ironMax", "ironFree");
            columnModel.setDataCellRenderer(10, ironRenderer);

            var foodRenderer = new bos.ui.table.cellrenderer.Resource("right", "", "", "", "foodMax", "foodFree");
            columnModel.setDataCellRenderer(13, foodRenderer);

            columnModel.setColumnWidth(16, 70);

            for (var i = 0; i < 4; i++) {
                columnModel.setDataCellRenderer(17 + i, new bos.ui.table.cellrenderer.ClickableLook());
                columnModel.setColumnWidth(17 + i, 50);
            }

            this.add(this.table, {flex: 1});

        }, members: {
            _purifyOptionsWidget: null,
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                var btnPurifyAll = new qx.ui.form.Button(tr("btnPurifyAll"));
                btnPurifyAll.setToolTipText(tr("btnPurifyAll_toolTip"));
                btnPurifyAll.setWidth(120);
                toolBar.add(btnPurifyAll);
                btnPurifyAll.addListener("execute", function(evt) {
                    webfrontend.gui.MessageBox.messageBox({
                        title: tr("confirmation"),
                        text: tr("are you sure?"),
                        textRich: true,
                        executeOk: function() {
                            this._purifyAllResources(this._tableModel);
                        },
                        callbackContext: this
                    });
                }, this);

                var btnPurifyOptions = new qx.ui.form.Button(tr("btnPurifyOptions"));
                btnPurifyOptions.setToolTipText(tr("btnPurifyOptions_toolTip"));
                btnPurifyOptions.setWidth(120);
                toolBar.add(btnPurifyOptions);
                btnPurifyOptions.addListener("execute", function(evt) {
                    var widget = this._getPurifyOptionsWidget();
                    widget.open();
                }, this);

                var btnMarkMoonglowTower = new qx.ui.form.Button(tr("btnMarkMoonglowTower"));
                btnMarkMoonglowTower.setToolTipText(tr("btnMarkMoonglowTower_toolTip"));
                btnMarkMoonglowTower.setWidth(180);
                btnMarkMoonglowTower.addListener("execute", this.markMoonglowTower, this);
                toolBar.add(btnMarkMoonglowTower);

                var btnUnmarkMoonglowTower = new qx.ui.form.Button(tr("btnUnmarkMoonglowTower"));
                btnUnmarkMoonglowTower.setToolTipText(tr("btnUnmarkMoonglowTower_toolTip"));
                btnUnmarkMoonglowTower.setWidth(180);
                btnUnmarkMoonglowTower.addListener("execute", this.unmarkMoonglowTower, this);
                toolBar.add(btnUnmarkMoonglowTower);

                var btnMarkMoonglowTower = new qx.ui.form.Button(tr("btnMarkAllMoonglowTowers"));
                btnMarkMoonglowTower.setToolTipText(tr("btnMarkAllMoonglowTowers_toolTip"));
                btnMarkMoonglowTower.setWidth(180);
                btnMarkMoonglowTower.addListener("execute", this.markAllMoonglowTowers, this);
                toolBar.add(btnMarkMoonglowTower);

                var btnHelp = new qx.ui.form.Button(tr("help"));
                btnHelp.setWidth(120);
                toolBar.add(btnHelp);
                btnHelp.addListener("execute", function(evt) {
                    var dialog = new webfrontend.gui.ConfirmationWidget();
                    dialog.showGenericNotice(tr("help"), tr("purificationHelp"), "", "webfrontend/ui/bgr_popup_survey.gif");
                    qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                    dialog.show();
                }, this);

                return toolBar;
            },
            markMoonglowTower: function() {
                var city = webfrontend.data.City.getInstance();
                var buildings = this._louApp.visMain.getBuildings();

                if (buildings.length == 0) {
                    bos.Utils.handleWarning(tr("you need to be in city"));
                    return;
                }

                for (var i = 0; i < buildings.length; i++) {
                    var b = buildings[i];
                    var bType = parseInt(b.getType());

                    if (bType == 36 && b.level == 10) {
                        var towerId = b.visId;
                        var cityId = city.getId();
                        bos.Storage.getInstance().addMoonglowTower(cityId, towerId);
                        this.updateView();
                        return;
                    }
                }

                bos.Utils.handleWarning("Couldn't find Moonglow Tower at level 10");

            },
            markAllMoonglowTowers: function() {
                var withMoonglow = bos.CityTypes.getInstance().getCitiesWithMoonglowTower();

                var cities = webfrontend.data.Player.getInstance().cities;

                for (var key in withMoonglow) {
                    var cityId = parseInt(withMoonglow[key]);
                    var c = cities[cityId];

                    if (c == null) {
                        continue;
                    }

                    var towerId = bos.Storage.getInstance().findMoonglowTowerId(cityId);
                    if (towerId > 0) {
                        continue;
                    }

                    towerId = 1;
                    bos.Storage.getInstance().addMoonglowTower(cityId, towerId);
                }
                this.updateView();
            },
            unmarkMoonglowTower: function() {
                var city = webfrontend.data.City.getInstance();
                var cityId = city.getId();
                bos.Storage.getInstance().removeMoonglowTower(cityId);
                this.updateView();
            },
            _purifyAllResources: function() {
                var ministerBuildPresent = webfrontend.data.Player.getInstance().getMinisterTradePresent();
                if (ministerBuildPresent) {
                    this._purifyAllResourcesImpl();
                } else {
                    var summary = getSummaryWidget();
                    summary._requestedResourceRefreshView = true;

                    var server = bos.Server.getInstance();
                    server.addListener("bos.data.changeCityResourcesUpdateTime", this._resourcesRefreshed, this);

                    summary.fetchResources();
                }
            },
            _resourcesRefreshed: function() {
                var server = bos.Server.getInstance();
                server.removeListener("bos.data.changeCityResourcesUpdateTime", this._resourcesRefreshed, this);
                this._purifyAllResourcesImpl();
            },
            _purifyAllResourcesImpl: function() {

                var storage = bos.Storage.getInstance();
                var purifyOptions = storage.getPurifyOptions();
                var towers = storage.getMoonglowTowers();

                var rowData = this.createRowData();

                var totalCreated = 0;

                var types = ["", "darkwood", "runestone", "veritum", "trueseed"];
                var rawTypes = ["", "wood", "stone", "iron", "food"];

                var totalDelay = 0;

                var ministerBuildPresent = webfrontend.data.Player.getInstance().getMinisterTradePresent();

                for (var i = 0; i < rowData.length; i++) {
                    var row = rowData[i];

                    var cityInfo = bos.CityTypes.getInstance().parseReference(row["reference"]);
                    if (cityInfo.isCastle && !purifyOptions.includeCastles) {
                        continue;
                    }

                    var res = [];

                    for (var r = 1; r <= 4; r++) {
                        var resType = types[r];
                        var purify = row[resType] * bos.Const.MOONSTONE_COST;
                        if (purify == 0) {
                            continue;
                        }

                        if (r == 4) {
                            if (row["food/h"] != undefined && row["food/h"] < 0) {
                                continue;
                            }
                            if (!ministerBuildPresent && cityInfo.isCastle) {
                                continue;
                            }
                        }

                        var minimumResLevel = purifyOptions.minimumResLevels[r];

                        if (minimumResLevel > 0) {
                            var rawType = rawTypes[r];
                            if (ministerBuildPresent) {
                                var max = row[rawType + "Max"];
                                if (max > 0) {
                                    var keepRes = Math.floor(max * minimumResLevel / 100.0);
                                    purify -= keepRes;
                                }
                            } else {
                                purify -= minimumResLevel;
                            }
                        }

                        if (purify < bos.Const.MOONSTONE_COST) {
                            continue;
                        }

                        res.push({
                            t: r,
                            c: purify
                        });
                    }
                    if (res.length > 0) {
                        var created = this._purifyResources(storage, row, res);
                        totalCreated += created;

                        totalDelay += bos.Const.MIN_SEND_COMMAND_INTERVAL;
                    }
                }

                bos.Utils.handleInfo("It will take " + Math.floor(totalDelay / 1000) + " seconds to refine " + totalCreated + " resources");
            },
            _purifyResources: function(storage, row, res) {
                var created = 0;
                var cityId = row["id"];
                if (res.length == 0) {
                    return 0;
                }
                var towerId = storage.findMoonglowTowerId(cityId);
                if (towerId >= 0) {

                    bos.net.CommandManager.getInstance().sendCommand("ResourceToVoid", {
                        cityid: parseInt(cityId),
                        res: res
                    }, this, this._onResourcesPurified);

                    for (var i = 0; i < res.length; i++) {
                        created += res[i].c;
                    }
                }
                return created;
            },
            _onResourcesPurified: function(result) {
                //do nothing
            },
            createRowData: function() {
                var rowData = [];

                var withMoonglow = bos.CityTypes.getInstance().getCitiesWithMoonglowTower();

                var cities = webfrontend.data.Player.getInstance().cities;

                var summary = getSummaryWidget();

                var unknownValue = "";

                var server = bos.Server.getInstance();

                for (var key in withMoonglow) {
                    var cityId = parseInt(withMoonglow[key]);
                    var c = cities[cityId];

                    if (c == null) {
                        continue;
                    }

                    var row = [];
                    this._addBlankValuesToRow(row, this._tableModel);
                    row["id"] = cityId;
                    row["name"] = c.name;
                    row["position"] = c.xPos + ":" + c.yPos;
                    row["reference"] = c.reference;

                    if (server.cities[cityId] == undefined) {

                        var resCity = server.cityResources["c" + cityId];
                        if (resCity != null) {
                            summary._updateRowFromResCity(resCity, row);
                        }

                    } else {
                        var city = server.cities[cityId];

                        row["wood"] = parseInt(city.getResourceCount(bos.Const.WOOD));
                        row["stone"] = parseInt(city.getResourceCount(bos.Const.STONE));
                        row["iron"] = parseInt(city.getResourceCount(bos.Const.IRON));
                        row["food"] = parseInt(city.getResourceCount(bos.Const.FOOD));

                        row["woodMax"] = parseInt(city.getResourceMaxStorage(bos.Const.WOOD));
                        row["stoneMax"] = parseInt(city.getResourceMaxStorage(bos.Const.STONE));
                        row["ironMax"] = parseInt(city.getResourceMaxStorage(bos.Const.IRON));
                        row["foodMax"] = parseInt(city.getResourceMaxStorage(bos.Const.FOOD));

                        row["woodFree"] = row["woodMax"] - row["wood"];
                        row["stoneFree"] = row["stoneMax"] - row["stone"];
                        row["ironFree"] = row["ironMax"] - row["iron"];
                        row["foodFree"] = row["foodMax"] - row["food"];
                    }

                    summary._populateResources(row, cityId);

                    if (!(row["wood"] === unknownValue && row["stone"] === unknownValue && row["iron"] === unknownValue && row["food"] === unknownValue)) {
                        var wood = Math.floor(row["wood"] / bos.Const.MOONSTONE_COST);
                        var stone = Math.floor(row["stone"] / bos.Const.MOONSTONE_COST);
                        var iron = Math.floor(row["iron"] / bos.Const.MOONSTONE_COST);
                        var food = Math.floor(row["food"] / bos.Const.MOONSTONE_COST);

                        row["purifiable"] = wood + stone + iron + food;

                        if (row["purifiable"] > 0) {
                            var towerId = bos.Storage.getInstance().findMoonglowTowerId(cityId);
                            if (towerId > 0) {
                                //"darkwood", "runestone", "veritum", "trueseed"
                                row["darkwood"] = wood;
                                row["runestone"] = stone;
                                row["veritum"] = iron;
                                row["trueseed"] = food;
                            }
                        }
                    }

                    rowData.push(row);
                }

                return rowData;
            },
            _getPurifyOptionsWidget: function() {
                if (this._purifyOptionsWidget == null) {
                    this._purifyOptionsWidget = new bos.gui.PurifyOptionsWidget();
                }
                return this._purifyOptionsWidget;
            },
            _handleCellClick: function(event, tableModel) {

                var row = event.getRow();
                var rowData = tableModel.getRowDataAsMap(row);
                var cityId = rowData["id"];
                var cityInfo = bos.CityTypes.getInstance().parseReference(rowData["reference"]);

                var storage = bos.Storage.getInstance();
                var towerId = storage.findMoonglowTowerId(cityId);

                var resources = [];
                switch (event.getColumn()) {
                    case 1:
                        this._louApp.setMainView("c", cityId, -1, -1);
                        break;
                    case 2:
                        var cities = webfrontend.data.Player.getInstance().cities;
                        var city = cities[cityId];
                        if (city != null) {
                            var x = parseInt(city["xPos"]);
                            var y = parseInt(city["yPos"]);

                            this._louApp.setMainView('r', 0, x * this._louApp.visMain.getTileWidth(), y * this._louApp.visMain.getTileHeight());
                        }
                        break;
                    case 17:
                        resources.push({
                            t: bos.Const.WOOD,
                            c: rowData["darkwood"] * bos.Const.MOONSTONE_COST
                        });
                        break;
                    case 18:
                        resources.push({
                            t: bos.Const.STONE,
                            c: rowData["runestone"] * bos.Const.MOONSTONE_COST
                        });
                        break;
                    case 19:
                        resources.push({
                            t: bos.Const.IRON,
                            c: rowData["veritum"] * bos.Const.MOONSTONE_COST
                        });
                        break;
                    case 20:
                        if (cityInfo.isCastle) {
                            bos.Utils.handleWarning("purifing food in castles is prohibited");
                            return;
                        }
                        resources.push({
                            t: bos.Const.FOOD,
                            c: rowData["trueseed"] * bos.Const.MOONSTONE_COST
                        });
                        break;
                };

                if (towerId < 0) {
                    return;
                }

                if (resources.length > 0) {
                    var ministerBuildPresent = webfrontend.data.Player.getInstance().getMinisterTradePresent();
                    if (!ministerBuildPresent) {
                        bos.Utils.handleWarning("Currently only mass purification is enabled for players without Trade Minister");
                        return;
                    }

                    if (this._waitingForFullMessage) {
                        bos.Utils.handleWarning("Resource auto refresh has to be turned on (which requires Trade Minister)");
                        return;
                    }

                    this._purifyResources(storage, rowData, resources);
                }
            }
        }
    });
});