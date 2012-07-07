/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:32
 */
(function (window, undefined) {
    qx.Class.define("bos.gui.RegionPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel("Region");
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnNames;
            if(locale == "de") {
                columnNames = [ "Type", "Name", "Pos", "Punkte", "Besitzer", "Spieler Id", "Allianz", "Allianz Id", "Entfernung" ];
            } else {
                columnNames = [ "City type", "Name", "Pos", "Points", "Owner", "Player Id", "Alliance", "Alliance Id", "Distance"];
            }

            var columnIds = ["id", "name", "position", "points", "owner", "playerId", "allianceName", "allianceId", "distance"];

            this._tableModel.setColumns(columnNames, columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(4, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            var res = webfrontend.res.Main.getInstance();

            //columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(1, 180);
            columnModel.setColumnWidth(2, 64);
            columnModel.setColumnWidth(3, 64);
            columnModel.setColumnWidth(4, 180);
            columnModel.setColumnVisible(5, false);
            columnModel.setColumnWidth(6, 140);
            columnModel.setColumnVisible(7, false);
            columnModel.setDataCellRenderer(1, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(4, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(6, new bos.ui.table.cellrenderer.ClickableLook());

            this.add(this.table, {flex: 1});

        },
        members: {
            createRowData: function() {
                var rowData = [];
                if (a.visMain.getMapMode() == "r") {
                    var cities = webfrontend.data.Player.getInstance().cities;
                    var city = webfrontend.data.City.getInstance();
                    var c = cities[city.getId()];

                    var res = webfrontend.res.Main.getInstance();
                    var se = a.visMain.selectableEntities;
                    for (var s in se) {
                        var entity = se[s];
                        if (entity != null && entity instanceof webfrontend.vis.WorldCity) {
                            if (entity.progress < 0) {
                                continue;
                            }
                            var row = [];
                            this._addBlankValuesToRow(row, this._tableModel);
                            row["id"] = this.translateCityType(entity.id) + " (" + entity.id + ")";

                            row["name"] = entity.getCityName();
                            row["position"] = entity.getCoordinates();
                            row["points"] = entity.getCityPoints();
                            row["playerId"] = entity.getPlayerId();
                            row["owner"] = entity.getPlayerName() + " (" + entity.getPlayerPoints() + ")";
                            if (row["owner"] != " (0)") {
                                row["owner"] = row["owner"];
                            }
                            row["allianceName"] = entity.getAllianceName();
                            row["allianceId"] = entity.getAllianceId();

                            var diffX = Math.abs(c.xPos - entity.getPosX());
                            var diffY = Math.abs(c.yPos - entity.getPosY());
                            row["distance"] = Math.sqrt(diffX * diffX + diffY * diffY);
                            rowData.push(row);
                        }
                    }
                }
                return rowData;
            },
            processRegionItem: function(city, entity) {
                if (entity instanceof ClientLib.Vis.Region.RegionCity) {
                    if (entity.get_PalaceLevel() == 0) {
                        return null;
                    }

                    var row = [];
                    this._addBlankValuesToRow(row, this._tableModel);
                    //row["id"] = this.translateCityType(entity.id) + " (" + entity.id + ")";

                    var xPos = entity.get_Coordinates() & 0xFFFF;
                    var yPos = entity.get_Coordinates() >> 16;

                    row["name"] = entity.get_Name();
                    row["position"] = bos.Utils.convertIdToCoodrinates(entity.get_Coordinates());
                    row["points"] = entity.get_Points();
                    row["playerId"] = entity.get_PlayerId();
                    row["owner"] = entity.get_PlayerName() + " (" + entity.get_PlayerPoints() + ")";
                    if (row["owner"] != " (0)") {
                        row["owner"] = row["owner"];
                    }
                    row["allianceName"] = entity.get_AllianceName();
                    row["allianceId"] = entity.get_AllianceId();

                    var diffX = Math.abs(city.xPos - xPos);
                    var diffY = Math.abs(city.yPos - yPos);
                    row["distance"] = Math.sqrt(diffX * diffX + diffY * diffY);

                    return row;
                } else {
                    return null;
                }
            },
            calculateCityType: function(cityType) {
                if (cityType >= 0 && cityType <= 7) {
                    return bos.Const.REGION_CITY;
                }
                if (cityType >= 8 && cityType <= 15) {
                    return bos.Const.REGION_CASTLE;
                }
                if (cityType >= 16 && cityType <= 23) {
                    return bos.Const.REGION_LAWLESS_CITY;
                }
                if (cityType >= 24 && cityType <= 34) {
                    return bos.Const.REGION_LAWLESS_CASTLE;
                }
                if (cityType >= 40 && cityType <= 40) {
                    return bos.Const.REGION_RUINS;
                }
                return bos.Const.REGION_UNKNOWN;
            },
            translateCityType: function(cityType) {
                var ct = this.calculateCityType(cityType);
                switch (ct) {
                    case bos.Const.REGION_CITY:
                        return this.tr("tnf:city");
                    case bos.Const.REGION_CASTLE:
                        return "Castle";
                    case bos.Const.REGION_LAWLESS_CITY:
                        return this.tr("tnf:lawless city");
                    case bos.Const.REGION_LAWLESS_CASTLE:
                        return "Lawless Castle";
                    case bos.Const.REGION_RUINS:
                        return "Ruins";
                    default:
                        return "???";
                }
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                var pos = rowData["position"];
                switch (event.getColumn()) {
                    case 1:
                    case 2:
                        if (pos != null) {
                            var coords = bos.Utils.extractCoordsFromClickableLook(pos);
                            var sepPos = coords.indexOf(":");
                            if (sepPos > 0) {
                                var x = parseInt(coords.substring(0, sepPos), 10);
                                var y = parseInt(coords.substring(sepPos + 1), 10);
                                a.setMainView('r', 0, x * a.visMain.getTileWidth(), y * a.visMain.getTileHeight());
                            }
                        }
                        break;
                    case 4:
                        if (rowData["playerId"]) {
                            var app = qx.core.Init.getApplication();
                            app.showInfoPage(app.getPlayerInfoPage(), {
                                id: rowData["playerId"]
                            });
                        }
                        break;
                    case 6:
                        if (rowData["allianceId"]) {
                            var app = qx.core.Init.getApplication();
                            app.showInfoPage(app.getAllianceInfoPage(), {
                                id: rowData["allianceId"]
                            });
                        }
                        break;
                }

            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                var btnCsvExport = new qx.ui.form.Button(locale == "de" ? "Export csv" : "Export csv");
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

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
})(window);