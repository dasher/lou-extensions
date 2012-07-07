/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:03
 */
(function (window, undefined) {
    qx.Class.define("bos.ResourcesFiller", {
        type: "singleton",
        extend: qx.core.Object,
        construct: function() {

        },
        properties: {
            numberOfMessagesWaitingForResponse: {
                init: 0
            }
        },
        members: {
            lastStatus: null,
            populateCityWithResources: function(request) {
                this.setNumberOfMessagesWaitingForResponse(this.getNumberOfMessagesWaitingForResponse() + 1);
                bos.net.CommandManager.getInstance().sendCommand("TradeSearchResources", {
                    cityid: request.cityId,
                    resType: request.resType,
                    minResource: bos.Const.SHIP_CAPACITY,
                    maxTime: request.maxTravelTime * webfrontend.data.ServerTime.getInstance().getStepsPerHour()
                }, this, this._processTradeSearchResources, request);
            },
            _processTradeSearchResources: function(result, n, request) {
                this.setNumberOfMessagesWaitingForResponse(this.getNumberOfMessagesWaitingForResponse() - 1);

                if (result == false || n == null) return;

                var cities = new Array();
                var transports = new Array();

                var destCoords = bos.Utils.convertIdToCoordinatesObject(request.cityId);

                for (var i = 0; i < n.length; i++) {
                    var city = n[i];
                    var srcCoords = bos.Utils.convertIdToCoordinatesObject(city.i);

                    if (city.i == request.cityId || city.sg) {
                        continue;
                    }
                    if (destCoords.cont == srcCoords.cont && !request.allowSameContinent) {
                        continue;
                    } else if (destCoords.cont != srcCoords.cont && !request.allowOtherContinent) {
                        continue;
                    }

                    if (request.resType == bos.Const.FOOD) {
                        var playerCities = webfrontend.data.Player.getInstance().cities;
                        var type = bos.CityTypes.getInstance().parseReference(playerCities[city.i].reference);
                        if (type.isCastle) {
                            continue;
                        }
                    }

                    cities.push(city);

                    if (city.lt > 0) {
                        transports.push({
                            cityIndex: cities.length - 1,
                            capacity: city.la,
                            travelTime: city.lt,
                            land: true
                        });
                    }
                    if (city.st > 0) {
                        transports.push({
                            cityIndex: cities.length - 1,
                            capacity: city.sa,
                            travelTime: city.st,
                            land: false
                        });
                    }

                }

                transports.sort(function(a, b) {
                    if (a.travelTime > b.travelTime) {
                        return 1;
                    } else if (a.travelTime < b.travelTime) {
                        return -1;
                    } else {
                        return 0;
                    }
                });

                var toBeSent = request.maxResourcesToBeSent;
                for (var i = 0, count = transports.length; i < count; i++) {
                    var transport = transports[i];
                    var city = cities[transport.cityIndex];
                    var srcCoords = bos.Utils.convertIdToCoordinatesObject(city.i);

                    if (toBeSent <= 0) {
                        break;
                    }

                    var resCount = Math.min(city.rc, transport.capacity, toBeSent);
                    if (resCount <= 0) {
                        continue;
                    }

                    var trade = {
                        cityid: city.i,
                        tradeTransportType: transport.land ? 1 : 2,
                        targetPlayer: request.targetPlayer,
                        targetCity: destCoords.xPos + ":" + destCoords.yPos,
                        palaceSupport: request.palaceSupport,
                        res: new Array()
                    };

                    trade.res.push({
                        t: request.resType,
                        c: resCount
                    });

                    city.rc -= resCount;
                    toBeSent -= resCount;

                    bos.net.CommandManager.getInstance().sendCommand("TradeDirect", trade, this, this._onTradeDirectSendDone, trade);
                }

            },
            _onTradeDirectSendDone: function(isOk, result, param) {
                this.lastStatus = result;
                //console.log(isOk + " " + result + " " + param);
            }
        }
    });

})(window);