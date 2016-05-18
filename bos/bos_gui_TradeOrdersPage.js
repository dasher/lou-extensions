/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:21
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.TradeOrdersPage");

    qx.Class.define("bos.gui.TradeOrdersPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("carts"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["id", "cityId", "from", "type", "transport", "state", "start", "end", "position", "target",
                "lastUpdated", "resources"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(2, false);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            var res = webfrontend.res.Main.getInstance();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnVisible(1, false);

            columnModel.setColumnWidth(2, 120);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(3, 64);
            columnModel.setColumnWidth(4, 70);
            columnModel.setColumnWidth(5, 70);

            columnModel.setColumnWidth(6, 120);
            columnModel.setColumnWidth(7, 120);


            columnModel.setColumnWidth(8, 64);
            columnModel.setDataCellRenderer(8, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(9, 125);
            columnModel.setDataCellRenderer(9, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(10, 80);
            columnModel.setDataCellRenderer(10, new bos.ui.table.cellrenderer.HumanTime(2));

            columnModel.setColumnWidth(11, 180);

            this.add(this.table, {flex: 1});

        }, members: {
            sbTradeTypes: null,
            sbTransportTypes: null,
            sbTargetTypes: null,
            sbStates: null,
            createRowData: function() {
                var rowData = [];
                var cities = webfrontend.data.Player.getInstance().cities;
                var res = webfrontend.res.Main.getInstance();
                var playerId = webfrontend.data.Player.getInstance().getId();

                var sel;

                var filterTypeId = -1;
                sel = this.sbTradeTypes.getSelection();
                if (sel != null && sel.length > 0) {
                    filterTypeId = sel[0].getModel();
                }

                var filterTransportTypeId = -1;
                sel = this.sbTransportTypes.getSelection();
                if (sel != null && sel.length > 0) {
                    filterTransportTypeId = sel[0].getModel();
                }

                var filterTargetTypeId = -1;
                sel = this.sbTargetTypes.getSelection();
                if (sel != null && sel.length > 0) {
                    filterTargetTypeId = sel[0].getModel();
                }

                var filterStateId = -1;
                sel = this.sbStates.getSelection();
                if (sel != null && sel.length > 0) {
                    filterStateId = sel[0].getModel();
                }

                var serverTime = webfrontend.data.ServerTime.getInstance();
                var now = serverTime.getServerStep();
                var server = bos.Server.getInstance();
                for (var key in cities) {

                    var c = cities[key];

                    if (server.cities[key] == undefined) {
                        continue;
                    }

                    var city = server.cities[key];

                    if (city.tradeOrders == null) {
                        continue;
                    }

                    for (var i = 0; i < city.tradeOrders.length; i++) {
                        var item = city.tradeOrders[i];

                        if (filterTypeId != -1 && filterTypeId != item.type) {
                            continue;
                        }
                        if (filterTransportTypeId != -1 && filterTransportTypeId != item.transport) {
                            continue;
                        }
                        if (filterStateId != -1 && filterStateId != item.state) {
                            continue;
                        }
                        if (filterTargetTypeId != -1) {
                            if (filterTargetTypeId == 1 && item.player != playerId) {
                                continue;
                            } else if (filterTargetTypeId == 2 && item.player == playerId) {
                                continue;
                            }
                        }

                        var timeSpan = item.end - item.start;
                        if (item.end + timeSpan < now) {
                            continue;
                        }

                        var row = [];
                        this._addBlankValuesToRow(row, this._tableModel);

                        row["id"] = item.id;
                        row["cityId"] = key;
                        row["from"] = city.getName();
                        row["type"] = this.translateType(item.type);
                        row["state"] = this.translateState(item.state);
                        row["transport"] = this.translateTransport(item.transport);
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
                        row["resources"] = "";

                        if (item.resources != null) {
                            for (var u = 0; u < item.resources.length; u++) {
                                var trade = item.resources[u];
                                if (u > 0) {
                                    row["resources"] += ", ";
                                }
                                var resource = res.resources[trade.type];
                                row["resources"] += trade.count + " " + resource.dn;
                            }
                        }


                        row["lastUpdated"] = city.getLastUpdated();

                        rowData.push(row);
                    }

                }

                return rowData;
            },
            translateState: function(state) {
                switch (state) {
                    case bos.Const.TRADE_STATE_TRANSPORT:
                        return "transport";
                    case bos.Const.TRADE_STATE_RETURN:
                        return this.tr("tnf:returns");
                }

                return "??? " + state;
            },
            translateType: function(type) {
                switch (type) {
                    case 1:
                        return this.tr("tnf:trade");
                    case 2:
                        return tr("transfer");
                    case 3:
                        return tr("minister");
                }

                return "??? " + type;
            },
            translateTransport: function(transport) {
                switch (transport) {
                    case bos.Const.TRADE_TRANSPORT_CART:
                        return this.tr("tnf:carts");
                    case bos.Const.TRADE_TRANSPORT_SHIP:
                        return this.tr("tnf:ships");
                }


                return "??? " + type;
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                switch (event.getColumn()) {
                    case 1:
                    case 2:
                        var cityId = parseInt(rowData["cityId"]);
                        this._louApp.setMainView("c", cityId, -1, -1);
                        break;
                    case 8:
                    case 9:
                        var pos = rowData["position"];
                        if (pos != null) {
                            var coords = bos.Utils.extractCoordsFromClickableLook(pos);
                            var sepPos = coords.indexOf(":");
                            if (sepPos > 0) {
                                var x = parseInt(coords.substring(0, sepPos));
                                var y = parseInt(coords.substring(sepPos + 1));
                                this._louApp.setMainView('r', 0, x * this._louApp.visMain.getTileWidth(), y * this._louApp.visMain.getTileHeight());
                            }
                        }
                        break;
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbTradeTypes = this._createTradeTypesSelectBox();
                this.sbTradeTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbTradeTypes);

                this.sbStates = this._createStatesSelectBox();
                this.sbStates.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbStates);

                this.sbTransportTypes = this._createTransportTypesSelectBox();
                this.sbTransportTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbTransportTypes);

                this.sbTargetTypes = this._createTargetTypesSelectBox();
                this.sbTargetTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbTargetTypes);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    this.updateView();
                }, this);

                return toolBar;
            },
            _createTradeTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                sb.setToolTipText(tr("filter by trade type"));

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem(this.translateType(1), null, 1));
                sb.add(new qx.ui.form.ListItem(this.translateType(2), null, 2));

                return sb;
            },
            _createTransportTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                sb.setToolTipText(tr("filter by: transport type"));

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem(this.translateTransport(1), null, 1));
                sb.add(new qx.ui.form.ListItem(this.translateTransport(2), null, 2));

                return sb;
            },
            _createTargetTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                sb.setToolTipText("filter by: resources receiver");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem(tr("you"), null, 1));
                sb.add(new qx.ui.form.ListItem(tr("someone else"), null, 2));

                return sb;
            },
            _createStatesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                sb.setToolTipText(tr("filter by: state"));

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem(this.translateState(bos.Const.TRADE_STATE_TRANSPORT), null, bos.Const.TRADE_STATE_TRANSPORT));
                sb.add(new qx.ui.form.ListItem(this.translateState(bos.Const.TRADE_STATE_RETURN), null, bos.Const.TRADE_STATE_RETURN));

                return sb;
            }
        }
    });
});