/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:34
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.net.CommandManager");

    qx.Class.define("bos.net.CommandManager", {
        type: "singleton",
        extend: qx.core.Object,
        construct: function() {
            this._sendTimer = new qx.event.Timer(bos.Const.MIN_SEND_COMMAND_INTERVAL);
            this._sendTimer.addListener("interval", this.sendPendingCommand, this);
            this._sendTimer.start();
        },
        properties: {
            lastSendCommand: {
                init: 0
            }
        },
        members: {
            _toSend: [],
            _sendTimer: null,
            sendCommand: function(endPoint, request, context, onSendDone, extraValue) {
                var now = (new Date()).getTime();
                if (now - this.getLastSendCommand() >= bos.Const.MIN_SEND_COMMAND_INTERVAL) {
                    this.forcedSendCommand(endPoint, request, context, onSendDone, extraValue);
                } else {
                    this._toSend.push({
                        endPoint: endPoint,
                        request: request,
                        context: context,
                        onSendDone: onSendDone,
                        extraValue: extraValue
                    });
                }
            },
            getNumberOfPendingCommands: function() {
                return this._toSend.length;
            },
            forcedSendCommand: function(endPoint, request, context, onSendDone, extraValue) {
                var now = (new Date()).getTime();
                webfrontend.net.CommandManager.getInstance().sendCommand(endPoint, request, context, onSendDone, extraValue);
                this.setLastSendCommand(now);
            },
            sendPendingCommand: function() {
                if (this._toSend.length > 0) {
                    var o = this._toSend[0];
                    this._toSend.splice(0, 1);
                    this.forcedSendCommand(o.endPoint, o.request, o.context, o.onSendDone, o.extraValue);
                }
            },
            pollCity: function(cityId) {
                var sb = new qx.util.StringBuilder(2048);
                sb.add("CITY", ":", cityId, '\f');
                this.poll(sb.get(), cityId);
            },
            pollWorld: function(sectorIds) {
                var sb = new qx.util.StringBuilder(2048);
                sb.add("WORLD", ":");

                for (var i = 0; i < sectorIds.length; i++) {
                    var sectorId = sectorIds[i];
                    var s = I_KEB_MEB(sectorId) + I_KEB_REB(0);
                    sb.add(s);
                }

                sb.add('\f');
                this.poll(sb.get(), sectorIds);
            },
            poll: function(requests, callbackArg) {
                this.requestCounter = 0;

                var updateManager = webfrontend.net.UpdateManager.getInstance();

                var data = new qx.util.StringBuilder(2048);
                data.add('{"session":"', updateManager.getInstanceGuid(), '","requestid":"', updateManager.requestCounter, '","requests":', qx.util.Json.stringify(requests), "}");
                updateManager.requestCounter++;

                var req = new qx.io.remote.Request(updateManager.getUpdateService() + "/Service.svc/ajaxEndpoint/Poll", "POST", "application/json");
                req.setProhibitCaching(false);
                req.setRequestHeader("Content-Type", "application/json");
                req.setData(data.get());
                req.setTimeout(10000);
                req.addListener("completed", function(e) {
                    this.completeRequest(e, callbackArg);
                }, this);
                req.addListener("failed", this.failRequest, this);
                req.addListener("timeout", this.timeoutRequest, this);
                req.send();
            },
            completeRequest: function(e, obj) {

                if (e.getContent() == null) return;

                for (var i = 0; i < e.getContent().length; i++) {
                    var item = e.getContent()[i];
                    var type = item.C;
                    if (type == "CITY") {
                        this.parseCity(obj, item.D);
                    } else if (type == "WORLD") {
                        this.parseWorld(item.D);
                    } else if (type == "OA") {
                        this.parseOA(item.D);
                    }
                }
            },
            failRequest: function(e) {

            },
            timeoutRequest: function(e) {

            },
            parseOA: function(data) {
                if (data == null || data.a == null) {
                    return;
                }
                try {
                    var sum = 0;
                    for (var i = 0; i < data.a.length; i++) {
                        var a = data.a[i];
                        sum += a.ta;
                    }
                    console.log(sum);
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },
            parseWorld: function(data) {
                if (data == null || data.s == null) {
                    return;
                }
                try {
                    var server = bos.Server.getInstance();
                    for (var i = 0; i < data.s.length; i++) {
                        var d = data.s[i];

                        var sector;
                        if (server.sectors[d.i] != null) {
                            sector = server.sectors[d.i];
                        } else {
                            sector = new bosSector();
                        }
                        sector.init(d);

                        server.sectors[d.i] = sector;
                    }
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },
            parseCity: function(cityId, data) {
                try {
                    var server = bos.Server.getInstance();
                    var city = server.cities[cityId];
                    var store = false;
                    if (city == undefined) {
                        city = new bos.City();
                        store = true;
                    }
                    city.dispatchResults(data);
                    if (store) {
                        city.setId(cityId);
                        server.cities[cityId] = city;
                    }
                    server.markCityDirty(cityId);
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            }
        }
    });
});