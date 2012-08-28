/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:51
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.BatchResourcesFiller");

    qx.Class.define("bos.CityTypes", {
        type: "singleton",
        extend: qx.core.Object,
        construct: function() {
            //nothing to do
        },
        members: {
            parseReference: function(ref) {
                var result = {
                    isCastle: false,
                    isBuildInProgress: false,
                    isWarehouse: false,
                    hasMoonglowTower: false,
                    isGold: false,
                    isDefensive: false,
                    customTypes: new qx.data.Array([])
                };

                if (ref == null) {
                    return result;
                }

                var insideOptions = false;
                for (var i = 0; i < ref.length; i++) {
                    var c = ref.charAt(i);
                    if (c == '*') {
                        insideOptions = !insideOptions;
                    } else if (insideOptions) {
                        switch (c) {
                            case 'C':
                                result.isCastle = true;
                                break;
                            case 'B':
                                result.isBuildInProgress = true;
                                break;
                            case 'W':
                                result.isWarehouse = true;
                                break;
                            case 'M':
                                result.hasMoonglowTower = true;
                                break;
                            case 'G':
                                result.isGold = true;
                                break;
                            case 'D':
                                result.isDefensive = true;
                                break;
                            default:
                                result.customTypes.push(c);
                                break;
                        }
                    }
                }

                return result;

            },
            getCastles: function() {
                return this._getCitiesByType("isCastle");
            },
            getCitiesWithMoonglowTower: function() {
                return this._getCitiesByType("hasMoonglowTower");
            },
            getCitiesBuildInProgress: function() {
                return this._getCitiesByType("isBuildInProgress");
            }, _getCitiesByType: function(typeName) {
                var list = [];

                var cities = webfrontend.data.Player.getInstance().cities;
                for (var cityId in cities) {
                    var city = cities[cityId];

                    var types = this.parseReference(city.reference);
                    if (types[typeName]) {
                        list.push(cityId);
                    }
                }

                return list;
            },
            isReservedLetter: function(letter) {
                switch (letter) {
                    case 'A':
                    case 'C':
                    case 'B':
                    case 'W':
                    case 'M':
                    case 'G':
                    case 'D':
                        return true;
                }
                return false;
            }
        }
    });
});