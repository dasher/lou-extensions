/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:10
 */
(function (window, undefined) {
    qx.Class.define("bos.Storage", {
        type: "singleton",
        extend: qx.core.Object,
        construct: function() {
            try {
                qx.Bootstrap.setDisplayName(this, "bos.Storageoooo");
                this._player = webfrontend.data.Player.getInstance().getId();

                var options = this._loadOptions();
                if (options != null) {
                    if (options.optionsFormatVersion != bos.Storage.OPTIONS_FORMAT_VERSION) {
                        bos.Utils.handleError("This script version requires options to be in new format. Default values has been applied. Please set options again. Sorry for inconvenience");
                        this.deleteAllSavedData();
                        this.saveOptions(); //force saving defaults
                    } else {
                        this._applyOptions(options);
                    }
                }

                var saved = this.getSavedCities();
                this._savedCities = [];
                for (var i = 0; i < saved.length; i++) {
                    var cityId = saved[i];

                    this._savedCities["c" + cityId] = cityId;
                }
            } catch (e) {
                bos.Utils.handleError("Error loading LoU BOS settings: " + e + ".\nIt may mean that you browser has disabled local storage.\nTo turn local storage on - in Firefox please open page 'about:config' and make sure that in 'dom.storage.enabled' you have true value. For Firefox please make sure that you have cookies enabled");
            }
        },
        statics: {
            OPTIONS_FORMAT_VERSION: 0
        },
        properties: {
            persistingCitiesEnabled: {
                init: true
            },
            loadPersistedCitiesAtStart: {
                init: true
            },
            optionsFormatVersion: {
                init: 0
            },
            loadTableSettingsAtStart: {
                init: false
            },
            citiesTableSettings: {
                init: null
            },
            militaryTableSettings: {
                init: null
            },
            moonstonesTableSettings: {
                init: null
            },
            moonglowTowers: {
                init: []
            },
            customCityTypes: {
                init: []
            },
            summaryPosition: {
                init: null
            },
            tradeRoutesVersion: {
                init: 0,
                event: "changeTradeRoutesVersion"
            },
            recruitmentOrdersVersion: {
                init: 0,
                event: "changeRecruitmentOrdersVersion"
            },
            intelligenceVersion: {
                init: 0,
                event: "changeIntelligenceVersion"
            },
            customCityTypesVersion: {
                init: 0,
                event: "changeCustomCityTypesVersion"
            },
            tweakReportAtStart: {
                init: false
            },
            tweakChatAtStart: {
                init: false
            },
            startRefreshingResourcesAtStart: {
                init: false
            }
        }, members: {
            _savedCities: null,
            _citiesWithMooglowTower: null,
            _tradeRoutes: null,
            _recruitmentOrders: null,
            _intelligence: null,
            _player: "",
            _getValue: function(key, namespace) {
                var result = GM_getValue(this._calculateKey(key, namespace, true));
                if (result == null) {
                    result = GM_getValue(this._calculateKey(key, namespace, false));
                }
                return result;
            },
            _setValue: function(key, value, namespace) {
                GM_setValue(this._calculateKey(key, namespace, true), value);
            },
            _calculateKey: function(key, namespace, withPlayer) {
                if (namespace == undefined) {
                    namespace = "Storage";
                }
                if (withPlayer == undefined) {
                    withPlayer = true;
                }
                if (withPlayer) {
                    return "bos." + this._player + "." + namespace + "." + key;
                } else {
                    return "bos." + namespace + "." + key;
                }
            },
            _loadOptions: function() {
                var json = this._getValue("options");
                var options = null;
                if (json != null) {
                    options = qx.util.Json.parse(json);
                }
                return options;
            },
            _applyOptions: function(options) {
                this.setOptionsFormatVersion(options.optionsFormatVersion);
                this.setPersistingCitiesEnabled(options.persistingCitiesEnabled);
                this.setLoadPersistedCitiesAtStart(options.loadPersistedCitiesAtStart);
                this.setCitiesTableSettings(options.citiesTableSettings);
                this.setMilitaryTableSettings(options.militaryTableSettings);
                if (options.moonstonesTableSettings != undefined) {
                    this.setMoonstonesTableSettings(options.moonstonesTableSettings);
                }
                if (options.loadTableSettingsAtStart != undefined) {
                    this.setLoadTableSettingsAtStart(options.loadTableSettingsAtStart);
                }
                if (options.moonglowTowers != undefined) {
                    this.setMoonglowTowers(options.moonglowTowers);
                }
                if (options.customCityTypes != undefined) {
                    this.setCustomCityTypes(options.customCityTypes);
                }
                if (options.summaryPosition != undefined) {
                    this.setSummaryPosition(options.summaryPosition);
                }
                if (options.tweakReportAtStart != undefined) {
                    this.setTweakReportAtStart(options.tweakReportAtStart);
                }
                if (options.tweakChatAtStart != undefined) {
                    this.setTweakChatAtStart(options.tweakChatAtStart);
                }
                if (options.startRefreshingResourcesAtStart != undefined) {
                    this.setStartRefreshingResourcesAtStart(options.startRefreshingResourcesAtStart);
                }
            },
            saveCity: function(city) {
                var simple = city.toSimpleObject();
                var json = qx.util.Json.stringify(simple);
                this._setValue(city.getId(), json, "City");

                this._savedCities["c" + city.getId()] = city.getId();
                this._saveSavedCities();
            },
            loadCity: function(cityId) {
                var json = this._getValue(cityId, "City");
                if (json == null)
                    return null;
                var parsed = qx.util.Json.parse(json);
                var city = bos.City.createFromSimpleObject(parsed);
                return city;
            },
            _calculateCityKey: function(cityId) {
                return "bos.City." + cityId;
            },
            getSavedCities: function() {
                var s = this._getValue("index", "City");
                var cities = [];
                if (s != null) {
                    cities = qx.util.Json.parse(s);
                }
                return cities;
            },
            _saveSavedCities: function() {
                var cities = [];
                for (var key in this._savedCities) {
                    var cityId = parseInt(key.substring(1));
                    if (!isNaN(cityId)) {
                        cityId = parseInt(this._savedCities[key]);
                        if (!isNaN(cityId)) {
                            cities.push(cityId);
                        }
                    }
                }

                var json = qx.util.Json.stringify(cities);
                this._setValue("index", json, "City");
            },
            deleteAllSavedData: function() {
                var saved = this.getSavedCities();
                for (var i = 0; i < saved.length; i++) {
                    var cityId = saved[i];
                    GM_deleteValue(this._calculateKey(cityId, "City"));
                }
                GM_deleteValue(this._calculateKey("index", "City"));

                this._savedCities = [];
            },
            saveOptions: function() {
                var o = {
                    persistingCitiesEnabled: this.getPersistingCitiesEnabled(),
                    loadPersistedCitiesAtStart: this.getLoadPersistedCitiesAtStart(),
                    tweakChatAtStart: this.getTweakChatAtStart(),
                    tweakReportAtStart: this.getTweakReportAtStart(),
                    startRefreshingResourcesAtStart: this.getStartRefreshingResourcesAtStart(),

                    loadTableSettingsAtStart: this.getLoadTableSettingsAtStart(),
                    citiesTableSettings: this.getCitiesTableSettings(),
                    militaryTableSettings: this.getMilitaryTableSettings(),
                    moonstonesTableSettings: this.getMoonstonesTableSettings(),
                    summaryPosition: this.getSummaryPosition(),

                    moonglowTowers: this.getMoonglowTowers(),
                    customCityTypes: this.getCustomCityTypes(),
                    optionsFormatVersion: bos.Storage.OPTIONS_FORMAT_VERSION
                }
                var json = qx.util.Json.stringify(o);
                this._setValue("options", json);

            },
            setTableSettings: function(settings, tableName) {
                //not the best way to do it
                switch (tableName) {
                    case "cities":
                        this.setCitiesTableSettings(settings);
                        break;
                    case "military":
                        this.setMilitaryTableSettings(settings);
                        break;
                    case "moonstones":
                        this.setMoonstonesTableSettings(settings);
                        break;
                    default:
                        bos.Utils.handleError("Unknown table name " + tableName);
                        break;
                }
            },
            addMoonglowTower: function(cityId, towerId) {
                for (var i = 0; i < this.getMoonglowTowers().length; i++) {
                    var o = this.getMoonglowTowers()[i];
                    if (o.cityId == cityId) {
                        o.towerId = towerId;
                        this.saveOptions();
                        return;
                    }
                }
                var t = {
                    cityId: cityId,
                    towerId: towerId
                };
                this.getMoonglowTowers().push(t);
                this._citiesWithMooglowTower = null;
                this.saveOptions();
            },
            removeMoonglowTower: function(cityId) {
                for (var i = 0; i < this.getMoonglowTowers().length; i++) {
                    var o = this.getMoonglowTowers()[i];
                    if (o.cityId == cityId) {
                        this.getMoonglowTowers().splice(i, 1);
                        this._citiesWithMooglowTower = null;
                        this.saveOptions();
                        return;
                    }
                }
            },
            findMoonglowTowerId: function(cityId) {
                var withMoonglow = this.getCitiesWithMooglowTower();
                if (withMoonglow["c" + cityId] == undefined) {
                    return -1;
                } else {
                    return withMoonglow["c" + cityId];
                }
                /*
                 for (var i = 0; i < this.getMoonglowTowers().length; i++) {
                 var o = this.getMoonglowTowers()[i];
                 if (o.cityId == cityId) {
                 return o.towerId;
                 }
                 }
                 return -1;
                 */
            },
            getCitiesWithMooglowTower: function() {
                if (this._citiesWithMooglowTower == null) {
                    this._citiesWithMooglowTower = [];
                    for (var i = 0; i < this.getMoonglowTowers().length; i++) {
                        var o = this.getMoonglowTowers()[i];
                        this._citiesWithMooglowTower["c" + o.cityId] = o.towerId;
                    }
                }
                return this._citiesWithMooglowTower;
            },
            addCustomCityType: function(letter, description) {
                for (var i = 0; i < this.getCustomCityTypes().length; i++) {
                    var o = this.getCustomCityTypes()[i];
                    if (o.letter == letter) {
                        o.description = description;
                        return;
                    }
                }
                var t = {
                    letter: letter,
                    description: description
                };
                this.getCustomCityTypes().push(t);

                this.setCustomCityTypesVersion(this.getCustomCityTypesVersion() + 1);
            },
            removeCustomCityType: function(letter) {
                for (var i = 0; i < this.getCustomCityTypes().length; i++) {
                    var o = this.getCustomCityTypes()[i];
                    if (o.letter == letter) {
                        this.getCustomCityTypes().splice(i, 1);
                        return;
                    }
                }

                this.setCustomCityTypesVersion(this.getCustomCityTypesVersion() + 1);
            },
            loadTradeRoutes: function() {
                this._tradeRoutes = [];
                var json = this._getValue("tradeRoutes");
                if (json != null) {
                    this._tradeRoutes = qx.util.Json.parse(json);
                }
                return this._tradeRoutes;
            },
            getTradeRoutes: function() {
                if (this._tradeRoutes == null) {
                    this.loadTradeRoutes();
                }
                return this._tradeRoutes;
            },
            saveTradeRoutes: function() {
                var json = qx.util.Json.stringify(this._tradeRoutes);
                this._setValue("tradeRoutes", json);
            },
            addTradeRoute: function(route) {
                route.id = this._tradeRoutes.length + 1;
                this._tradeRoutes.push(route);
                this.setTradeRoutesVersion(this.getTradeRoutesVersion() + 1);
                this.saveTradeRoutes();
                return route.id;
            },
            removeTradeRoute: function(routeId) {
                for (var i = 0; i < this._tradeRoutes.length; i++) {
                    var r = this._tradeRoutes[i];
                    if (r.id == routeId) {
                        this._tradeRoutes.splice(i, 1);
                        this.setTradeRoutesVersion(this.getTradeRoutesVersion() + 1);
                        this.saveTradeRoutes();
                        return true;
                    }
                }
                return false;
            },
            findTradeRouteById: function(routeId) {
                for (var i = 0; i < this._tradeRoutes.length; i++) {
                    var r = this._tradeRoutes[i];
                    if (r.id == routeId) {
                        return r;
                    }
                }
                return null;
            },
            importTradeRoutes: function(json) {
                try {
                    var required = ["from", "to", "wood", "stone", "iron", "food", "transport", "group"];
                    var orders = qx.util.Json.parse(json);
                    for (var i = 0; i < orders.length; i++) {
                        var order = orders[i];
                        for (var j = 0; j < required.length; j++) {
                            var prop = required[j];
                            if (!order.hasOwnProperty(prop)) {
                                bos.Utils.handleError("Element " + i + " is missing required property " + prop);
                                dumpObject(order);
                                return;
                            }
                        }
                    }

                    this._tradeRoutes = orders;
                    this.saveTradeRoutes();
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },
            loadRecruitmentOrders: function() {
                this._recruitmentOrders = [];
                var json = this._getValue("recruitmentOrders");
                if (json != null) {
                    this._recruitmentOrders = qx.util.Json.parse(json);
                }
                return this._recruitmentOrders;
            },
            getRecruitmentOrders: function() {
                if (this._recruitmentOrders == null) {
                    this.loadRecruitmentOrders();
                }
                return this._recruitmentOrders;
            },
            saveRecruitmentOrders: function() {
                var json = qx.util.Json.stringify(this._recruitmentOrders);
                this._setValue("recruitmentOrders", json);
            },
            addRecruitmentOrder: function(order) {
                this._recruitmentOrders.push(order);
                this.setRecruitmentOrdersVersion(this.getRecruitmentOrdersVersion() + 1);
                this.saveRecruitmentOrders();
            },
            removeRecruitmentOrder: function(cityId) {
                for (var i = 0; i < this._recruitmentOrders.length; i++) {
                    var o = this._recruitmentOrders[i];
                    if (o.cityId == cityId) {
                        this._recruitmentOrders.splice(i, 1);
                        this.setRecruitmentOrdersVersion(this.getRecruitmentOrdersVersion() + 1);
                        this.saveRecruitmentOrders();
                        return true;
                    }
                }
                return false;
            },
            findRecruitmentOrderById: function(cityId) {
                for (var i = 0; i < this.getRecruitmentOrders().length; i++) {
                    var o = this.getRecruitmentOrders()[i];
                    if (o.cityId == cityId) {
                        return o;
                    }
                }
                return null;
            },
            importRecruitmentOrders: function(json) {
                try {
                    var required = ["cityId", "units"];
                    var orders = qx.util.Json.parse(json);
                    for (var i = 0; i < orders.length; i++) {
                        var order = orders[i];
                        for (var j = 0; j < required.length; j++) {
                            var prop = required[j];
                            if (!order.hasOwnProperty(prop)) {
                                bos.Utils.handleError("Element " + i + " is missing required property " + prop);
                                dumpObject(order);
                                return;
                            }
                        }
                    }

                    this._recruitmentOrders = orders;
                    this.saveRecruitmentOrders();
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },

            loadIntelligence: function() {
                this._intelligence = [];
                var json = this._getValue("intelligence");
                if (json != null) {
                    this._intelligence = qx.util.Json.parse(json);
                }
                return this._intelligence;
            },
            getIntelligence: function() {
                if (this._intelligence == null) {
                    this.loadIntelligence();
                }
                return this._intelligence;
            },
            saveIntelligence: function() {
                var json = qx.util.Json.stringify(this._intelligence);
                this._setValue("intelligence", json);
            },
            addIntelligence: function(intel) {
                this.getIntelligence().push(intel);
                this.setIntelligenceVersion(this.getIntelligenceVersion() + 1);
                this.saveIntelligence();
            },
            removeIntelligence: function(cityId) {
                for (var i = 0; i < this._intelligence.length; i++) {
                    var o = this._intelligence[i];
                    if (o.cityId == cityId) {
                        this._intelligence.splice(i, 1);
                        this.setIntelligenceVersion(this.getIntelligenceVersion() + 1);
                        this.saveIntelligence();
                        return true;
                    }
                }
                return false;
            },
            findIntelligenceById: function(cityId) {
                for (var i = 0; i < this.getIntelligence().length; i++) {
                    var o = this.getIntelligence()[i];
                    if (o.cityId == cityId) {
                        return o;
                    }
                }
                return null;
            },
            mergeIntelligence: function(json) {
                try {
                    var required = ["cityId", "name", "isLandlocked", "hasCastle", "owner", "description", "lastModified", "modifiedBy"];
                    var intelligence = qx.util.Json.parse(json);
                    for (var i = 0; i < intelligence.length; i++) {
                        var intel = intelligence[i];
                        for (var j = 0; j < required.length; j++) {
                            var prop = required[j];
                            if (!intel.hasOwnProperty(prop)) {
                                bos.Utils.handleError("Element " + i + " is missing required property " + prop);
                                dumpObject(intel);
                                return;
                            }
                        }
                    }

                    for (var i = 0; i < intelligence.length; i++) {
                        var intel = intelligence[i];
                        var old = this.findIntelligenceById(intel.cityId);
                        if (old == null) {
                            this.addIntelligence(intel);
                        } else if (intel.lastModified > old.lastModified) {
                            if (confirm("Would you like to replace intel for '" + old.name + "' - '" + old.description + "' with '" + intel.description + "'?")) {
                                for (var j = 0; j < this.getIntelligence().length; j++) {
                                    var o = this.getIntelligence()[j];
                                    if (o.cityId == intel.cityId) {
                                        this.getIntelligence()[j] = intel;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    this.saveIntelligence();
                    this.setIntelligenceVersion(this.getIntelligenceVersion() + 1);
                } catch (e) {
                    bos.Utils.handleError(e);
                }
            },
            getPurifyOptions: function() {
                var json = this._getValue("purifyOptions");
                var options;
                if (json != null) {
                    options = qx.util.Json.parse(json);
                } else {
                    options = {
                        includeCastles: false,
                        useRecruitmentData: false,
                        ministerBuildPresent: webfrontend.data.Player.getInstance().getMinisterTradePresent()
                    };

                    if (options.ministerBuildPresent) {
                        options.minimumResLevels = [0, 20, 20, 20, 20];
                    } else {
                        options.minimumResLevels = [0, 50000, 50000, 50000, 50000];
                    }
                }
                return options;
            },
            savePurifyOptions: function(options) {
                options.ministerBuildPresent = webfrontend.data.Player.getInstance().getMinisterTradePresent();
                var json = qx.util.Json.stringify(options);
                this._setValue("purifyOptions", json);
            }
        }
    });
})(window);