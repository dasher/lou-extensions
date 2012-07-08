/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:26
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.IntelligenceOptionsWidget");

    qx.Class.define("bos.gui.IntelligenceOptionsWidget", {
        extend: qx.ui.window.Window,
        construct: function() {
            qx.ui.window.Window.call(this);

            this.set({
                width: 420,
                minWidth: 200,
                maxWidth: 700,
                height: 200,
                minHeight: 200,
                maxHeight: 400,
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: (tr("intelligence")),
                resizeSensitivity: 7,
                contentPadding: 0
            });

            this.setLayout(new qx.ui.layout.VBox(5));

            var res = webfrontend.res.Main.getInstance();
            var scroll = new qx.ui.container.Scroll();
            this.add(scroll, {flex: true});

            scroll.add(this.createForm());

            this.add(this.createFooter());

            webfrontend.gui.Util.formatWinClose(this);

            this.moveTo(400, 200);

        },
        members: {
            editedIntel: null,
            description: null,
            toX: null,
            toY: null,
            lblCityInfo: null,
            cityInfos: new Object(),
            createFooter: function() {
                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Flow(5, 5));

                var btnOk = new qx.ui.form.Button(tr("OK"));
                btnOk.setWidth(150);
                container.add(btnOk);
                btnOk.addListener("click", this.confirm, this);

                return container;
            },
            createForm: function() {
                var box = new qx.ui.container.Composite(new qx.ui.layout.Dock());

                var container = new qx.ui.groupbox.GroupBox();
                container.setLayout(new qx.ui.layout.Grid(20, 10));

                box.add(container);

                var row = 1;

                container.add(new qx.ui.basic.Label(tr("position")), {
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

                var btnSearchTarget = new qx.ui.form.Button(tr("Search"));
                btnSearchTarget.setWidth(80);
                container.add(btnSearchTarget);
                btnSearchTarget.addListener("click", this.searchTarget, this);
                containerXY.add(btnSearchTarget);

                this.lblCityInfo = new qx.ui.basic.Label("");
                containerXY.add(this.lblCityInfo);

                container.add(containerXY, {
                    row: row,
                    column : 1
                });

                row++;

                container.add(new qx.ui.basic.Label(this.tr("description")), {
                    row: row,
                    column : 0
                });
                this.description = new qx.ui.form.TextField("");
                this.description.setWidth(320);
                a.setElementModalInput(this.description);
                container.add(this.description, {
                    row: row,
                    column : 1
                });

                return box;
            },
            clearAll: function() {
                this.toX.setValue("");
                this.toY.setValue("");
                this.description.setValue("");
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
                    this.lblCityInfo.setValue(result.pn + " - " + result.n);
                }
            },
            confirm: function() {

                var toX = parseInt(this.toX.getValue(), 10);
                var toY = parseInt(this.toY.getValue(), 10);

                var cityId = bos.Utils.convertCoordinatesToId(toX, toY);

                if (this.cityInfos[cityId] == undefined) {
                    bos.Utils.handleError("Click search first");
                    return;
                }

                var info = this.cityInfos[cityId];

                var intel = {
                    cityId: cityId,
                    name: info.n,
                    isLandlocked: info.w != 1,
                    hasCastle: info.s == 1,
                    owner: info.pn,
                    description: this.description.getValue(),
                    lastModified: (new Date()).getTime(),
                    modifiedBy: webfrontend.data.Player.getInstance().getName()
                };

                var storage = bos.Storage.getInstance();
                if (this.editedIntel == null) {
                    storage.addIntelligence(intel);
                } else {
                    storage.removeIntelligence(cityId);
                    storage.addIntelligence(intel);
                }
                storage.setIntelligenceVersion(storage.getIntelligenceVersion() + 1);

                this.editedIntel == null;

                this.close();
            },
            updateView: function() {

            },
            prepareView: function(cityId) {
                this.clearAll();
                var storage = bos.Storage.getInstance();
                this.editedIntel = storage.findIntelligenceById(cityId);
                if (this.editedIntel != null) {
                    var coords = bos.Utils.convertIdToCoordinatesObject(cityId);
                    this.toX.setValue("" + coords.xPos);
                    this.toY.setValue("" + coords.yPos);
                    this.description.setValue("" + this.editedIntel.description);
                }
                this.updateView();
            }
        }
    });
});