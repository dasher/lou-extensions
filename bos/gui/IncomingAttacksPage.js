/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:29
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.IncomingAttacksPage");

    qx.Class.define("bos.gui.IncomingAttacksPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("incoming attacks"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["id", "targetCityId", "targetCityName", "targetPosition", "targetTS", "lastUpdated", //5
                "type", "state", "start", "end",
                "attackerCityId", "attackerCityName", "attackerPosition", "player", "playerName", "alliance", "allianceName", "attackerTS", "attackerUnits", "spotted", "claim"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(2, false);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            var res = webfrontend.res.Main.getInstance();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnVisible(1, false);

            columnModel.setColumnWidth(2, 70);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(3, 64);
            columnModel.setDataCellRenderer(3, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(4, 64);

            columnModel.setColumnWidth(5, 80);
            columnModel.setDataCellRenderer(5, new bos.ui.table.cellrenderer.HumanTime(2));

            columnModel.setColumnWidth(6, 70);
            columnModel.setColumnWidth(7, 70);
            columnModel.setColumnVisible(7, false);
            columnModel.setColumnWidth(8, 120);
            columnModel.setColumnVisible(8, false);
            columnModel.setColumnWidth(9, 120);

            columnModel.setColumnVisible(10, false);
            columnModel.setColumnWidth(11, 70);
            columnModel.setDataCellRenderer(11, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(12, 64);
            columnModel.setDataCellRenderer(12, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnVisible(13, false);
            columnModel.setDataCellRenderer(14, new bos.ui.table.cellrenderer.ClickableLook());

            //allianceId
            columnModel.setColumnVisible(15, false);
            //alliance name
            columnModel.setDataCellRenderer(16, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(17, 64);
            columnModel.setColumnVisible(17, true);

            columnModel.setColumnWidth(18, 120);
            columnModel.setColumnVisible(18, true);

            columnModel.setColumnWidth(20, 40);

            this.add(this.table, { flex : 1 });

            this.updateIcon();

            if (webfrontend.data.AllianceAttack != undefined) {
                webfrontend.data.AllianceAttack.getInstance().addListener("changeVersion", this.updateIcon, this);
            }

        },
        members: {
            sbOrderTypes: null,
            sbDefenderTypes: null,
            attacksInfo: new Object(),
            createRowData: function() {
                var rowData = [];
                var cities = webfrontend.data.Player.getInstance().cities;
                var player = webfrontend.data.Player.getInstance();
                var playerId = player.getId();

                var serverTime = webfrontend.data.ServerTime.getInstance();
                var storage = bos.Storage.getInstance();

                var addedAttacks = {};

                var filterTypeId = -1;
                var sel = this.sbOrderTypes.getSelection();
                if (sel != null && sel.length > 0) {
                    filterTypeId = sel[0].getModel();
                }

                var defenderTypeId = -1;
                var sel = this.sbDefenderTypes.getSelection();
                if (sel != null && sel.length > 0) {
                    defenderTypeId = sel[0].getModel();
                }

                var server = bos.Server.getInstance();
                var list = player.getIncomingUnitOrders();
                if (list != null && defenderTypeId != 2) {

                    for (var i = 0, iCount = list.length; i < iCount; i++) {
                        var item = list[i];

                        if (filterTypeId != -1 && filterTypeId != item.type) {
                            continue;
                        }

                        var row = [];
                        this._addBlankValuesToRow(row, this._tableModel);

                        var cityId = item.targetCity;

                        addedAttacks["a" + item.id] = true;

                        row["id"] = item.id;
                        row["targetCityId"] = cityId;
                        row["targetCityName"] = item.targetCityName;
                        if (cityId >= 0) {
                            row["targetPosition"] = bos.Utils.convertIdToCoodrinates(cityId);
                            row["targetTS"] = item.ts_defender;
                            var city = server.cities[cityId];
                            if (city != undefined) {
                                row["lastUpdated"] = city.getLastUpdated();
                            }
                        }

                        row["type"] = bos.Utils.translateOrderType(item.type);
                        row["state"] = this.translateState(item.state);
                        row["start"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.start));
                        row["end"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.end));

                        row["spotted"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.detectionStep));
                        row["claim"] = (item.hasBaron) ? item.claim : "";

                        row["attackerCityId"] = item.city;
                        row["attackerPosition"] = bos.Utils.convertIdToCoodrinates(item.city);
                        row["attackerCityName"] = item.cityName;

                        row["player"] = item.player;
                        row["playerName"] = item.playerName;
                        row["alliance"] = item.alliance;
                        row["allianceName"] = item.allianceName;

                        row["attackerUnits"] = "";
                        row["attackerTS"] = item.ts_attacker;
                        if (item.units != null) {
                            for (var u = 0; u < item.units.length; u++) {
                                var unit = item.units[u];
                                if (u > 0) {
                                    row["attackerUnits"] += ", ";
                                }
                                row["attackerUnits"] += unit.count + " " + formatUnitType(unit.type, unit.count);
                                //var space = unit.count * getUnitRequiredSpace(unit.type);
                                //row["attackerTS"] += space;
                            }
                        } else {
                            var intel = storage.findIntelligenceById(item.city);
                            row["attackerUnits"] = (intel == null) ? "?" : "intel: " + intel.description;
                        }

                        rowData.push(row);
                    }
                }

                if (webfrontend.data.AllianceAttack != undefined) {
                    list = webfrontend.data.AllianceAttack.getInstance().getAttacks();
                } else {
                    list = null;
                }
                if (list != null && defenderTypeId != 1) {
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];

                        if (addedAttacks["a" + item.id] != undefined || (defenderTypeId == -1 && item.tp == playerId)) {
                            //dont add twice the same attack and dont show play attacks and alliance attacks for the same city
                            continue;
                        }

                        if (filterTypeId != -1 && filterTypeId != item.type) {
                            continue;
                        }

                        var row = [];
                        this._addBlankValuesToRow(row, this._tableModel);

                        /*
                         "i": 22697776,
                         "t": 0,
                         "ss": 0,
                         "es": 13812688,
                         "s": 0,
                         "c": 15400977,
                         "cn": "D08 Sieniawa",
                         "p": 247863,
                         "pn": "Urthadar",
                         "a": 8508,
                         "an": "Brotherhood_Of_Steel",
                         "tc": 15400978,
                         "tcn": "Theramore2",
                         "tp": 248055,
                         "tpn": "Cudgel"
                         */

                        row["id"] = item.i;
                        row["targetCityId"] = item.tc;
                        row["targetCityName"] = item.tpn + ": " + item.tcn;
                        row["targetPosition"] = bos.Utils.convertIdToCoodrinates(item.tc);

                        row["type"] = bos.Utils.translateOrderType(item.t);
                        row["state"] = this.translateState(item.s);
                        row["start"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.ss));
                        row["end"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.es));

                        row["attackerCityId"] = item.c;
                        row["attackerPosition"] = bos.Utils.convertIdToCoodrinates(item.c);
                        row["attackerCityName"] = item.cn;

                        row["player"] = item.p;
                        row["playerName"] = item.pn;
                        row["alliance"] = item.a;
                        row["allianceName"] = item.an;

                        var intel = storage.findIntelligenceById(item.c);
                        row["attackerUnits"] = (intel == null) ? "?" : "intel: " + intel.description;
                        row["attackerTS"] = "?";

                        rowData.push(row);
                    }

                }

                this.updateIcon();

                return rowData;
            },
            updateIcon: function() {
                var attacked = false;
                var list;

                if (webfrontend.data.AllianceAttack != undefined) {
                    list = webfrontend.data.AllianceAttack.getInstance().getAttacks();
                } else {
                    list = null;
                }
                if (list != null && list.length > 0) {
                    attacked = true;
                } else {
                    var player = webfrontend.data.Player.getInstance();
                    list = player.getIncomingUnitOrders();
                    if (list != null && list.length > 0) {
                        attacked = true;
                    }
                }

                if (attacked) {
                    var img = webfrontend.config.Config.getInstance().getUIImagePath("ui/icons/icon_attack_warning.gif");
                    this.setIcon(img);
                } else {
                    this.setIcon("");
                }
            },
            translateState: function(state) {
                /*
                 switch (state) {
                 case 0:
                 return "scheduled";
                 case 1:
                 return this.tr("tnf:to");
                 case 2:
                 return this.tr("tnf:returns");
                 case 4:
                 return this.tr("tnf:on support");

                 }
                 */
                return "??? " + state;
            },
            _handleCellClick: function(event) {

                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                switch (event.getColumn()) {
                    case 1:
                    case 2:
                        var cityId = parseInt(rowData["targetCityId"]);
                        if (!isNaN(cityId)) {
                            a.setMainView("c", cityId, -1, -1);
                            break;
                        }
                    //yes, I dont want break here
                    case 3:
                        var pos = rowData["targetPosition"];
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
                    case 10:
                    case 11:
                    case 12:
                        var pos = rowData["attackerPosition"];
                        if (pos != null) {
                            var coords = bos.Utils.extractCoordsFromClickableLook(pos);
                            var sepPos = coords.indexOf(":");
                            if (sepPos > 0) {
                                var x = parseInt(coords.substring(0, sepPos), 10);
                                var y = parseInt(coords.substring(sepPos + 1), 10);
                                if (event.getColumn() != 12) {
                                    webfrontend.gui.Util.openCityProfile(x, y);
                                } else {
                                    a.setMainView('r', 0, x * a.visMain.getTileWidth(), y * a.visMain.getTileHeight());
                                }

                            }
                        }
                        break;
                    case 13:
                    case 14:
                        a.showInfoPage(a.getPlayerInfoPage(), {
                            name: rowData["playerName"]
                        });
                        break;
                    case 15:
                    case 16:
                        a.showInfoPage(a.getAllianceInfoPage(), {
                            name: rowData["allianceName"]
                        });
                        break;
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbOrderTypes = this._createOrderTypesSelectBox();
                this.sbOrderTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbOrderTypes);

                this.sbDefenderTypes = this._createDefenderTypesSelectBox();
                this.sbDefenderTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbDefenderTypes);

                var btnExport = new qx.ui.form.Button(tr("export"));
                btnExport.setToolTipText(tr("exports icoming attacks informations in text format"));
                btnExport.setWidth(100);
                toolBar.add(btnExport);
                btnExport.addListener("execute", function(evt) {
                    this.exportInTextFormat();
                }, this);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setToolTipText(tr("btnCsvExport_toolTip"));
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

                var btnShowIntel = new qx.ui.form.Button(tr("show intel"));
                btnShowIntel.setWidth(100);
                toolBar.add(btnShowIntel);
                btnShowIntel.addListener("execute", function(evt) {
                    var widget = bos.gui.ExtraSummaryWidget.getInstance();
                    widget.open();
                    widget.switchToIntelligenceTab();
                }, this);

                return toolBar;
            },
            exportInTextFormat: function() {
                var sb = new qx.util.StringBuilder(2048);
                var sep = "\n";

                var rows = this.createRowData();

                var date = new Date();
                sb.add("Attacked cities list generated at ", qx.util.format.DateFormat.getDateTimeInstance().format(date), sep, sep);
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    if (i > 0) {
                        sb.add(sep);
                    }

                    sb.add(row["targetCityName"], " (", row["targetPosition"], ")");
                    if (["targetTS"] != null) {
                        sb.add(" total def: ", row["targetTS"], " TS");
                    }
                    sb.add(sep);
                    sb.add(row["type"], " attack at: ", row["end"], sep);
                    sb.add("Attacks: ", row["playerName"], " (", row["allianceName"], ") from city: ", row["attackerCityName"], " (", row["attackerPosition"], ") ", sep);
                    if (row["attackerUnits"] != "?") {
                        sb.add("Attack strength: ", row["attackerTS"], "TS", sep);
                        sb.add("Attacker units: ", row["attackerUnits"], sep);
                    }

                }

                bos.Utils.displayLongText(sb.get());

            },
            _createOrderTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                sb.setToolTipText("Filter by: <b>order type</b>");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem(this.tr("tnf:siege"), null, 5));
                sb.add(new qx.ui.form.ListItem(this.tr("tnf:unknown"), null, 0));

                return sb;
            },
            _createDefenderTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                sb.setToolTipText("Filter by: <b>defender type</b>");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem("you", null, 1));
                sb.add(new qx.ui.form.ListItem(this.tr("tnf:alliance members"), null, 2));

                return sb;
            }
        }
    });
});