/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:22
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.TradeRouteWidget");

    qx.Class.define("bos.gui.TradeRouteWidget", {
        type: "singleton",
        extend: qx.ui.window.Window,
        construct: function() {
            qx.ui.window.Window.call(this);
            this.setLayout(new qx.ui.layout.Dock());

            this.set({
                width: 440,
                minWidth: 200,
                maxWidth: 600,
                height: 440,
                minHeight: 200,
                maxHeight: 600,
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: (tr("trade route")),
                resizeSensitivity: 7,
                contentPadding: 0
            });

            var container = new qx.ui.container.Composite();
            container.setLayout(new qx.ui.layout.VBox(5));

            var res = webfrontend.res.Main.getInstance();
            var scroll = new qx.ui.container.Scroll();
            container.add(scroll, {flex: true});

            scroll.add(this.createForm());

            container.add(this.createFooter());

            this.add(container);

            webfrontend.gui.Util.formatWinClose(this);

            this.moveTo(400, 200);

        },
        members: {
            sbTo: null,
            sbFrom: null,
            sbTransport: null,
            sbGroup: null,
            woodInput: null,
            stoneInput: null,
            ironInput: null,
            foodInput: null,
            editedRoute: null,
            activateOverlay: function(activated) {
                //nothing
            },
            clearAll: function() {
                this.woodInput.setValue(0);
                this.stoneInput.setValue(0);
                this.ironInput.setValue(0);
                this.foodInput.setValue(0);
            },
            spinnerTextUpdate: function(e) {
                if (e.getData().length == 0) this.buildCount.setValue(0);
            },
            createFooter: function() {
                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));

                var btnAdd = new qx.ui.form.Button(tr("OK"));
                btnAdd.setWidth(70);
                container.add(btnAdd);
                btnAdd.addListener("click", this.addTradeRoute, this);

                var btnClear = new qx.ui.form.Button(tr("clear"));
                btnClear.setWidth(70);
                container.add(btnClear);
                btnClear.addListener("click", this.clearAll, this);

                var btnMax = new qx.ui.form.Button(tr("max"));
                btnMax.setWidth(70);
                container.add(btnMax);
                btnMax.addListener("click", this.maxResources, this);

                return container;
            },
            addTradeRoute: function() {

                var route = {};

                route.from = parseInt(this.sbFrom.getSelection()[0].getModel());
                route.to = parseInt(this.sbTo.getSelection()[0].getModel());

                route.wood = parseInt(this.woodInput.getValue(), 10);
                route.stone = parseInt(this.stoneInput.getValue(), 10);
                route.iron = parseInt(this.ironInput.getValue(), 10);
                route.food = parseInt(this.foodInput.getValue(), 10);

                if (route.wood < bos.Const.SHIP_CAPACITY) {
                    route.wood *= 1000;
                }
                if (route.stone < bos.Const.SHIP_CAPACITY) {
                    route.stone *= 1000;
                }
                if (route.iron < bos.Const.SHIP_CAPACITY) {
                    route.iron *= 1000;
                }
                if (route.food < bos.Const.SHIP_CAPACITY) {
                    route.food *= 1000;
                }

                route.transport = parseInt(this.sbTransport.getSelection()[0].getModel());
                route.group = this.sbGroup.getSelection()[0].getModel();

                var sum = route.wood + route.stone + route.iron + route.food;
                if (sum == 0) {
                    bos.Utils.handleWarning(tr("please enter some resources amount"));
                    return;
                }

                if (route.from == route.to) {
                    bos.Utils.handleWarning(tr("invalid destination"));
                    return;
                }

                var storage = bos.Storage.getInstance();
                if (this.editedRoute == null) {
                    storage.addTradeRoute(route);
                } else {
                    this.editedRoute.from = route.from;
                    this.editedRoute.to = route.to;

                    this.editedRoute.wood = route.wood;
                    this.editedRoute.stone = route.stone;
                    this.editedRoute.iron = route.iron;
                    this.editedRoute.food = route.food;

                    this.editedRoute.transport = route.transport;
                    this.editedRoute.group = route.group
                    //refactor it later
                    storage.saveTradeRoutes();
                    storage.setTradeRoutesVersion(storage.getTradeRoutesVersion() + 1);
                }

                this.editedRoute == null;

                this.close();

            },
            createForm: function() {
                var box = new qx.ui.container.Composite(new qx.ui.layout.Dock());

                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Grid(20, 10));

                box.add(container);

                container.add(new qx.ui.basic.Label(tr("from")), {
                    row: 1,
                    column : 0
                });

                var selectWidth = 320;

                this.sbFrom = new qx.ui.form.SelectBox().set({
                    width: selectWidth,
                    height: 28
                });
                this._populateCitiesSelectBox(this.sbFrom);
                container.add(this.sbFrom, {
                    row: 1,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(tr("to")), {
                    row: 2,
                    column : 0
                });
                this.sbTo = new qx.ui.form.SelectBox().set({
                    width: selectWidth,
                    height: 28
                });
                this._populateCitiesSelectBox(this.sbTo);
                container.add(this.sbTo, {
                    row: 2,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(this.tr("tnf:wood")), {
                    row: 3,
                    column : 0
                });
                this.woodInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                this.woodInput.setWidth(120);
                container.add(this.woodInput, {
                    row: 3,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(this.tr("tnf:stone")), {
                    row: 4,
                    column : 0
                });
                this.stoneInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                this.stoneInput.setWidth(120);
                container.add(this.stoneInput, {
                    row: 4,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(this.tr("tnf:iron")), {
                    row: 5,
                    column : 0
                });
                this.ironInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                this.ironInput.setWidth(120);
                container.add(this.ironInput, {
                    row: 5,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(this.tr("tnf:food")), {
                    row: 6,
                    column : 0
                });
                this.foodInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                this.foodInput.setWidth(120);
                container.add(this.foodInput, {
                    row: 6,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(tr("transport")), {
                    row: 7,
                    column : 0
                });
                this.sbTransport = new qx.ui.form.SelectBox().set({
                    width: selectWidth,
                    height: 28
                });

                this.sbTransport.add(new qx.ui.form.ListItem(tr("ships then carts"), null, bos.Const.TRADE_TRANSPORT_SHIP_FIRST));
                this.sbTransport.add(new qx.ui.form.ListItem(tr("carts then ships"), null, bos.Const.TRADE_TRANSPORT_CART_FIRST));
                this.sbTransport.add(new qx.ui.form.ListItem(tr("only carts"), null, bos.Const.TRADE_TRANSPORT_CART));
                this.sbTransport.add(new qx.ui.form.ListItem(tr("only ships"), null, bos.Const.TRADE_TRANSPORT_SHIP));

                container.add(this.sbTransport, {
                    row: 7,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(tr("group")), {
                    row: 8,
                    column : 0
                });
                this.sbGroup = new qx.ui.form.SelectBox().set({
                    width: 200,
                    height: 28
                });

                for (var group = 0; group < 26; group++) {
                    var c = String.fromCharCode(65 + group);
                    this.sbGroup.add(new qx.ui.form.ListItem(c, null, c));
                }
                container.add(this.sbGroup, {
                    row: 8,
                    column: 1
                });

                container.add(new qx.ui.basic.Label(tr("resourceMultiplierNotice")), {
                    row: 9,
                    column : 0,
                    colSpan: 2
                });

                return box;
            },
            _populateCitiesSelectBox: function(sb) {

                sb.removeAll();

                var list = [];
                var cities = webfrontend.data.Player.getInstance().cities;
                for (var cityId in cities) {
                    var city = cities[cityId];
                    var name = city.name;
                    if (city.reference != null && city.reference != "") {
                        name += " [" + city.reference + "]";
                    }
                    list.push({
                        id: parseInt(cityId),
                        name: name
                    });
                }


                list.sort(function(a, b) {
                    var n1 = a.name.toLowerCase();
                    var n2 = b.name.toLowerCase();
                    if (n1 > n2) {
                        return 1;
                    } else if (n1 < n2) {
                        return -1;
                    } else if (a.id > b.id) {
                        return 1;
                    } else if (a.id < b.id) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    sb.add(new qx.ui.form.ListItem(item.name, null, item.id));
                }

            },
            editRoute: function(route) {
                this.editedRoute = route;

                this.sbFrom.setModelSelection([route.from]);
                this.sbTo.setModelSelection([route.to]);

                this.woodInput.setValue(route.wood);
                this.stoneInput.setValue(route.stone);
                this.ironInput.setValue(route.iron);
                this.foodInput.setValue(route.food);

                this.sbTransport.setModelSelection([route.transport]);
                this.sbGroup.setModelSelection([route.group]);

            },
            addNewRoute: function() {
                this.editedRoute = null;
                var city = webfrontend.data.City.getInstance();
                this.sbFrom.setModelSelection([parseInt(city.getId())]);
            },
            maxResources: function() {
                var from = parseInt(this.sbFrom.getSelection()[0].getModel());
                var server = bos.Server.getInstance();
                var city = server.cities[from];
                if (city == undefined) {
                    bos.Utils.handleError("Don't have data about selected 'from' city");
                    return;
                }

                var wood = parseInt(city.getResourceMaxStorage(bos.Const.WOOD));
                var stone = parseInt(city.getResourceMaxStorage(bos.Const.STONE));
                var iron = parseInt(city.getResourceMaxStorage(bos.Const.IRON));
                var food = parseInt(city.getResourceMaxStorage(bos.Const.FOOD));
                /* TODO do it later, not so important
                 var totalRes = wood + stone + iron + food;

                 var transport = parseInt(this.sbTransport.getSelection()[0].getModel());

                 var dg = city.getTraders();
                 if (dg != null) {
                 var carts = dg[bos.Const.TRADE_TRANSPORT_CART].total;
                 var ships = dg[bos.Const.TRADE_TRANSPORT_SHIP].total;

                 var amountLand = carts * bos.Const.CART_CAPACITY;
                 var amountSea = ships * bos.Const.SHIP_CAPACITY;

                 var totalTransportable;
                 switch (route.transport) {
                 case bos.Const.TRADE_TRANSPORT_CART:
                 totalTransportable = amountLand;
                 break;
                 case bos.Const.TRADE_TRANSPORT_SHIP:
                 totalTransportable = amountSea;
                 break;
                 case bos.Const.TRADE_TRANSPORT_CART_FIRST:
                 totalTransportable = amountLand + amountSea;
                 break;
                 case bos.Const.TRADE_TRANSPORT_SHIP_FIRST:
                 totalTransportable = amountLand + amountSea;
                 break;
                 }

                 if (totalTransportable < totalRes) {
                 //COPY & PASTE START
                 totalRes = 0;
                 for (var i = 1; i <= 4; i++) {
                 //wood = Math.min(wood, Math.floor(amountCurrent * woodPart));
                 resources[i] = Math.min(resources[i], Math.floor(amountCurrent * routeResPart[i]));
                 totalRes += resources[i];
                 }

                 if (maxMode && totalRes < amountCurrent) {
                 var diff = amountCurrent - totalRes;
                 var step = 10000;

                 var noIncrement = false;
                 while (diff > 0 && !noIncrement) {

                 noIncrement = true;

                 for (var i = 1; i <= 4; i++) {
                 var left = Math.min(step, diff, ri.from.resources[i] - resources[i]);
                 if (left > 0) {
                 resources[i] += left;
                 diff -= left;
                 noIncrement = false;
                 }
                 }
                 }
                 }
                 //COPY & PASTE END
                 }

                 }
                 */

                this.woodInput.setValue(wood);
                this.stoneInput.setValue(stone);
                this.ironInput.setValue(iron);
                this.foodInput.setValue(food);
            }
        }
    });
});