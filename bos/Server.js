/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:06
 */
(function (window, undefined) {
    qx.Class.define("bos.Server", {
        extend: qx.core.Object,
        type: "singleton",
        construct: function() {
            //webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateCity, this);
            //webfrontend.data.City.getInstance().addListener("changeCity", this.onCityChanged, this);
            webfrontend.data.City.getInstance().addListener("changeVersion", this.updateCity, this);

            this.persistCityTimer = new qx.event.Timer(5500);
            this.persistCityTimer.addListener("interval", this._persistPendingCity, this);
            this.persistCityTimer.start();

            this._pollCityTimer = new qx.event.Timer(bos.Const.MIN_SEND_COMMAND_INTERVAL);
            this._pollCityTimer.addListener("interval", this._pollNextCity, this);
        },
        properties: {
            lastUpdatedCityId: {
                init: false,
                event: "bos.data.changeLastUpdatedCityId"
            },
            lastUpdatedCityAt: {
                init: false
            },
            cityResourcesUpdateTime: {
                init: null,
                event: "bos.data.changeCityResourcesUpdateTime"
            }
        },
        members: {
            cities: new Object(),
            cityResources: new Object(),
            como: new Object(),
            _citiesToPoll: new Array(),
            _citiesToPersist: new Array(),
            _dirtyCities: new Object(),
            persistCityTimer: null,
            _pollCitiesProgressDialog: null,
            sectors: new Object(),
            onCityChanged: function() {
                var city = webfrontend.data.City.getInstance();

                if (city.getId() == -1) {
                    return;
                }
                this.markCityDirty(city.getId());
            },
            markCityDirty: function(s) {
                var cityId = parseInt(s, 10);
                var dirty = this._dirtyCities[cityId] || false;
                if (!dirty) {
                    this._dirtyCities[cityId] = true;
                    this._citiesToPersist.push(cityId);
                }
            },
            _persistPendingCity: function() {
                if (this._citiesToPersist.length == 0) {
                    return;
                }
                var cityId = this._citiesToPersist[0];
                this._dirtyCities[cityId] = false;
                this._citiesToPersist.splice(0, 1);
                this.persistCity(cityId);
                return;
            },
            persistCity: function(cityId) {
                if (!bos.Storage.getInstance().getPersistingCitiesEnabled()) {
                    return;
                }
                var prevCity = this.cities[cityId];
                if (prevCity != null) {
                    try {
                        bos.Storage.getInstance().saveCity(prevCity);
                    } catch (e) {
                        bos.Storage.getInstance().setPersistingCitiesEnabled(false);
                        bos.Utils.handleError("Error when trying to persist city " + prevCity.getName() + ". Persisting has been disabled. Error: " + e);
                    }
                }
            },
            persistAllPendingCities: function() {
                if (confirm("there are " + this._citiesToPersist.length + " cities to be saved, continue?")) {
                    var count = 0;
                    while (this._citiesToPersist.length > 0) {
                        this._persistPendingCity();
                        count++;
                    }
                    alert("Persisted " + count + " cities");
                }
            },
            pollCities: function(citiesToPoll) {
                this._citiesToPoll = citiesToPoll;

                this._disposePollCitiesProgressDialog();
                this._pollCitiesProgressDialog = new webfrontend.gui.ConfirmationWidget();
                this._pollCitiesProgressDialog.showInProgressBox(tr("cities to fetch: ") + this._citiesToPoll.length);
                qx.core.Init.getApplication().getDesktop().add(this._pollCitiesProgressDialog, {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                });
                this._pollCitiesProgressDialog.show();

                this._pollCityTimer.start();
            },
            pollAllCities: function() {
                var citiesToPoll = [];

                var cities = webfrontend.data.Player.getInstance().cities;
                for (var cityId in cities) {
                    if (qx.lang.Type.isNumber(cityId)) {
                        citiesToPoll.push(cityId);
                    }
                }

                this.pollCities(citiesToPoll);
            },
            _disposePollCitiesProgressDialog: function() {
                if (this._pollCitiesProgressDialog != null) {
                    this._pollCitiesProgressDialog.disable();
                    this._pollCitiesProgressDialog.destroy();
                    this._pollCitiesProgressDialog = null;
                }
            },
            _pollNextCity: function() {
                if (this._citiesToPoll.length > 0) {
                    var cityId = this._citiesToPoll[0];
                    this._citiesToPoll.splice(0, 1);
                    bos.net.CommandManager.getInstance().pollCity(cityId);

                    this._pollCitiesProgressDialog.showInProgressBox(tr("cities to fetch: ") + this._citiesToPoll.length);
                } else {
                    this._pollCityTimer.stop();
                    this._disposePollCitiesProgressDialog();
                }
            },
            updateCity: function() {
                var city = webfrontend.data.City.getInstance();

                if (city.getId() == -1) {
                    return;
                }

//bos.Utils.handleError(city.getId() + " " + city.getVersion());

                //do not update the same city too often
                /*
                 if (this.getLastUpdatedCityId() != null && this.getLastUpdatedCityId() == city.getId()) {
                 var diff = new Date() - this.getLastUpdatedCityAt();
                 if (diff < 10) {
                 return;
                 }
                 }
                 */
                var c = new bos.City();
                c.populate(city);
                if (this.cities[c.getId()] != undefined) {
                    //alert("DELETE");
                    this.cities[c.getId()].dispose();
                    //this._disposeObjects(this.cities[c.getId()]);
                    //delete this.cities[c.getId()];
                }
                this.cities[c.getId()] = c;

                this.setLastUpdatedCityId(c.getId());
                this.setLastUpdatedCityAt(new Date());

                this.markCityDirty(city.getId());
            },
            addCOMOItem: function(item) {
                this.como[item.i] = item;
                this.updateCityFromCOMOItem(item);
            },
            updateCityFromCOMOItem: function(item) {
                if (this.cities[item.i] == undefined) {
                    return;
                }
                var city = this.cities[item.i];
                city.units = new Object();
                city.unitOrders = new Array();

                for (var i = 0; i < item.c.length; i++) {
                    var command = item.c[i];
                    var units = new Array();
                    for (var j = 0; j < command.u.length; j++) {
                        var unit = command.u[j];

                        if (command.i == 0) {
                            city.units[unit.t] = {
                                count: unit.c,
                                total: unit.c,
                                speed: -1
                            };
                        } else {
                            var cityUnits = city.units[unit.t];
                            if (cityUnits == undefined) {
                                city.units[unit.t] = {
                                    count: 0,
                                    total: 0,
                                    speed: -1
                                }
                                cityUnits = city.units[unit.t];
                            }
                            if (command.d == 0) {
                                //delayed order cannot increase troop count
                                cityUnits.total += unit.c;
                            }
                        }

                        units.push({
                            type: unit.t,
                            count: unit.c
                        });
                    }

                    if (command.i != 0) {
                        //{"i":26722474,"t":8,"s":2,"cn":"Mountain:9","c":7995428,"pn":"","p":0,"e":19024467,"d":0,"q":0,"r":1,"u":[{"t":6,"c":129237}]}]},

                        var order = {
                            id: command.i,
                            type: command.t,
                            state: command.s,
                            //start: command.ss,
                            start: null,
                            end: command.e,
                            city: command.c,
                            cityName: command.cn,
                            player: command.p,
                            playerName: command.pn,
                            //alliance: command.a,
                            //allianceName: command.an,
                            units: units,
                            isDelayed: command.d,
                            recurringType: command.r,
                            //recurringEndStep: command.rs,
                            quickSupport: command.q
                        };
                        city.unitOrders.push(order);
                    }
                }
            }
        }
    });
})(window);