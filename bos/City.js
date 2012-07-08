/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:53
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.BatchResourcesFiller");

    qx.Class.define("bos.City", {
        extend: qx.core.Object,
        construct: function() {
            qx.Bootstrap.setDisplayName(this, "bos.City");
            this.resources = new Object();
            this.setId(-1);
            //this.setRequestId(-1);
        }, destruct: function() {
            //alert("Destroying " + this.getId());

            delete this.resources;
            delete this.buildQueue;
            delete this.units;
            delete this.traders;

            delete this.unitOrders;
            delete this.tradeOrders;

            delete this.unitQueue;
            delete this.recruitingSpeed;
            delete this.incomingUnitOrders;
            delete this.supportOrders,
                delete this.tradeIncoming;

        },
        statics: {
            SERIALIZABLE_MEMBERS: ["resources", "units", "buildQueue", "unitQueue", "recruitingSpeed", "unitOrders", "incomingUnitOrders", "supportOrders", "traders" /*XXX trades are useless to save, "tradeOrders", "tradeIncoming"*/],
            createFromSimpleObject: function(o) {
                var c = new bos.City();
                var props = qx.Class.getProperties(c.constructor);

                o["lastUpdated"] = new Date(o["lastUpdated"]);

                for (var prop in props) {
                    var name = props[prop];
                    try {
                        if (o[name] != undefined) {
                            c.set(name, o[name]);
                        }
                    } catch (e) {
                        debug(name + " " + e);
                    }
                }

                var members = bos.City.SERIALIZABLE_MEMBERS;
                for (var key in members) {
                    var m = members[key];
                    c[m] = o[m];
                }

                return c;
            }
        }, properties: {
            id: {
                init: -1
            },
            lastUpdated: {
                init: null
            },
            requestId: {
                init: -1
            },
            version: {
                init: -1
            },
            //id: {
            //        event: bK
            // }, version: {
            //        init: -1,
            //        event: ba
            onWater: {
                init: false
            }, unitCount: {
                init: 0
            }, unitLimit: {
                init: 0
            }, unitsInQueue: {
                init: 0
            }, buildingCount: {
                init: 0
            }, buildingLimit: {
                init: 0
            }, buildingsInQueue: {
                init: 0
            }, strongHold: {
                init: false
            }, sieged: {
                init: false
            }, canRecruit: {
                init: false
            }, canCommand: {
                init: false
            }, orderLimit: {
                init: 0
            }, barracksLevel: {
                init: 0
            }, townhallLevel: {
                init: 0
            }, marketplaceLevel: {
                init: 0
            }, harborLevel: {
                init: 0
            }, wallLevel: {
                init: 0
            }, hideoutSize: {
                init: 0
            }, foodConsumption: {
                init: 0
            }, foodConsumptionSupporter: {
                init: 0
            }, foodConsumptionQueue: {
                init: 0
            }, buildTimeAbsMod: {
                init: 0
            }, buildTimePercentMod: {
                init: 0
            }, plunderProtection: {
                init: 0
            }, goldProduction: {
                init: 0
            }, name: {
                init: ""
            }, reference: {
                reference: ""
            }, text: {
                init: ""
            }, buildingQueueStart: {
                init: 0
            }, buildingQueueEnd: {
                init: 0
            }
        }, members: {
            resources: null,
            units: null,
            buildQueue: null,
            unitQueue: null,
            recruitingSpeed: null,
            unitOrders: null,
            incomingUnitOrders: null,
            tradeOrders: null,
            tradeIncoming: null,
            //----------------
            toSimpleObject : function() {
                var o = new Object();

                var props = qx.Class.getProperties(this.constructor);
                for (var prop in props) {
                    var name = props[prop];
                    try {
                        if (qx.lang.Type.isString(name) && name.indexOf("function ") != 0) {
                            o[name] = this.get(name);
                        }
                    } catch (e) {
                        debug(name + " " + e);
                    }
                }

                //qx does strange things for date object when serializing to JSON, below is workaround
                o["lastUpdated"] = this.getLastUpdated().getTime();

                var members = bos.City.SERIALIZABLE_MEMBERS;
                for (var key in members) {
                    var m = members[key];
                    o[m] = this[m];
                }

                return o;
            },
            //----------------
            populate: function(other) {

                this.setLastUpdated(new Date());

                this.resources = new Object();
                this.setId(-1);
                //this.setRequestId(-1);

                var props = qx.Class.getProperties(this.constructor);
                for (var prop = 0; prop < props.length; prop++) {
                    //for (var prop in props) {
                    var name = props[prop];
                    try {
                        if (qx.lang.Type.isString(name)) {
                            this.set(name, other.get(name));
                        }
                    } catch (e) {
                        //debug(name + " " + e);
                    }
                }

                this.setId(parseInt(this.getId()));

                for (var res = 1; res <= 4; res++) {

                    this.resources[res] = {
                        step: 0,
                        base: 0,
                        delta: 0,
                        max: 0
                    };

                    if (other.resources.hasOwnProperty(res)) {
                        var thisRes = this.resources[res];
                        var otherRes = other.resources[res];
                        thisRes.step = otherRes.step;
                        thisRes.base = otherRes.base;
                        thisRes.delta = otherRes.delta;
                        thisRes.max = otherRes.max;
                    }
                }

                this.buildQueue = new Array();

                if (other.hasBuildQueue()) {
                    for (var i = 0; i < other.buildQueue.length; i++) {
                        var item = other.buildQueue[i];
                        this.buildQueue[i] = {
                            id: item.id,
                            building: item.building,
                            state: item.state,
                            start: item.start,
                            end: item.end,
                            type: item.type,
                            level: item.level,
                            x: item.x,
                            y: item.y,
                            isPaid: item.isPaid
                        };
                    }
                }

                this.units = new Object();
                if (other.getUnits() != null) {
                    for (var key in other.getUnits()) {
                        var item = (other.getUnits())[key];
                        this.units[key] = {
                            count: item.count,
                            total: item.total,
                            speed: item.speed
                        };
                    }
                }

                this.unitQueue = new Array();
                if (other.hasUnitQueue()) {
                    for (var i = 0; i < other.unitQueue.length; i++) {
                        var item = other.unitQueue[i];
                        this.unitQueue[i] = {
                            id: item.id,
                            type: item.type,
                            count: item.count,
                            batch: item.batch,
                            left: item.left,
                            start: item.start,
                            end: item.end,
                            isPaid: item.isPaid
                        };
                    }
                }

                this.traders = new Object();
                if (other.traders != null) {
                    for (var key in other.traders) {
                        var item = other.traders[key];
                        this.traders[key] = {
                            count: item.count,
                            total: item.total,
                            order: item.order
                        };
                    }
                }


                this.unitOrders = new Array();
                if (other.unitOrders != null) {
                    for (var i = 0; i < other.unitOrders.length; i++) {
                        var item = other.unitOrders[i];
                        this.unitOrders[i] = {
                            id: item.id,
                            type: item.type,
                            state: item.state,
                            start: item.start,
                            end: item.end,
                            city: item.city,
                            cityName: item.cityName,
                            player: item.player,
                            playerName: item.playerName,
                            alliance: item.alliance,
                            allianceName: item.allianceName,
                            units: item.units,
                            isDelayed: item.isDelayed,
                            recurringType: item.recurringType,
                            recurringEndStep: item.recurringEndStep,
                            quickSupport: item.quickSupport
                        };
                    }
                }

                this.supportOrders = new Array();
                if (other.supportOrders != null) {
                    for (var i = 0; i < other.supportOrders.length; i++) {
                        var item = other.supportOrders[i];

                        this.supportOrders[i] = {
                            id: item.id,
                            type: item.type,
                            state: item.state,
                            end: item.end,
                            city: item.city,
                            cityName: item.cityName,
                            player: item.player,
                            playerName: item.playerName,
                            alliance: item.alliance,
                            allianceName: item.allianceName,
                            units: new Array(),
                            quickSupport: item.quickSupport
                        };

                        for (var u = 0; u < item.units.length; u++) {
                            this.supportOrders[i].units[u] = {
                                type: item.units[u].type,
                                count: item.units[u].count
                            };
                        }
                    }
                }

                this.tradeOrders = new Array();
                if (other.tradeOrders != null) {
                    for (var i = 0; i < other.tradeOrders.length; i++) {
                        var item = other.tradeOrders[i];

                        this.tradeOrders[i] = {
                            id: item.id,
                            type: item.type,
                            transport: item.transport,
                            state: item.state,
                            start: item.start,
                            end: item.end,
                            city: item.city,
                            cityName: item.cityName,
                            player: item.player,
                            playerName: item.playerName,
                            alliance: item.alliance,
                            allianceName: item.allianceName,
                            resources: new Array()
                        };
                        for (var u = 0; u < item.resources.length; u++) {
                            this.tradeOrders[i].resources[u] = {
                                type: item.resources[u].type,
                                count: item.resources[u].count
                            };
                        }
                    }
                }

                this.tradeIncoming = new Array();
                if (other.tradeIncoming != null) {
                    for (var i = 0; i < other.tradeIncoming.length; i++) {
                        var item = other.tradeIncoming[i];

                        this.tradeIncoming[i] = {
                            id: item.id,
                            type: item.type,
                            transport: item.transport,
                            state: item.state,
                            start: item.start,
                            end: item.end,
                            city: item.city,
                            cityName: item.cityName,
                            player: item.player,
                            playerName: item.playerName,
                            alliance: item.alliance,
                            allianceName: item.allianceName,
                            resources: new Array()
                        };
                        for (var u = 0; u < item.resources.length; u++) {
                            this.tradeIncoming[i].resources[u] = {
                                type: item.resources[u].type,
                                count: item.resources[u].count
                            };
                        }
                    }
                }
            },
            //----------------

            dispatchResults: function(K) {

                this.setLastUpdated(new Date());

                var bh = "changeVersion",
                    bg = "",
                    bf = "CITY",
                    be = "s",
                    bd = "m",
                    bc = "psr",
                    bb = "at",
                    ba = "bl",
                    Y = "hrl",
                    X = "rs",
                    ch = "to",
                    cg = "v",
                    cf = "iuo",
                    ce = "t",
                    cd = "nr",
                    cc = "changeCity",
                    cb = "r",
                    ca = "singleton",
                    bY = "f",
                    bX = "sh",
                    bo = "q",
                    bp = "btam",
                    bm = "d",
                    bn = "tl",
                    bk = "ts",
                    bl = "webfrontend.data.City",
                    bi = "bc",
                    bj = "pl",
                    bu = "b",
                    bv = "pp",
                    bD = "mtl",
                    bB = "ae",
                    bL = "su",
                    bG = "n",
                    bT = "mpl",
                    bQ = "wl",
                    bx = "btpm",
                    bW = "uq",
                    bV = "_applyId",
                    bU = "ol",
                    bw = "st",
                    bz = "cpr",
                    bA = "i",
                    bC = "fc",
                    bE = "cr",
                    bH = "w",
                    bN = "pd",
                    bS = "bbl",
                    bq = "tf",
                    br = "u",
                    by = "ul",
                    bK = "pwr",
                    bJ = "g",
                    bI = "uo",
                    bP = "et",
                    bO = "uc",
                    bF = "fcs",
                    bM = "ns",
                    W = "hs",
                    bR = "fcq",
                    bs = "ad",
                    bt = "ti";

                var O = webfrontend.res.Main.getInstance();
                var P = webfrontend.data.Server.getInstance();
                if (K.hasOwnProperty(bz)) {
                    //this.setCanPurifyResources(K.cpr);
                }
                if (K.hasOwnProperty(bA)) {
                    //if (this.getRequestId() != K.i) return;
                }
                if (K.hasOwnProperty(bG)) this.setName(K.n);
                if (K.hasOwnProperty(cb) && K.r != null) {
                    for (var i = 0; i < K.r.length; i++) {
                        var M = K.r[i].i;
                        if (!this.resources.hasOwnProperty(M)) this.resources[M] = {
                            step: 0,
                            base: 0,
                            delta: 0,
                            max: 0
                        };
                        if (K.r[i].hasOwnProperty(be)) this.resources[M].step = K.r[i].s;
                        if (K.r[i].hasOwnProperty(bu)) this.resources[M].base = K.r[i].b;
                        if (K.r[i].hasOwnProperty(bm)) this.resources[M].delta = K.r[i].d;
                        if (K.r[i].hasOwnProperty(bd)) this.resources[M].max = K.r[i].m;
                    }
                }
                //if (K.hasOwnProperty(bK)) this.palaceWoodResources = K.pwr;
                //if (K.hasOwnProperty(bc)) this.palaceStoneResources = K.psr;
                if (K.hasOwnProperty(W)) this.setHideoutSize(K.hs);
                if (K.hasOwnProperty(bC)) this.setFoodConsumption(K.fc);
                if (K.hasOwnProperty(bF)) this.setFoodConsumptionSupporter(K.fcs);
                if (K.hasOwnProperty(bR)) this.setFoodConsumptionQueue(K.fcq);
                if (K.hasOwnProperty(bH)) this.setOnWater(K.w != 0);
                if (K.hasOwnProperty(bJ)) this.setGoldProduction(K.g);
                //if (K.hasOwnProperty(bk)) this.setTypeSlots(K.ts);
                var R = 0;
                if (K.hasOwnProperty(bo)) {
                    if (K.q != null && K.q.length > 0) {
                        if (this.buildQueue == null) this.buildQueue = new Array();
                        else qx.lang.Array.removeAll(this.buildQueue);
                        for (var i = 0; i < K.q.length; i++) {
                            var item = K.q[i];
                            this.buildQueue[i] = {
                                id: item.i,
                                building: item.b,
                                state: item.s,
                                type: item.t,
                                l: item.l,
                                x: item.x,
                                y: item.y,
                                isPaid: item.p,
                                warnings: item.w,
                                time: -1
                            };

                            if (K.q[i].l == 1 && K.q[i].s == 1) R++;
                        }
                    } else {
                        if (this.buildQueue != null) delete this.buildQueue;
                    }
                    this.setBuildingsInQueue(R);
                }
                R = 0;
                if (K.hasOwnProperty(bW)) {
                    if (K.uq != null && K.uq.length > 0) {
                        if (this.unitQueue == null) this.unitQueue = new Array();
                        else qx.lang.Array.removeAll(this.unitQueue);
                        for (var i = 0; i < K.uq.length; i++) {
                            this.unitQueue[i] = {
                                id: K.uq[i].i,
                                type: K.uq[i].t,
                                count: K.uq[i].o,
                                batch: K.uq[i].c,
                                left: K.uq[i].l,
                                start: K.uq[i].ss,
                                end: K.uq[i].es,
                                isPaid: K.uq[i].p
                            };
                            R += K.uq[i].l * O.units[K.uq[i].t].uc;
                        }
                    } else {
                        if (this.unitQueue != null) delete this.unitQueue;
                    }
                    this.setUnitsInQueue(R);
                }
                if (K.hasOwnProperty(br)) {
                    if (K.u != null && K.u.length > 0) {
                        if (this.units == null) this.units = new Object();
                        else qx.lang.Object.empty(this.units);
                        for (var i = 0; i < K.u.length; i++) this.units[K.u[i].t] = {
                            count: K.u[i].c,
                            total: K.u[i].tc,
                            speed: K.u[i].s
                        };
                    } else {
                        if (this.units != null) delete this.units;
                    }
                }
                if (K.hasOwnProperty(cf)) {
                    if (K.iuo != null && K.iuo.length > 0) {
                        if (this.incomingUnitOrders == null) this.incomingUnitOrders = new Array();
                        else qx.lang.Array.removeAll(this.incomingUnitOrders);
                        for (var i = 0; i < K.iuo.length; i++) {
                            this.incomingUnitOrders[i] = {
                                id: K.iuo[i].i,
                                type: K.iuo[i].t,
                                state: K.iuo[i].s,
                                end: K.iuo[i].es,
                                city: K.iuo[i].c,
                                cityName: K.iuo[i].cn,
                                player: K.iuo[i].p,
                                playerName: K.iuo[i].pn,
                                alliance: K.iuo[i].a,
                                allianceName: K.iuo[i].an
                            };
                        }
                    } else {
                        if (this.incomingUnitOrders != null) delete this.incomingUnitOrders;
                    }
                }
                if (K.hasOwnProperty(ce)) {
                    if (K.t != null && K.t.length > 0) {
                        if (this.traders == null) this.traders = new Object();
                        else qx.lang.Object.empty(this.traders);
                        for (var i = 0; i < K.t.length; i++) this.traders[K.t[i].t] = {
                            count: K.t[i].c,
                            total: K.t[i].tc,
                            order: 0
                        };
                    } else {
                        if (this.traders != null) delete this.traders;
                    }
                }
                if (K.hasOwnProperty(bI)) {
                    if (K.uo != null && K.uo.length > 0) {
                        if (this.unitOrders == null) this.unitOrders = new Array();
                        else qx.lang.Array.removeAll(this.unitOrders);
                        for (var i = 0; i < K.uo.length; i++) {
                            var U = null;
                            if (K.uo[i].u != null && K.uo[i].u.length > 0) {
                                U = new Array();
                                for (var j = 0; j < K.uo[i].u.length; j++) U.push({
                                    type: K.uo[i].u[j].t,
                                    count: K.uo[i].u[j].c
                                });
                            }
                            this.unitOrders[i] = {
                                id: K.uo[i].i,
                                type: K.uo[i].t,
                                state: K.uo[i].s,
                                start: K.uo[i].ss,
                                end: K.uo[i].es,
                                city: K.uo[i].c,
                                cityName: K.uo[i].cn,
                                player: K.uo[i].p,
                                playerName: K.uo[i].pn,
                                alliance: K.uo[i].a,
                                allianceName: K.uo[i].an,
                                units: U,
                                isDelayed: K.uo[i].d,
                                recurringType: K.uo[i].rt,
                                recurringEndStep: K.uo[i].rs,
                                quickSupport: K.uo[i].q
                            };
                        }
                    } else {
                        if (this.unitOrders != null) delete this.unitOrders;
                    }
                }
                if (K.hasOwnProperty(bL)) {
                    if (K.su != null && K.su.length > 0) {
                        if (this.supportOrders == null) this.supportOrders = new Array();
                        else qx.lang.Array.removeAll(this.supportOrders);
                        for (var i = 0; i < K.su.length; i++) {
                            var U = null;
                            if (K.su[i].u != null && K.su[i].u.length > 0) {
                                U = new Array();
                                for (var j = 0; j < K.su[i].u.length; j++) U.push({
                                    type: K.su[i].u[j].t,
                                    count: K.su[i].u[j].c
                                });
                            }
                            this.supportOrders[i] = {
                                id: K.su[i].i,
                                type: K.su[i].t,
                                state: K.su[i].s,
                                end: K.su[i].es,
                                city: K.su[i].c,
                                cityName: K.su[i].cn,
                                player: K.su[i].p,
                                playerName: K.su[i].pn,
                                alliance: K.su[i].a,
                                allianceName: K.su[i].an,
                                units: U,
                                quickSupport: K.su[i].q
                            };
                        }
                    } else {
                        if (this.supportOrders != null) delete this.supportOrders;
                    }
                }
                if (K.hasOwnProperty(ch)) {
                    if (K.to != null && K.to.length > 0) {
                        if (this.tradeOrders == null) this.tradeOrders = new Array();
                        else qx.lang.Array.removeAll(this.tradeOrders);
                        for (var i = 0; i < K.to.length; i++) {
                            var U = null;
                            var T = 0;
                            if (K.to[i].r != null && K.to[i].r.length > 0) {
                                var O = new Array();
                                for (var j = 0; j < K.to[i].r.length; j++) {
                                    O.push({
                                        type: K.to[i].r[j].t,
                                        count: K.to[i].r[j].c
                                    });
                                    T += K.to[i].r[j].c;
                                }
                                this.traders[K.to[i].tt].order += Math.ceil(T / P.getTradeCapacity(K.to[i].tt));
                            }
                            this.tradeOrders[i] = {
                                id: K.to[i].i,
                                type: K.to[i].t,
                                transport: K.to[i].tt,
                                state: K.to[i].s,
                                start: K.to[i].ss,
                                end: K.to[i].es,
                                city: K.to[i].c,
                                cityName: K.to[i].cn,
                                player: K.to[i].p,
                                playerName: K.to[i].pn,
                                alliance: K.to[i].a,
                                allianceName: K.to[i].an,
                                resources: O
                            };
                        }
                    } else {
                        if (this.tradeOrders != null) delete this.tradeOrders;
                    }
                }
                if (K.hasOwnProperty(bq)) {
                    if (K.tf != null && K.tf.length > 0) {
                        if (this.tradeOffers == null) this.tradeOffers = new Array();
                        else qx.lang.Array.removeAll(this.tradeOffers);
                        for (var i = 0; i < K.tf.length; i++) {
                            this.tradeOffers[i] = {
                                id: K.tf[i].i,
                                transport: K.tf[i].t,
                                deliverTime: K.tf[i].d,
                                price: K.tf[i].p,
                                resourceType: K.tf[i].r,
                                amountTradeUnit: K.tf[i].a
                            };
                        }
                    } else {
                        if (this.tradeOffers != null) delete this.tradeOffers;
                    }
                }
                if (K.hasOwnProperty(bt)) {
                    if (K.ti != null && K.ti.length > 0) {
                        if (this.tradeIncoming == null) this.tradeIncoming = new Array();
                        else qx.lang.Array.removeAll(this.tradeIncoming);
                        for (var i = 0; i < K.ti.length; i++) {
                            if (K.ti[i].r != null && K.ti[i].r.length > 0) {
                                var O = new Array();
                                for (var j = 0; j < K.ti[i].r.length; j++) O.push({
                                    type: K.ti[i].r[j].t,
                                    count: K.ti[i].r[j].c
                                });
                            }
                            this.tradeIncoming[i] = {
                                id: K.ti[i].i,
                                type: K.ti[i].t,
                                transport: K.ti[i].tt,
                                state: K.ti[i].s,
                                start: K.ti[i].ss,
                                end: K.ti[i].es,
                                city: K.ti[i].c,
                                cityName: K.ti[i].cn,
                                player: K.ti[i].p,
                                playerName: K.ti[i].pn,
                                alliance: K.ti[i].a,
                                allianceName: K.ti[i].an,
                                resources: O
                            };
                        }
                    } else {
                        if (this.tradeIncoming != null) delete this.tradeIncoming;
                    }
                }
                if (K.hasOwnProperty(X)) {
                    if (K.rs != null && K.rs.length > 0) {
                        if (this.recruitingSpeed == null) this.recruitingSpeed = new Object();
                        else qx.lang.Object.empty(this.recruitingSpeed);
                        for (var i = 0; i < K.rs.length; i++) this.recruitingSpeed[K.rs[i].t] = {
                            abs: K.rs[i].a,
                            percent: K.rs[i].p
                        };
                    } else {
                        if (this.recruitingSpeed != null) delete this.recruitingSpeed;
                    }
                }
                if (K.hasOwnProperty(by)) this.setUnitLimit(K.ul);
                if (K.hasOwnProperty(bO)) this.setUnitCount(K.uc);
                if (K.hasOwnProperty(ba)) this.setBuildingLimit(K.bl);
                if (K.hasOwnProperty(bU)) this.setOrderLimit(K.ol);
                if (K.hasOwnProperty(bi)) this.setBuildingCount(K.bc);
                if (K.hasOwnProperty(bX)) this.setStrongHold(K.sh);
                if (K.hasOwnProperty(be)) this.setSieged(K.s);
                if (K.hasOwnProperty(bE)) this.setCanRecruit(K.cr);
                if (K.hasOwnProperty(bn)) this.setTownhallLevel(K.tl);
                if (K.hasOwnProperty(bS)) this.setBarracksLevel(K.bbl);
                if (K.hasOwnProperty(bT)) this.setMarketplaceLevel(K.mpl);
                if (K.hasOwnProperty(Y)) this.setHarborLevel(K.hrl);
                //if (K.hasOwnProperty(bD)) this.setMageTowerLevel(K.mtl);
                if (K.hasOwnProperty(bp)) this.setBuildTimeAbsMod(K.btam);
                if (K.hasOwnProperty(bx)) this.setBuildTimePercentMod(K.btpm);
                if (K.hasOwnProperty(bQ)) this.setWallLevel(K.wl);
                if (K.hasOwnProperty(bv)) this.setPlunderProtection(K.pp);
                if (K.hasOwnProperty(cd)) {
                    /*
                     if (this.getReference() != K.nr && this.getRequestId() == K.i) {
                     var Q = webfrontend.data.Player.getInstance();
                     var S = this.getRequestId();
                     if (Q.cities.hasOwnProperty(S)) {
                     Q.cities[S].reference = K.nr;
                     Q.fireDataEvent(bh, Q.getVersion());
                     }
                     }
                     */
                    this.setReference(K.nr);
                }
                if (K.hasOwnProperty(bM)) this.setText(K.ns);
                //if (K.hasOwnProperty(bs)) this.setAutoBuildOptionDefense(K.ad);
                //if (K.hasOwnProperty(bB)) this.setAutoBuildOptionEconomy(K.ae);
                //if (K.hasOwnProperty(bb)) this.setAutoBuildTypeFlags(K.at);
                //if (K.hasOwnProperty(bN)) this.setPalaceDamage(K.pd);
                //if (K.hasOwnProperty(bP)) this.setEnlightenmentTime(K.et);
                //if (K.hasOwnProperty(bw)) this.setShrineType(K.st);
                this.setCanCommand(this.getCanRecruit() && this.getBarracksLevel() > 0 || this.getUnitCount() > 0);
                //if (K.hasOwnProperty(bY)) this.setFaith(K.f);
                //if (K.hasOwnProperty(bj)) this.setPalaceLevel(K.pl);
                if (K.hasOwnProperty("bqs")) this.setBuildingQueueStart(K.bqs);
                if (K.hasOwnProperty("bqe")) this.setBuildingQueueEnd(K.bqe);
                this.calculateBuildingQueueTimes();
                var N = false;
                if (this.getId() != this.getRequestId()) {
                    this.setId(this.getRequestId());
                    N = true;
                }
                if (K.hasOwnProperty(cg)) {
                    if (this.getVersion() != K.v) {
                        this.setVersion(K.v);
                        N = false;
                    }
                } else N = true;

                /*
                 if (N) {
                 var v = this.getVersion();
                 var V = qx.event.Registration;
                 if (V.hasListener(this, bh)) V.fireEvent(this, bh, qx.event.type.Data, [v, v]);
                 }
                 */
                var L = webfrontend.data.TradeMinister.getInstance();

            },

            calculateBuildingQueueTimes: function() {
                if (this.buildQueue == null) return false;
                var cF = false;
                var cA = webfrontend.res.Main.getInstance();
                var cE = new Object();
                var cy = this.getBuildingQueueStart();
                var cB = this.getBuildingQueueEnd();
                for (var i = 0; i < this.buildQueue.length; i++) {
                    if (this.buildQueue[i].BuildingX == -1 || this.buildQueue[i].BuildingY == -1) {
                        if (i > 0) this.buildQueue[i].start = this.buildQueue[i - 1].end;
                        this.buildQueue[i].end = this.buildQueue[i].start;
                        continue;
                    }
                    var cz;
                    var cC = this.buildQueue[i].building;
                    if (cE.hasOwnProperty(cC)) cz = cE[cC];
                    else cz = this.buildQueue[i].l;
                    switch (this.buildQueue[i].state) {
                        case 1:
                            cz++;
                            cE[cC] = cz;
                            this.buildQueue[i].level = cz;
                            break;
                        case 2:
                            cE[cC] = cz - 1;
                            this.buildQueue[i].level = cz - 1;
                            break;
                        case 5:
                            cE[cC] = 0;
                            this.buildQueue[i].level = 0;
                            break;
                    }
                    if ((i == 0) && (cy != 0) && (cB != 0)) {
                        if (this.buildQueue[i].state == 5) {
                            this.buildQueue[i].start = cy;
                            this.buildQueue[i].end = this.buildQueue[i].start + this.urthBuildingGetDemolishTime(this.buildQueue[i].type, cz);
                        } else {
                            this.buildQueue[i].start = cy;
                            this.buildQueue[i].end = cB;
                        }
                    } else {
                        var cD = 0;
                        if (this.buildQueue[i].state == 5) cD = this.urthBuildingGetDemolishTime(this.buildQueue[i].type, cz);
                        else cD = this.urthBuildingGetBuildTime(this.buildQueue[i].type, cz, this.buildQueue[i].state);
                        if (i > 0) {
                            if (this.buildQueue[i - 1].start == 0) this.buildQueue[i].start = 0;
                            else this.buildQueue[i].start = this.buildQueue[i - 1].end;
                        } else this.buildQueue[i].start = 0;
                        this.buildQueue[i].end = this.buildQueue[i].start + cD;
                    }
                    if ((this.buildQueue[i].end - this.buildQueue[i].start) != this.buildQueue[i].time) {
                        cF = true;
                        this.buildQueue[i].time = (this.buildQueue[i].end - this.buildQueue[i].start);
                    }
                }
                return cF;
            },
            //----------------
            getIncomingUnitOrders: function() {
                return this.incomingUnitOrders;
            }, getUnitTypeInfo: function(g) {
                if (this.units != null && this.units.hasOwnProperty(g)) return this.units[g];
                return {
                    count: 0,
                    total: 0,
                    speed: -1
                };
            }, getBuildQueue: function() {
                return this.buildQueue;
            }, hasBuildQueue: function() {
                return this.buildQueue != null;
            }, getUnitQueue: function() {
                return this.unitQueue;
            }, hasUnitQueue: function() {
                return this.unitQueue != null;
            }, getAvailableUnitQueueSpace: function() {
                var e = webfrontend.data.Player.getInstance().getMaxUnitQueueSize();
                if (this.unitQueue != null) {
                    e -= this.unitQueue.length;
                }
                return e;
            }, getUnitOrders: function() {
                return this.unitOrders;
            }, getSupportOrders: function() {
                return this.supportOrders;
            }, getRecruitingSpeed: function() {
                return this.recruitingSpeed;
            }, getIncomingUnitOrders: function() {
                return this.incomingUnitOrders;
            }, getUnits: function() {
                return this.units;
            }, getTraders: function() {
                return this.traders;
            }, getTradeOrders: function() {
                return this.tradeOrders;
            }, getTradeOffers: function() {
                return this.tradeOffers;
            }, getTradeIncoming: function() {
                return this.tradeIncoming;
            }, getOrder: function(d) {
                if (this.unitOrders != null) {
                    for (var i = 0; i < this.unitOrders.length; i++) if (this.unitOrders[i].id == d) return this.unitOrders[i];
                }
                if (this.incomingUnitOrders != null) {
                    for (var i = 0; i < this.incomingUnitOrders.length; i++) if (this.incomingUnitOrders[i].id == d) return this.incomingUnitOrders[i];
                }
                if (this.supportOrders != null) {
                    for (var i = 0; i < this.supportOrders.length; i++) if (this.supportOrders[i].id == d) return this.supportOrders[i];
                }
                return null;
            }, getResourceCount: function(F) {
                if (!this.resources.hasOwnProperty(F)) return 0;
                var G = webfrontend.data.ServerTime.getInstance().getServerStep();
                if (G == 0) return 0;
                var I = G - this.resources[F].step;
                var H = this.resources[F].delta;
                if (F == 4) {
                    H -= this.getFoodConsumption() + this.getFoodConsumptionSupporter();
                }
                var J = I * H + this.resources[F].base;
                J = Math.max(0, Math.min(J, this.resources[F].max));
                return J;
            }, getResourceGrowPerHour: function(a) {
                if (!this.resources.hasOwnProperty(a)) return 0;
                return this.resources[a].delta * webfrontend.data.ServerTime.getInstance().getStepsPerHour();
            }, getResourceMaxStorage: function(f) {
                if (!this.resources.hasOwnProperty(f)) return 0;
                return this.resources[f].max;
            }, getResourceStorageFullTime: function(K) {
                if (!this.resources.hasOwnProperty(K)) return new Date(0);
                var L = this.getResourceGrowPerHour(K);
                if (L <= 0) return new Date(0);
                var M = this.resources[K].step + (this.resources[K].max - this.resources[K].base) / this.resources[K].delta;
                if (webfrontend.data.ServerTime.getInstance().getServerStep() >= M) return new Date(0);
                return webfrontend.data.ServerTime.getInstance().getStepTime(M);
            }, getResourceStorageEmptyTime: function(l, m) {
                if (!this.resources.hasOwnProperty(l)) return new Date(0);
                var n = this.resources[l].step + this.resources[l].base / -(this.resources[l].delta - m);
                if (webfrontend.data.ServerTime.getInstance().getServerStep() >= n) return new Date(0);
                return webfrontend.data.ServerTime.getInstance().getStepTime(n);
            }, getResourceCountTime: function(o, p) {
                if (!this.resources.hasOwnProperty(o)) return new Date(0);
                if (this.resources[o].delta <= 0) return new Date(0);
                var q = this.resources[o].step + (p - this.resources[o].base) / this.resources[o].delta;
                return webfrontend.data.ServerTime.getInstance().getStepTime(q);
            }, countDefenders: function() {
                if (this.units == null || this.units.length == 0) return 0;
                var c = 0;
                for (var b in this.units) c += this.units[b].count;
                return c;
            }, getGoldGrowPerHour: function() {
                return this.getGoldProduction() * webfrontend.data.ServerTime.getInstance().getStepsPerHour();
            }, _applyId: function(O, P) {
                if (O != -1 && P == -1) webfrontend.net.UpdateManager.getInstance().addConsumer(Y, this);
                if (O == -1 && P != -1) {
                    webfrontend.net.UpdateManager.getInstance().removeConsumer(Y);
                    this.setId(-1);
                }
            }, getSupportMoving: function(r) {
                r = r || false;
                var u = [];
                var t = this.getUnitOrders();
                if (t) {
                    var s = t.length;
                    for (var i = 0; i < s; i++) {
                        if (t[i].quickSupport && r) {
                            continue;
                        }
                        if (t[i].type == 4) {
                            if (t[i].state == 1 || t[i].state == 2) {
                                u[u.length] = [t[i], 0];
                            }
                        }
                    }
                }
                var t = this.getSupportOrders();
                if (t) {
                    var s = t.length;
                    for (var i = 0; i < s; i++) {
                        if (t[i].quickSupport && r) {
                            continue;
                        }
                        if (t[i].type == 4 && t[i].state == 1) {
                            u[u.length] = [t[i], 1];
                        }
                    }
                }
                return u;
            },
            //MINE
            buildQueueOcuppied: function() {
                if (this.buildQueue == null || this.buildQueue.length == 0) {
                    return null;
                }
                return (this.buildQueue[this.buildQueue.length - 1].end - webfrontend.data.ServerTime.getInstance().getServerStep());
            },
            unitQueueOcuppied: function() {
                if (this.unitQueue == null || this.unitQueue.length == 0) {
                    return null;
                }
                return (this.unitQueue[this.unitQueue.length - 1].end - webfrontend.data.ServerTime.getInstance().getServerStep());
            },
            setResourceCount: function(res, count) {
                if (!this.resources.hasOwnProperty(res)) {
                    return;
                }

                var serverStep = webfrontend.data.ServerTime.getInstance().getServerStep();
                if (serverStep == 0) return;

                this.resources[res].step = serverStep;
                this.resources[res].base = count;
            },
            getFoodBalance: function() {
                var steps = webfrontend.data.ServerTime.getInstance().getStepsPerHour();
                var foodGrow = Math.floor(this.getResourceGrowPerHour(bos.Const.FOOD) + 0.5);
                var foodCons = Math.round(this.getFoodConsumption() * steps);
                var foodConsQueue = Math.round(this.getFoodConsumptionQueue() * steps);
                var foodConsSupport = Math.round(this.getFoodConsumptionSupporter() * steps);

                var foodBalance = foodGrow - foodCons - foodConsQueue - foodConsSupport;
                return foodBalance;
            },
            getTradeIncomingResources: function(resType) {
                var totalRes = 0;
                if (this.tradeIncoming == null) {
                    return totalRes;
                }
                var now = webfrontend.data.ServerTime.getInstance().getServerStep();
                for (var i = 0; i < this.tradeIncoming.length; i++) {
                    var order = this.tradeIncoming[i];
                    if (order.end >= now) {
                        for (var j = 0; j < order.resources.length; j++) {
                            var r = order.resources[j];
                            if (r.type == resType) {
                                totalRes += r.count;
                            }
                        }
                    }
                }
                return totalRes;
            },
            urthBuildingGetBuildTime: function(P, Q, R, S) {
                if (S == null) S = this.urthBuildingGetTotalSpeedBouns();
                var res = webfrontend.res.Main.getInstance();
                var T = 0;
                if (res.buildings.hasOwnProperty(P) && res.buildings[P].r.hasOwnProperty(Q)) {
                    var U = res.buildings[P].r[Q].t;
                    if (res.buildings[P].im == 0) {
                        U = (U * 100) / S;
                        if (R == 2 || R == 5) U /= 2;
                    }
                    T = Math.floor(Math.max(webfrontend.data.Server.getInstance().getBuildingMinimumBuildTime(), U + 0.5));
                }
                return T;
            },
            urthBuildingGetDemolishTime: function(V, W) {
                var X = this.urthBuildingGetTotalSpeedBouns();
                var Y = 0;
                for (var ba = W; ba > 0; ba--) Y += this.urthBuildingGetBuildTime(V, ba, 5, X);
                return Y;
            },
            urthBuildingGetTotalSpeedBouns: function() {
                //var city = webfrontend.data.City.getInstance();
                var city = this;
                var tech = webfrontend.data.Tech.getInstance();
                var bf = tech.getBonus("constSpeed", webfrontend.data.Tech.research);
                var be = tech.getBonus("constSpeed", webfrontend.data.Tech.shrine);
                var bc = Math.floor(city.getBuildTimePercentMod());
                return bc + bf + be;
            }
        }
    });
});