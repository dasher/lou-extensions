/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 22:40
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.BatchResourcesFiller");

    qx.Class.define("bos.BatchResourcesFiller", {
        type: "singleton",
        extend: qx.core.Object,
        construct: function() {
            this.timer = new qx.event.Timer(1000);
            this.timer.addListener("interval", this._sendPendingFillRequest, this);
        },
        properties: {

        },
        members: {
            timer: null,
            _progressDialog: null,
            fillRequests: new Array(),
            fillCitiesWithResources: function(cities, resType) {
                var server = bos.Server.getInstance();
                for (var i = 0, count = cities.length; i < count; i++) {
                    var cityId = cities[i];
                    var city = server.cities[cityId];
                    if (city == null) {
                        continue;
                    }
                    this.fillRequests.push({
                        city: city,
                        resType: resType
                    });
                }

                this._disposeProgressDialog();

                this._progressDialog = new webfrontend.gui.ConfirmationWidget();
                this._progressDialog.showInProgressBox(tr("cities to be filled: ") + this.fillRequests.length);
                qx.core.Init.getApplication().getDesktop().add(this._progressDialog, {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                });
                this._progressDialog.show();
                this.timer.start();
            },
            _sendPendingFillRequest: function() {
                if (this.fillRequests.length == 0) {
                    this.timer.stop();
                    this._disposeProgressDialog();
                    return;
                }
                if (bos.net.CommandManager.getInstance().getNumberOfPendingCommands() == 0 && bos.ResourcesFiller.getInstance().getNumberOfMessagesWaitingForResponse() == 0) {
                    this._progressDialog.showInProgressBox(tr("cities to be filled: ") + this.fillRequests.length);

                    var req = this.fillRequests[0];
                    this.fillRequests.splice(0, 1);
                    this.fillCityWithResources(req.city, req.resType);
                }
            },
            fillCityWithResources: function(city, resType) {

                var cityId = city.getId();
                var playerName = webfrontend.data.Player.getInstance().getName();

                var freeSpace = Math.max(0, parseInt(city.getResourceMaxStorage(resType)) - parseInt(city.getTradeIncomingResources(resType)) - parseInt(city.getResourceCount(resType)));
                if (freeSpace < bos.Const.SHIP_CAPACITY) {
                    return;
                }

                var req = {
                    maxResourcesToBeSent: freeSpace,
                    cityId: cityId,
                    maxTravelTime: 48,
                    targetPlayer: playerName,
                    palaceSupport: false,
                    resType: resType,
                    allowSameContinent: true,
                    allowOtherContinent: true
                }
                bos.ResourcesFiller.getInstance().populateCityWithResources(req);
            },
            _disposeProgressDialog: function() {
                if (this._progressDialog != null) {
                    this._progressDialog.disable();
                    this._progressDialog.destroy();
                    this._progressDialog = null;
                }
            }
        }
    });

});