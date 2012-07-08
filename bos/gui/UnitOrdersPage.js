/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:32
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.UnitOrdersPage");

    qx.Class.define("bos.gui.UnitOrdersPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("orders"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnNames;

            if(locale == "de") {
                columnNames = ["id", "StadtId", "Ausgehende Stadt", "Angriffstyp", "State", "Abreise", "Ankunft", "Rückkehr", "Pos", "Ziel",
                    "periodischer Angriffstyp?", "zuletzt Aktualisiert", "TS", "Einheiten"];
            } else {
                columnNames = ["id", "City Id", "From", "Type", "State", "Departure", "Arrival", "Back at home", "Pos", "Target",
                    "Recurring type", "Last visited", "TS", "Units"];
            }

            var columnIds = ["id", "cityId", "from", "type", "state", "start", "end", "recurringEndStep", "position", "target",
                "recurringType", "lastUpdated", "ts", "units"];

            this._tableModel.setColumns(columnNames, columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(2, false);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnVisible(1, false);

            columnModel.setColumnWidth(2, 120);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(3, 64);
            columnModel.setColumnWidth(4, 70);

            columnModel.setColumnWidth(5, 120);
            columnModel.setColumnWidth(6, 120);
            columnModel.setColumnWidth(7, 120);

            columnModel.setColumnWidth(8, 64);
            columnModel.setDataCellRenderer(8, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(9, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(10, 125);

            columnModel.setColumnWidth(11, 80);
            columnModel.setDataCellRenderer(11, new bos.ui.table.cellrenderer.HumanTime(2));

            columnModel.setColumnWidth(12, 50);

            columnModel.setColumnWidth(13, 180);

            var ministerMilitaryPresent = webfrontend.data.Player.getInstance().getMinisterMilitaryPresent();

            if (ministerMilitaryPresent) {
                columnModel.setColumnVisible(5, false);
                columnModel.setColumnVisible(7, false);
                columnModel.setColumnVisible(11, false);
            }

            this.add(this.table, { flex: 1 } );

        }, members: {
            sbOrderTypes: null,
            sbOrderStates: null,
            sbSourceContinent: null,
            _sbSourceContinentAsList: "",
            sbDestinationContinent: null,
            _sbDestinationContinentAsList: "",
            cbShowFakeAttacks: null,
            receivedFirstCOMO: false,
            createRowData: function() {
                var rowData = [];
                var cities = webfrontend.data.Player.getInstance().cities;
                var playerId = webfrontend.data.Player.getInstance().getId();

                var filterTypeId = -1;

                var sel = this.sbOrderTypes.getSelection();
                if (sel != null && sel.length > 0) {
                    filterTypeId = sel[0].getModel();
                }

                var filterStateId = -1;
                sel = this.sbOrderStates.getSelection();
                if (sel != null && sel.length > 0) {
                    filterStateId = sel[0].getModel();
                }

                var filterSourceContinent = -1;
                sel = this.sbSourceContinent.getSelection();
                if (sel != null && sel.length > 0) {
                    filterSourceContinent = sel[0].getModel();
                }

                var filterDestinationContinent = -1;
                sel = this.sbDestinationContinent.getSelection();
                if (sel != null && sel.length > 0) {
                    filterDestinationContinent = sel[0].getModel();
                }

                var showFakeAttacks = this.cbShowFakeAttacks.getValue();

                var serverTime = webfrontend.data.ServerTime.getInstance();

                var sourceContinents = [];
                var destContinents = [];
                var server = bos.Server.getInstance();
                for (var key in cities) {

                    var c = cities[key];

                    if (server.cities[key] == undefined) {
                        continue;
                    }

                    var city = server.cities[key];

                    if (city.unitOrders == null) {
                        continue;
                    }

                    for (var i = 0; i < city.unitOrders.length; i++) {
                        var item = city.unitOrders[i];

                        var cont = webfrontend.data.Server.getInstance().getContinentFromCoords(c.xPos, c.yPos);
                        sourceContinents["c" + cont] = true;

                        var destCoords = bos.Utils.convertIdToCoordinatesObject(item.city);
                        var destCont = webfrontend.data.Server.getInstance().getContinentFromCoords(destCoords.xPos, destCoords.yPos);
                        destContinents["c" + destCont] = true;


                        if (filterTypeId != -1) {
                            if (filterTypeId == -2) {
                                if (!(item.type == 1 || item.type == 2 || item.type == 3 || item.type == 5)) {
                                    continue;
                                }
                            } else if (filterTypeId != item.type) {
                                continue;
                            }
                        }

                        if (filterStateId != -1 && filterStateId != item.state) {
                            continue;
                        }

                        if (filterSourceContinent != -1 && filterSourceContinent != cont) {
                            continue;
                        }

                        if (filterDestinationContinent != -1 && filterDestinationContinent != destCont) {
                            continue;
                        }

                        var row = [];
                        this._addBlankValuesToRow(row, this._tableModel);

                        row["id"] = item.id;
                        row["cityId"] = key;
                        row["from"] = city.getName();
                        row["type"] = bos.Utils.translateOrderType(item.type);
                        row["state"] = this.translateState(item.state);
                        row["start"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.start));
                        row["end"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.end));
                        row["position"] = bos.Utils.convertIdToCoodrinates(item.city);
                        row["target"] = item.cityName;
                        if (item.player != playerId) {
                            if (item.player > 0) {
                                row["target"] += " - " + item.playerName;
                            }
                            if (item.alliance > 0) {
                                row["target"] += " (" + item.allianceName + ")";
                            }
                        }
                        row["player"] = item.player;
                        row["units"] = "";
                        row["ts"] = 0;

                        if (item.units != null) {
                            for (var u = 0; u < item.units.length; u++) {
                                var unit = item.units[u];
                                if (u > 0) {
                                    row["units"] += ", ";
                                }
                                row["units"] += unit.count + " " + formatUnitType(unit.type, unit.count);
                                var space = unit.count * getUnitRequiredSpace(unit.type);
                                row["ts"] += space;
                            }
                        }
                        //row["isDelayed"] = item.isDelayed;
                        row["recurringType"] = this.translateRecurringType(item.recurringType);
                        if (item.recurringEndStep > 0) {
                            row["recurringEndStep"] = webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.recurringEndStep));
                        }
                        row["lastUpdated"] = city.getLastUpdated();

                        if (!showFakeAttacks && row["ts"] < bos.Const.FAKE_ATTACK_TS && (item.type == 2 || item.type == 3 || item.type == 5)) {
                            //plunder, siege, assault
                            continue;
                        }

                        rowData.push(row);
                    }
                }

                this._populateContinentsSelectBox(this.sbSourceContinent, sourceContinents, true);
                this._populateContinentsSelectBox(this.sbDestinationContinent, destContinents, false);

                return rowData;
            },
            translateState: function(state) {
                switch (state) {
                    case 0:
                        return "scheduled";
                    case 1:
                        return this.tr("tnf:to");
                    case 2:
                        return this.tr("tnf:returns");
                    case 4:
                        return this.tr("tnf:on support");
                    case 5:
                        return this.tr("tnf:on siege");
                }
                return "??? " + state;
            },
            translateRecurringType: function(recurringType) {
                switch (recurringType) {
                    case 0:
                        return this.tr("tnf:once");
                    case 1:
                        return this.tr("tnf:dungeon completed");
                    case 2:
                        return this.tr("tnf:latest return time");
                }
                return "??? " + recurringType;
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                switch (event.getColumn()) {
                    case 1:
                    case 2:
                        var cityId = parseInt(rowData["cityId"]);
                        a.setMainView("c", cityId, -1, -1);
                        break;
                    case 8:
                    case 9:
                        var pos = rowData["position"];
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
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbOrderTypes = this._createOrderTypesSelectBox();
                this.sbOrderTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbOrderTypes);

                this.sbOrderStates = this._createOrderStatesSelectBox();
                this.sbOrderStates.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbOrderStates);

                this.sbSourceContinent = new qx.ui.form.SelectBox().set({
                    width: 60,
                    height: 28
                });
                this.sbSourceContinent.setToolTipText(tr("sbSourceContinent_toolTip"));
                //this.sbSourceContinent.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbSourceContinent);

                this.sbDestinationContinent = new qx.ui.form.SelectBox().set({
                    width: 60,
                    height: 28
                });
                this.sbDestinationContinent.setToolTipText(tr("sbDestinationContinent_toolTip"));
                //this.sbDestinationContinent.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbDestinationContinent);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setToolTipText(tr("btnUpdateView_toolTip"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    this.updateView();
                }, this);

                this.cbShowFakeAttacks = new qx.ui.form.CheckBox(tr("cbShowFakeAttacks"));
                this.cbShowFakeAttacks.setToolTipText(tr("cbShowFakeAttacks_toolTip"));
                this.cbShowFakeAttacks.setValue(true);
                toolBar.add(this.cbShowFakeAttacks);
                this.cbShowFakeAttacks.addListener("execute", function(event) {
                    this.updateView();
                }, this);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

                return toolBar;
            },
            _createOrderTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                sb.setToolTipText("Filter by: <b>order type</b>");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));

                var types = [1, 2, 3, 4, 5, 8, 9, 10, -2];

                for (var i = 0; i < types.length; i++) {
                    var t = types[i];
                    sb.add(new qx.ui.form.ListItem(bos.Utils.translateOrderType(t), null, t));
                }

                return sb;
            },
            _createOrderStatesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                sb.setToolTipText("Filter by: <b>order state</b>");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));

                var types = [0, 1, 2, 4, 5];

                for (var i = 0; i < types.length; i++) {
                    var t = types[i];
                    sb.add(new qx.ui.form.ListItem(this.translateState(t), null, t));
                }

                return sb;
            },
            _populateContinentsSelectBox: function(sb, continents, isSource) {

                var list = [];
                for (var key in continents) {
                    if (key.substring != undefined && qx.lang.Type.isString(key)) {
                        var cont = parseInt(key.substring(1), 10);
                        if (!isNaN(cont)) {
                            list.push(cont);
                        }
                    }
                }
                list.sort();

                var newValues = list.join(",");

                if (isSource) {
                    if (newValues == this._sbSourceContinentAsList) {
                        return;
                    }
                    this._sbSourceContinentAsList = newValues;
                } else {
                    if (newValues == this._sbDestinationContinentAsList) {
                        return;
                    }
                    this._sbDestinationContinentAsList = newValues;
                }

                var previouslySelected = -1;
                var sel = sb.getSelection();
                if (sel != null && sel.length > 0) {
                    previouslySelected = sel[0].getModel();
                }

                sb.removeListener("changeSelection", this.updateView, this);

                sb.removeAll();
                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                for (var i = 0; i < list.length; i++) {
                    var cont = list[i];
                    sb.add(new qx.ui.form.ListItem(sprintf("C%02d", cont), null, cont));
                }

                sb.addListener("changeSelection", this.updateView, this);

                if (previouslySelected != -1) {
                    sb.setModelSelection([previouslySelected]);
                }
            },
            startRefreshingFromServer: function() {
                receivedFirstCOMO = false;
                webfrontend.net.UpdateManager.getInstance().addConsumer("COMO", this);
            },
            getRequestDetails: function(dt) {
                if (!this.receivedFirstCOMO) {
                    return "a";
                } else {
                    return "";
                }
            },
            dispatchResults: function(r) {
                if (r == null || r.length == 0) return;

                this.receivedFirstCOMO = true;
                try {
                    var server = bos.Server.getInstance();
                    for (var i = 0; i < r.length; i++) {
                        var item = r[i];
                        server.addCOMOItem(item);
                    }
                } catch (e) {
                    bos.Utils.handleError(e);
                }
                if (this.isSeeable()) {
                    //console.log("UnitOrders view is displayed -> updating");
                    this.updateView();
                } else {
                    //console.log("UnitOrders view is hidden, nothing to update");
                }
            }
        }
    });
});