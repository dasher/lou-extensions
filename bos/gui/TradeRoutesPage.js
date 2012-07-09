/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:24
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.TradeRoutesPage");

    qx.Class.define("bos.gui.TradeRoutesPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("trade routes"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();
            var columnIds = ["id", "group", "fromToIds", "fromTo", "position", "action", "status", "wood", "stone", "iron", "food", "land/sea", "edit"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);
            for (var i = 0; i < columnIds.length; i++) {
                this._tableModel.setColumnSortable(i, false);
            }

            this._setupSorting(this._tableModel);
            //this._tableModel.sortByColumn(1, false);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);
            this.table.setColumnVisibilityButtonVisible(false);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(1, 40);
            columnModel.setColumnVisible(2, false);

            columnModel.setDataCellRenderer(3, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(4, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setColumnWidth(4, 64);

            columnModel.setDataCellRenderer(5, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setColumnWidth(5, 70);
            columnModel.setColumnWidth(6, 70);

            columnModel.setColumnWidth(7, 70);
            columnModel.setColumnWidth(8, 70);
            columnModel.setColumnWidth(9, 70);
            columnModel.setColumnWidth(10, 70);

            columnModel.setColumnWidth(11, 70);
            columnModel.setColumnWidth(12, 70);
            columnModel.setDataCellRenderer(12, new bos.ui.table.cellrenderer.ClickableLook());

            this.add(this.table, {flex: 1});

            bos.Storage.getInstance().addListener("changeTradeRoutesVersion", this.updateView, this);

        }, members: {
            sbTradeTypes: null,
            sbTransportTypes: null,
            sbTargetTypes: null,
            sbStates: null,
            _tradeRouteWidget: null,
            _sendingStatuses: {},
            _usedCarts: {},
            _showErrors: false,
            _pendingRequests: [],
            _sendingRequest: -1,
            createRowData: function() {
                var rowData = [];
                var cities = webfrontend.data.Player.getInstance().cities;
                var res = webfrontend.res.Main.getInstance();
                var playerId = webfrontend.data.Player.getInstance().getId();

                var sel;

                var filterGroup = "";
                sel = this.sbGroup.getSelection();
                if (sel != null && sel.length > 0) {
                    filterGroup = sel[0].getModel();
                }

                var storage = bos.Storage.getInstance();
                var routes = storage.getTradeRoutes();
                var serverTime = webfrontend.data.ServerTime.getInstance();

                var now = new Date();

                for (var i = 0; i < routes.length; i++) {
                    var r = routes[i];

                    if (filterGroup != "" && r.group != filterGroup) {
                        continue;
                    }

                    var row = [];
                    var secondRow = [];

                    row["id"] = r.id;
                    secondRow["id"] = -r.id;

                    row["group"] = r.group;
                    secondRow["group"] = "";

                    var fromCity = cities[r.from];
                    var toCity = cities[r.to];

                    var skip = false;
                    if (fromCity == undefined) {
                        row["fromTo"] = "invalid";
                        row["fromToIds"] = -1;
                        skip = true;
                    } else {
                        row["fromTo"] = fromCity.name;
                        row["position"] = fromCity.xPos + ":" + fromCity.yPos;
                        row["fromToIds"] = r.from;
                    }

                    row["wood"] = r.wood;
                    row["stone"] = r.stone;
                    row["iron"] = r.iron;
                    row["food"] = r.food;

                    if (toCity == undefined) {
                        secondRow["fromTo"] = "invalid";
                        secondRow["fromToIds"] = -1;
                        skip = true;
                    } else {
                        secondRow["fromTo"] = toCity.name;
                        secondRow["position"] = toCity.xPos + ":" + toCity.yPos;
                        secondRow["fromToIds"] = r.to;
                    }

                    row["action"] = "";
                    secondRow["action"] = "";
                    if (!skip) {
                        var ri = this.createRouteInfo(r);

                        if (ri.from.reqRes != null) {

                            if (r.transport != bos.Const.TRADE_TRANSPORT_SHIP)
                                row["land/sea"] = ri.from.carts;
                            else
                                row["land/sea"] = "disabled";

                            if (r.transport != bos.Const.TRADE_TRANSPORT_CART)
                                secondRow["land/sea"] = ri.from.ships;
                            else
                                secondRow["land/sea"] = "disabled";
                        }

                        if (ri.to.serverRes != null) {

                            secondRow["wood"] = ri.to.freeResources[1];
                            secondRow["stone"] = ri.to.freeResources[2];
                            secondRow["iron"] = ri.to.freeResources[3];
                            secondRow["food"] = ri.to.freeResources[4];
                        }

                        if (this.canBeSend(r, false, ri)) {
                            row["action"] = this.tr("tnf:send");
                        }
                        if (this.canBeSend(r, true, ri)) {
                            secondRow["action"] = "Send max";
                        }
                    }

                    if (server.cities[r.from] == undefined) {

                        //continue;
                    } else {
                        var city = server.cities[r.from];

                        /*
                         var route = {
                         from: parseInt(this.sbFrom.getSelection()[0].getModel()),
                         to: parseInt(this.sbTo.getSelection()[0].getModel()),
                         wood: parseInt(this.woodInput.getValue()),
                         stone: parseInt(this.stoneInput.getValue()),
                         iron: parseInt(this.ironInput.getValue()),
                         food: parseInt(this.foodInput.getValue()),
                         transport: parseInt(this.sbTransport.getSelection()[0].getModel())
                         };
                         */
                    }

                    var status = this._getStatus(r.id);
                    if (status != null) {
                        row["status"] = this.translateStatus(status.status);
                        secondRow["status"] = human_time(Math.floor((now - status.date) / 1000));
                    }

                    row["edit"] = "Edit";
                    secondRow["edit"] = this.tr("tnf:delete");

                    rowData.push(row);
                    rowData.push(secondRow);
                }

                return rowData;
            },
            createRouteInfo: function(route) {
                var result = {
                    from: {
                        reqRes: null,
                        serverRes: null,
                        carts: 0,
                        ships: 0,
                        resources: [0, 0, 0, 0, 0]
                    }, to: {
                        reqRes: null,
                        serverRes: null,
                        freeResources: [bos.Const.INF, bos.Const.INF, bos.Const.INF, bos.Const.INF, bos.Const.INF]
                    }
                };

                var server = bos.Server.getInstance();
                var resCity = server.cityResources["c" + route.from];
                if (resCity != null) {
                    result.from.reqRes = resCity;
                    //it's impossible to get exact number of carts because when there are 1 cart and city has 1k wood and 1k stone for both resources it will return amountLand = 1000, the would be if city had 1000carts, we take lower bound here

                    for (var r = 1; r <= 4; r++) {
                        var res = resCity.resources[r];
                        if (res == null || res.count == 0) {
                            continue;
                        }
                        result.from.resources[r] = res.count;
                        if (res.amountLand < res.count) {
                            result.from.carts = Math.ceil(res.amountLand / bos.Const.CART_CAPACITY);
                            break;
                        } else {
                            result.from.carts = Math.max(result.from.carts, Math.ceil(res.count / bos.Const.CART_CAPACITY));
                        }
                    }

                    for (var r = 1; r <= 4; r++) {
                        var res = resCity.resources[r];
                        if (res == null || res.count == 0) {
                            continue;
                        }
                        if (res.amountSea < res.count) {
                            result.from.ships = Math.ceil(res.amountSea / bos.Const.SHIP_CAPACITY);
                            break;
                        } else {
                            result.from.ships = Math.max(result.from.ships, Math.ceil(res.count / bos.Const.SHIP_CAPACITY));
                        }
                    }

                    var usedCarts = this._usedCarts["c" + route.from];
                    if (usedCarts != null) {
                        result.from.carts = Math.max(0, result.from.carts - usedCarts.carts);
                        result.from.ships = Math.max(0, result.from.ships - usedCarts.ships);
                    }
                }

                resCity = server.cityResources["c" + route.to];
                if (resCity != null) {
                    result.to.reqRes = resCity;
                }

                var summary = getSummaryWidget();

                var row = [];
                if (summary._populateResources(row, route.from)) {
                    result.from.serverRes = row;

                    result.from.resources[1] = row["wood"];
                    result.from.resources[2] = row["stone"];
                    result.from.resources[3] = row["iron"];
                    result.from.resources[4] = row["food"];
                }
                row = [];
                if (summary._populateResources(row, route.to)) {
                    result.to.serverRes = row;

                    result.to.freeResources[1] = row["woodFree"] - row["woodIncoming"];
                    result.to.freeResources[2] = row["stoneFree"] - row["stoneIncoming"];
                    result.to.freeResources[3] = row["ironFree"] - row["ironIncoming"];
                    result.to.freeResources[4] = row["foodFree"] - row["foodIncoming"];
                }

                return result;
            },
            translateStatus: function(status) {
                var s = "";
                if (status == -1) {
                    s = "Comm. err";
                } else if (status == 0) {
                    s = "OK";
                } else {
                    if (status & (1 << 0)) {
                        s += "I";
                    }
                    if (status & (1 << 1)) {
                        s += "C";
                    }
                    if (status & (1 << 2)) {
                        s += "T";
                    }
                    if (status & (1 << 3)) {
                        s += "R";
                    }
                }
                return s;
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

                var id = Math.abs(rowData["id"]);
                var isFirstRow = rowData["id"] >= 0;
                var route = bos.Storage.getInstance().findTradeRouteById(id);

                switch (event.getColumn()) {
                    case 2:
                    case 3:
                        var cityId = parseInt(rowData["fromToIds"]);
                        app.setMainView("c", cityId, -1, -1);
                        break;
                    case 4:
                        var pos = rowData["position"];
                        if (pos != null) {
                            var coords = bos.Utils.extractCoordsFromClickableLook(pos);
                            var sepPos = coords.indexOf(":");
                            if (sepPos > 0) {
                                var x = parseInt(coords.substring(0, sepPos), 10);
                                var y = parseInt(coords.substring(sepPos + 1), 10);
                                app.setMainView('r', 0, x * app.visMain.getTileWidth(), y * app.visMain.getTileHeight());
                            }
                        }
                        break;
                    case 5:
                        if (route == null) {
                            bos.Utils.handleError("Route not found");
                        } else {
                            if (this._sendingRequest != -1) {
                                bos.Utils.handleWarning("Please wait, waiting for response for last trade");
                            } else {
                                this._showErrors = true;
                                this.sendTrade(route, !isFirstRow, false);
                            }
                        }
                        break;
                    case 12:

                        if (route == null) {
                            bos.Utils.handleError("Route not found");
                        } else {
                            if (isFirstRow) {
                                var widget = this._getTradeRouteWidget();
                                widget.editRoute(route);
                                widget.open();
                            } else {
                                webfrontend.gui.MessageBox.messageBox({
                                    title: "Confirmation",
                                    text: "Are you sure?",
                                    textRich: true,
                                    executeOk: function() {
                                        var storage = bos.Storage.getInstance();
                                        storage.removeTradeRoute(route.id);

                                        this.updateView();
                                    },
                                    callbackContext: this
                                });
                            }
                        }

                        break;
                }
            },
            canBeSend: function(route, maxMode, ri) {

                var totalRes = route.wood + route.stone + route.iron + route.food;

                var amountLand = ri.from.carts * bos.Const.CART_CAPACITY;
                var amountSea = ri.from.ships * bos.Const.SHIP_CAPACITY;

                //var transportType;
                var totalTransportable;
                switch (route.transport) {
                    case bos.Const.TRADE_TRANSPORT_CART:
                        totalTransportable = amountLand;
                        //transportType = route.transport;
                        break;
                    case bos.Const.TRADE_TRANSPORT_SHIP:
                        totalTransportable = amountSea;
                        //transportType = route.transport;
                        break;
                    case bos.Const.TRADE_TRANSPORT_CART_FIRST:
                        totalTransportable = amountLand + amountSea;
                        //transportType = bos.Const.TRADE_TRANSPORT_CART;
                        break;
                    case bos.Const.TRADE_TRANSPORT_SHIP_FIRST:
                        totalTransportable = amountLand + amountSea;
                        //transportType = bos.Const.TRADE_TRANSPORT_SHIP;
                        break;
                }

                if (totalTransportable == 0 || (totalTransportable < totalRes && !maxMode)) {
                    return;
                }

                if (!maxMode) {

                    if (ri.from.resources[1] < route.wood) {
                        return false;
                    }
                    if (ri.from.resources[2] < route.stone) {
                        return false;
                    }
                    if (ri.from.resources[3] < route.iron) {
                        return false;
                    }
                    if (ri.from.resources[4] < route.food) {
                        return false;
                    }
                } else {
                    var total = 0;
                    if (route.wood > 0) {
                        total += ri.from.resources[1];
                    }
                    if (route.stone > 0) {
                        total += ri.from.resources[2];
                    }
                    if (route.iron > 0) {
                        total += ri.from.resources[3];
                    }
                    if (route.food > 0) {
                        total += ri.from.resources[4];
                    }

                    if (total < bos.Const.SHIP_CAPACITY) {
                        return false;
                    }
                }
                return true;
            }, sendAll: function(maxMode) {
                var rows = this.createRowData();
                var storage = bos.Storage.getInstance();

                this._pendingRequests = [];

                for (var i = 0; i < rows.length; i += 2) {
                    var rowData = rows[i];

                    var id = Math.abs(rowData["id"]);
                    var route = storage.findTradeRouteById(id);

                    this.sendTrade(route, maxMode, true);
                }

                this.sendPendingTrades();

            },
            sendTrade: function(route, maxMode, onlyQueue) {
                try {

                    var player = webfrontend.data.Player.getInstance();
                    var targetPlayer = player.getName();
                    var targetCity = bos.Utils.convertIdToCoodrinates(route.to);

                    var ri = this.createRouteInfo(route);

                    //dumpObject(route);
                    //dumpObject(ri);

                    if (!this.canBeSend(route, maxMode, ri)) {
                        return;
                    }

                    var resTypes = ["gold", "wood", "stone", "iron", "food"];
                    var routeRes = [0, route.wood, route.stone, route.iron, route.food];
                    var totalRouteRes = route.wood + route.stone + route.iron + route.food;
                    var routeResPart = [0, 0, 0, 0, 0];

                    for (var i = 1; i <= 4; i++) {
                        routeResPart[i] = routeRes[i] / totalRouteRes;
                    }

                    //to be transported resources
                    var resources = [0, 0, 0, 0, 0];

                    //var reserved = [0, 0, 0, 0, 0];

                    if (maxMode) {
                        /*
                         for (var i = 1; i <= 4; i++) {
                         if (ri.to.serverRes != null) {
                         var type = resTypes[i];
                         reserved[i] += serverRes[type + "Incoming"];
                         //TODO reserve: trade time * production/h
                         }
                         }
                         */
                        for (var i = 1; i <= 4; i++) {
                            if (routeRes[i] > 0) {

                                resources[i] = ri.from.resources[i];
                                if (ri.to.serverRes != null) {
                                    //min(target city free space - incoming transfers - trade time * production/h, min(max trade capacity, available resources)).
                                    resources[i] = Math.max(0, Math.min(resources[i], ri.to.freeResources[i]));
                                }

                            }
                        }
                    } else {
                        for (var i = 1; i <= 4; i++) {
                            resources[i] = routeRes[i];
                        }
                    }

                    var totalRes = 0;
                    for (var i = 1; i <= 4; i++) {
                        totalRes += resources[i];
                    }

                    if (totalRes == 0) {
                        return;
                    }

                    var amountLand = ri.from.carts * bos.Const.CART_CAPACITY;
                    var amountSea = ri.from.ships * bos.Const.SHIP_CAPACITY;

                    var useSecondTransportType = false;
                    var transportType;
                    switch (route.transport) {
                        case bos.Const.TRADE_TRANSPORT_CART:
                            transportType = route.transport;
                            break;
                        case bos.Const.TRADE_TRANSPORT_SHIP:
                            transportType = route.transport;
                            break;
                        case bos.Const.TRADE_TRANSPORT_CART_FIRST:
                            if (amountLand > 0) {
                                transportType = bos.Const.TRADE_TRANSPORT_CART;
                                useSecondTransportType = true;
                            } else {
                                transportType = bos.Const.TRADE_TRANSPORT_SHIP;
                            }
                            break;
                        case bos.Const.TRADE_TRANSPORT_SHIP_FIRST:
                            if (amountSea > 0) {
                                transportType = bos.Const.TRADE_TRANSPORT_SHIP;
                                useSecondTransportType = true;
                            } else {
                                transportType = bos.Const.TRADE_TRANSPORT_CART;
                            }
                            break;
                    }

                    var amountCurrent = 0;
                    if (transportType == bos.Const.TRADE_TRANSPORT_CART) {
                        amountCurrent = amountLand;
                    } else {
                        amountCurrent = amountSea;
                    }

                    if (amountCurrent < totalRes) {
                        //COPY & PASTE START
                        totalRes = 0;
                        for (var i = 1; i <= 4; i++) {
                            resources[i] = Math.max(0, Math.min(resources[i], Math.floor(amountCurrent * routeResPart[i])));
                            totalRes += resources[i];
                        }

                        if (maxMode && totalRes < amountCurrent) {
                            var diff = amountCurrent - totalRes;
                            var step = 10000;

                            var noIncrement = false;
                            while (diff > 0 && !noIncrement) {

                                noIncrement = true;

                                for (var i = 1; i <= 4; i++) {
                                    if (routeRes[i] > 0) {
                                        var left = Math.min(step, diff, ri.from.resources[i] - resources[i], ri.to.freeResources[i]);
                                        if (left > 0) {
                                            resources[i] += left;
                                            diff -= left;
                                            noIncrement = false;
                                        }
                                    }
                                }
                            }
                        }
                        //COPY & PASTE END
                    } else {
                        //all resources fits in current transport type, there is no need for use other type
                        useSecondTransportType = false;
                    }

                    if (!onlyQueue) {
                        this._pendingRequests = [];
                    }
                    var req1 = this._createTradeDirectRequest(route.from, resources, transportType, targetPlayer, targetCity);
                    this._pendingRequests.push({
                        route: route,
                        request: req1
                    });

                    //make resources scheduled to send unavailable for other transport type
                    for (var i = 1; i <= 4; i++) {
                        ri.from.resources[i] -= resources[i];
                        ri.to.freeResources[i] -= resources[i];
                    }

                    if (transportType == bos.Const.TRADE_TRANSPORT_CART) {
                        transportType = bos.Const.TRADE_TRANSPORT_SHIP;
                        amountCurrent = amountSea;
                    } else {
                        transportType = bos.Const.TRADE_TRANSPORT_CART;
                        amountCurrent = amountLand;
                    }

                    if (amountCurrent == 0) {
                        useSecondTransportType = false;
                    }

                    if (useSecondTransportType) {

                        if (!maxMode) {
                            for (var i = 1; i <= 4; i++) {
                                resources[i] = routeRes[i] - resources[i];
                            }
                        } else {
                            for (var i = 1; i <= 4; i++) {
                                if (routeRes[i] > 0) {

                                    resources[i] = ri.from.resources[i];
                                    if (ri.to.serverRes != null) {
                                        //min(target city free space - incoming transfers - trade time * production/h, min(max trade capacity, available resources)).
                                        resources[i] = Math.max(0, Math.min(resources[i], ri.to.freeResources[i]));
                                    }

                                } else {
                                    resources[i] = 0;
                                }
                            }
                        }

                        //COPY & PASTE START
                        totalRes = 0;
                        for (var i = 1; i <= 4; i++) {
                            resources[i] = Math.max(0, Math.min(resources[i], Math.floor(amountCurrent * routeResPart[i])));
                            totalRes += resources[i];
                        }

                        if (maxMode && totalRes < amountCurrent) {
                            var diff = amountCurrent - totalRes;
                            var step = 10000;

                            var noIncrement = false;
                            while (diff > 0 && !noIncrement) {

                                noIncrement = true;

                                for (var i = 1; i <= 4; i++) {
                                    if (routeRes[i] > 0) {
                                        var left = Math.min(step, diff, ri.from.resources[i] - resources[i], ri.to.freeResources[i]);
                                        if (left > 0) {
                                            resources[i] += left;
                                            diff -= left;
                                            noIncrement = false;
                                        }
                                    }
                                }
                            }
                        }
                        //COPY & PASTE END

                        totalRes = 0;
                        for (var i = 1; i <= 4; i++) {
                            totalRes += resources[i];
                        }

                        if (totalRes > 0) {
                            var req2 = this._createTradeDirectRequest(route.from, resources, transportType, targetPlayer, targetCity);
                            this._pendingRequests.push({
                                route: route,
                                request: req2
                            });
                        }
                    }

                    if (!onlyQueue) {
                        this.sendPendingTrades();
                    }

                } catch (ex) {
                    this._sendingRequest = -1;
                    bos.Utils.handleError("Sending resources failed: " + ex);
                }
            },
            sendPendingTrades: function() {
                if (this._pendingRequests.length == 0) {
                    this._sendingRequest = -1;
                    this._showErrors = false;
                    this.updateView();
                    return;
                }
                this._sendingRequest = 0;
                var req = this._pendingRequests[this._sendingRequest];
                bos.net.CommandManager.getInstance().sendCommand("TradeDirect", req.request, this, this._onSendDone, new Date());
            },
            _createTradeDirectRequest: function(from, resToBeSend, tradeTransportType, targetPlayer, targetCity) {
                var resources = [];
                if (resToBeSend[1] > 0) {
                    resources.push({
                        t: bos.Const.WOOD,
                        c: resToBeSend[1]
                    });
                }
                if (resToBeSend[2] > 0) {
                    resources.push({
                        t: bos.Const.STONE,
                        c: resToBeSend[2]
                    });
                }

                if (resToBeSend[3] > 0) {
                    resources.push({
                        t: bos.Const.IRON,
                        c: resToBeSend[3]
                    });
                }

                if (resToBeSend[4] > 0) {
                    resources.push({
                        t: bos.Const.FOOD,
                        c: resToBeSend[4]
                    });
                }
                var req = {
                    cityid: from,
                    res: resources,
                    tradeTransportType: tradeTransportType,
                    targetPlayer: targetPlayer,
                    targetCity: targetCity
                }
                return req;
            },
            _onSendDone: function(isOk, errorCode, context) {
                try {
                    if (isOk == false || errorCode == null) {
                        //comm error
                        this._setStatus(-1);
                    } else {
                        this._setStatus(parseInt(errorCode));
                    }
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },
            _setStatus: function(status) {
                var req = this._pendingRequests[this._sendingRequest];

                var prevStatus = this._sendingStatuses["r" + req.route.id];

                var newStatus = {
                    status: status,
                    date: new Date()
                };

                this._sendingStatuses["r" + req.route.id] = newStatus;
                var usedCarts = this._usedCarts["c" + req.route.from];

                if (usedCarts == null) {
                    usedCarts = {
                        carts: 0,
                        ships: 0
                    };
                    this._usedCarts["c" + req.route.from] = usedCarts;
                }

                if (status == 0) {
                    //OK
                    var totalRes = 0;
                    for (var i = 0; i < req.request.res.length; i++) {
                        var res = req.request.res[i];
                        totalRes += res.c;
                    }

                    if (req.request.tradeTransportType == bos.Const.TRADE_TRANSPORT_CART) {
                        var carts = Math.ceil(totalRes / bos.Const.CART_CAPACITY);
                        usedCarts.carts += carts;
                    } else {
                        var ships = Math.ceil(totalRes / bos.Const.SHIP_CAPACITY);
                        usedCarts.ships += ships;
                    }
                }

                /* because of user req disabled showing errors
                 if (this._showErrors) {
                 if (status != 0) {
                 this._showErrorMessage(req, status);
                 }
                 }
                 */

                this._pendingRequests.splice(0, 1);
                this.sendPendingTrades();

            },
            _showErrorMessage: function(req, status) {

                var s = "";
                if (status == -1) {
                    s = this.tr("tnf:communication error_1");
                } else if (status == 0) {
                    s = "OK";
                } else {
                    var sep = "<br/>"
                    if (status & (1 << 0)) {
                        s += this.tr("tnf:invalid!") + sep;
                    }
                    if (status & (1 << 1)) {
                        s += this.tr("tnf:not enough traders!") + sep;
                    }
                    if (status & (1 << 2)) {
                        s += this.tr("tnf:target cannot be reached!") + sep;
                    }
                    if (status & (1 << 3)) {
                        s += this.tr("tnf:not enough resource!") + sep;
                    }
                }

                if (s == "") {
                    return;
                }

                var dialog = new webfrontend.gui.ConfirmationWidget();
                dialog.showGenericNotice("Error", s, s, "webfrontend/ui/bgr_popup_survey.gif");

                qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                dialog.show();

            },
            _getStatus: function(routeId) {
                return this._sendingStatuses["r" + routeId];
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbGroup = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });
                this.sbGroup.setToolTipText("Filter by <b>group</b>");
                this.sbGroup.addListener("changeSelection", this.updateView, this);

                this.sbGroup.add(new qx.ui.form.ListItem("Any group", null, ""));

                for (var group = 0; group < 26; group++) {
                    var c = String.fromCharCode(65 + group);
                    this.sbGroup.add(new qx.ui.form.ListItem(c, null, c));
                }
                toolBar.add(this.sbGroup);

                this.btnRefreshResources = new qx.ui.form.Button(tr("btnRefreshResources"));
                this.btnRefreshResources.setToolTipText(tr("btnRefreshResources_toolTip"));
                this.btnRefreshResources.setWidth(120);
                if (locale == "de") {
                    this.btnRefreshResources.setWidth(150);
                }

                toolBar.add(this.btnRefreshResources);

                this.btnRefreshResources.addListener("execute", function(evt) {
                    var summary = getSummaryWidget();
                    summary._requestedResourceRefreshView = true;
                    summary.fetchResources();
                    this._sendingStatuses = {};
                    this._usedCarts = {};
                }, this);

                var btnAddRoute = new qx.ui.form.Button(locale == "de" ? "Add route" : "Add route");
                btnAddRoute.setWidth(100);
                toolBar.add(btnAddRoute);
                btnAddRoute.addListener("execute", function(evt) {
                    var widget = this._getTradeRouteWidget();
                    widget.addNewRoute();
                    widget.open();
                }, this);

                var btnSendAll = new qx.ui.form.Button(tr("Send all"));
                btnSendAll.setWidth(100);
                toolBar.add(btnSendAll);
                btnSendAll.addListener("execute", function(evt) {
                    this.sendAll(false);
                }, this);

                var btnSendAllMax = new qx.ui.form.Button(tr("Send all max"));
                btnSendAllMax.setWidth(100);
                toolBar.add(btnSendAllMax);
                btnSendAllMax.addListener("execute", function(evt) {
                    this.sendAll(true);
                }, this);

                var btnHelp = new qx.ui.form.Button(tr("help"));
                btnHelp.setWidth(120);
                toolBar.add(btnHelp);
                btnHelp.addListener("execute", function(evt) {
                    var dialog = new webfrontend.gui.ConfirmationWidget();
                    dialog.showGenericNotice("Trade Routes Help", "Currently requires building minister, it may have some bugs. First you need to enable autorefresh of resources then click refresh resources on this tab (it will calculate lower bound of available carts and ships). List of error codes:", "I - Invalid target, C - not enough Carts or ships, T - Target cannot be accessed, R - not enough Resources", "webfrontend/ui/bgr_popup_survey.gif");

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

                return toolBar;
            },
            _createTradeTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                sb.setToolTipText("Filter by: <b>trade type</b>");

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

                sb.setToolTipText("Filter by: <b>transport type</b>");

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

                sb.setToolTipText("Filter by: <b>resources receiver</b>");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem("you", null, 1));
                sb.add(new qx.ui.form.ListItem("someone else", null, 2));

                return sb;
            },
            _createStatesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                sb.setToolTipText("Filter by: <b>state</b>");

                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                sb.add(new qx.ui.form.ListItem(this.translateState(bos.Const.TRADE_STATE_TRANSPORT), null, bos.Const.TRADE_STATE_TRANSPORT));
                sb.add(new qx.ui.form.ListItem(this.translateState(bos.Const.TRADE_STATE_RETURN), null, bos.Const.TRADE_STATE_RETURN));

                return sb;
            },
            _getTradeRouteWidget: function() {
                if (this._tradeRouteWidget == null) {
                    this._tradeRouteWidget = new bos.gui.TradeRouteWidget();
                }
                return this._tradeRouteWidget;
            },
            exportSettings: function() {
                var storage = bos.Storage.getInstance();
                var orders = storage.getTradeRoutes();

                var json = qx.util.Json.stringify(orders);
                bos.Utils.displayLongText(json);
            },
            importSettings: function() {
                bos.Utils.inputLongText(function (json) {
                    var storage = bos.Storage.getInstance();
                    storage.importTradeRoutes(json);
                });
            }
        }
    });
});