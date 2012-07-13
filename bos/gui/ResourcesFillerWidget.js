/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 22:37
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.ResourcesFillerWidget");

    qx.Class.define("bos.gui.ResourcesFillerWidget", {
        type: "singleton",
        extend: qx.ui.window.Window,
        construct: function() {
            qx.ui.window.Window.call(this);
            this.setLayout(new qx.ui.layout.Dock());

            this.set({
                width: 500,
                minWidth: 200,
                maxWidth: 600,
                height: 350,
                minHeight: 200,
                maxHeight: 600,
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: (tr("fill with resources")),
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
            toX: null,
            toY: null,
            sbResType: null,
            maxResourcesInput: null,
            maxTravelTimeInput: null,
            cbAllowSameContinent: null,
            cbAllowOtherContinent: null,
            cbPalaceSupport: null,
            lblTarget: null,
            cityInfos: {},
            activateOverlay: function(activated) {
                //nothing
            },
            createFooter: function() {
                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));

                var btnAdd = new qx.ui.form.Button(tr("request resources"));
                btnAdd.setWidth(160);
                container.add(btnAdd);
                btnAdd.addListener("click", this.fillResources, this);

                return container;
            },
            fillResources: function() {

                var toX = parseInt(this.toX.getValue(), 10);
                var toY = parseInt(this.toY.getValue(), 10);
                if (toX == 0 && toY == 0) {
                    bos.Utils.handleWarning(tr("invalid destination"));
                    return;
                }

                var cityId = bos.Utils.convertCoordinatesToId(toX, toY);
                if (this.cityInfos[cityId] == undefined || this.cityInfos[cityId] == null) {
                    alert("Please click search button");
                    return;
                }
                var targetCityInfo = this.cityInfos[cityId];

                var req = {
                    maxResourcesToBeSent: parseInt(this.maxResourcesInput.getValue()),
                    cityId: cityId,
                    maxTravelTime: parseInt(this.maxTravelTimeInput.getValue()),
                    targetPlayer: targetCityInfo.pn,
                    palaceSupport: this.cbPalaceSupport.getValue(),
                    resType: parseInt(this.sbResType.getSelection()[0].getModel()),
                    allowSameContinent: this.cbAllowSameContinent.getValue(),
                    allowOtherContinent: this.cbAllowOtherContinent.getValue()
                }
                bos.ResourcesFiller.getInstance().populateCityWithResources(req);

                //this.close();
            },
            createForm: function() {
                var box = new qx.ui.container.Composite(new qx.ui.layout.Dock());

                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Grid(20, 10));

                box.add(container);

                var selectWidth = 320;
                var row = 0;

                container.add(new qx.ui.basic.Label(tr("resource type")), {
                    row: row,
                    column : 0
                });
                this.sbResType = new qx.ui.form.SelectBox().set({
                    width: selectWidth,
                    height: 28
                });
                this.sbResType.add(new qx.ui.form.ListItem(tr("wood"), null, bos.Const.WOOD));
                this.sbResType.add(new qx.ui.form.ListItem(tr("stone"), null, bos.Const.STONE));
                this.sbResType.add(new qx.ui.form.ListItem(tr("iron"), null, bos.Const.IRON));
                this.sbResType.add(new qx.ui.form.ListItem(tr("food"), null, bos.Const.FOOD));
                container.add(this.sbResType, {
                    row: row,
                    column: 1
                });
                row++;

                container.add(new qx.ui.basic.Label(tr("to")), {
                    row: row,
                    column : 0
                });
                var containerXY = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));

                this.toX = new qx.ui.form.TextField("");
                this.toX.setWidth(40);
                containerXY.add(this.toX);
                this.toY = new qx.ui.form.TextField("");
                this.toY.setWidth(40);
                containerXY.add(this.toY);

                var btnSearchTarget = new qx.ui.form.Button(tr("search"));
                btnSearchTarget.setWidth(80);
                container.add(btnSearchTarget);
                btnSearchTarget.addListener("click", this.searchTarget, this);
                containerXY.add(btnSearchTarget);

                var btnCurrentCity = new qx.ui.form.Button(tr("current city"));
                btnCurrentCity.setWidth(120);
                container.add(btnCurrentCity);
                btnCurrentCity.addListener("click", this.setCurrentCityAsTarget, this);
                containerXY.add(btnCurrentCity);

                container.add(containerXY, {
                    row: row,
                    column : 1
                });
                row++;

                /*
                 this.lblTarget = new qx.ui.basic.Label("");
                 container.add(this.lblTarget, {
                 row: row,
                 column : 1
                 });
                 row++;
                 */

                container.add(new qx.ui.basic.Label(tr("max resources to send")), {
                    row: row,
                    column : 0
                });

                var resContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
                this.maxResourcesInput = new webfrontend.gui.SpinnerInt(0, 0, 100000000);
                this.maxResourcesInput.setWidth(100);
                resContainer.add(this.maxResourcesInput);

                resContainer.add(this._createIncreaseAmountBtn("500k", 500000));
                resContainer.add(this._createIncreaseAmountBtn("1M", 1000000));
                resContainer.add(this._createIncreaseAmountBtn("5M", 5000000));
                resContainer.add(this._createIncreaseAmountBtn("10M", 10000000));

                container.add(resContainer, {
                    row: row,
                    column: 1
                });
                row++;

                container.add(new qx.ui.basic.Label(tr("max travel time")), {
                    row: row,
                    column : 0
                });
                var timeContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(5));
                this.maxTravelTimeInput = new webfrontend.gui.SpinnerInt(24, 1, 96);
                this.maxTravelTimeInput.setWidth(100);
                timeContainer.add(this.maxTravelTimeInput);

                timeContainer.add(this._createMaxTravelTimeBtn("24h", 24));
                timeContainer.add(this._createMaxTravelTimeBtn("48h", 48));
                timeContainer.add(this._createMaxTravelTimeBtn("96h", 96));

                container.add(timeContainer, {
                    row: row,
                    column: 1
                });
                row++;

                this.cbAllowSameContinent = new qx.ui.form.CheckBox(tr("cbAllowSameContinent"));
                this.cbAllowSameContinent.setToolTipText(tr("cbAllowSameContinent_toolTip"));
                this.cbAllowSameContinent.setValue(true);
                container.add(this.cbAllowSameContinent, {
                    row: row,
                    column: 1
                });
                row++;

                this.cbAllowOtherContinent = new qx.ui.form.CheckBox(tr("cbAllowOtherContinent"));
                this.cbAllowOtherContinent.setToolTipText(tr("cbAllowOtherContinent_toolTip"));
                this.cbAllowOtherContinent.setValue(true);
                container.add(this.cbAllowOtherContinent, {
                    row: row,
                    column: 1
                });
                row++;

                this.cbPalaceSupport = new qx.ui.form.CheckBox(tr("cbPalaceSupport"));
                this.cbPalaceSupport.setToolTipText(tr("cbPalaceSupport_toolTip"));
                this.cbPalaceSupport.setValue(false);
                container.add(this.cbPalaceSupport, {
                    row: row,
                    column: 1
                });
                row++;

                return box;
            },
            _createMaxTravelTimeBtn: function(label, amount) {
                var btn = new qx.ui.form.Button(label).set({
                    appearance: "button-recruiting",
                    font: "bold",
                    width: 50
                });

                btn.addListener("click", function(event) {
                    this.maxTravelTimeInput.setValue(amount);
                }, this);
                return btn;
            },
            _createIncreaseAmountBtn: function(label, amount) {
                var btn = new qx.ui.form.Button(label).set({
                    appearance: "button-recruiting",
                    font: "bold",
                    width: 50
                });

                btn.addListener("click", function(event) {
                    this.maxResourcesInput.setValue(this.maxResourcesInput.getValue() + amount);
                }, this);
                return btn;
            },
            searchTarget: function() {

                var toX = parseInt(this.toX.getValue(), 10);
                var toY = parseInt(this.toY.getValue(), 10);

                var cityId = bos.Utils.convertCoordinatesToId(toX, toY);

                bos.net.CommandManager.getInstance().sendCommand("GetPublicCityInfo", {
                    id: cityId
                }, this, this._onCityInfo, cityId);
            },
            _onCityInfo: function(isOk, result, cityId) {
                if (isOk && result != null) {
                    this.cityInfos[cityId] = result;
                }
            },
            setCurrentCityAsTarget: function() {
                this.editedRoute = null;
                var city = webfrontend.data.City.getInstance();
                var coords = bos.Utils.convertIdToCoordinatesObject(city.getId());
                this.toX.setValue("" + coords.xPos);
                this.toY.setValue("" + coords.yPos);
                this.cityInfos[city.getId()] = {
                    pn: webfrontend.data.Player.getInstance().getName()
                }

                var resType = parseInt(this.sbResType.getSelection()[0].getModel());

                var server = bos.Server.getInstance();
                var bosCity = server.cities[city.getId()];
                if (bosCity != null) {
                    var freeSpace = Math.max(0, parseInt(bosCity.getResourceMaxStorage(resType)) - parseInt(bosCity.getTradeIncomingResources(resType)) - parseInt(bosCity.getResourceCount(resType)));
                    this.maxResourcesInput.setValue(freeSpace);
                }
            }
        }
    });
});