/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:49
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.Utils");

    qx.Class.define("bos.Utils", {
        type: "singleton",
        extend: qx.core.Object,
        statics: {
            _popupsCount: 0,
            convertCoordinatesToId: function(x, y) {
                var id = parseInt(x, 10) | (parseInt(y, 10) << 16);
                return id;
            },
            convertIdToCoodrinates: function(id) {
                var o = this.convertIdToCoordinatesObject(id);
                return o.xPos + ":" + o.yPos;
            },
            convertIdToCoordinatesObject: function(id) {
                var o = {
                    xPos: (id & 0xFFFF),
                    yPos: (id >> 16),
                }
                o.cont = webfrontend.data.Server.getInstance().getContinentFromCoords(o.xPos, o.yPos);
                return o;
            },
            extractCoordsFromClickableLook: function(pos) {
                if (pos == null)
                    return null;

                if (pos.substring != undefined) {
                    var startPos = pos.indexOf("\">");
                    var endPos = pos.indexOf("</div>");
                    if (startPos < endPos) {
                        var coords = pos.substring(startPos + 2, endPos);
                        var spacePos = pos.indexOf(" ");
                        if (spacePos > 0) {
                            coords = coords.substring(spacePos);
                        }
                        return coords;
                    } else {
                        return pos;
                    }
                }
                return pos;
            },
            translateOrderType: function(type) {
                switch(type) {
                    case 0:
                        return qx.locale.Manager.tr("tnf:unknown");
                    case 1:
                        return qx.locale.Manager.tr("tnf:scout");
                    case 2:
                        return qx.locale.Manager.tr("tnf:plunder");
                    case 3:
                        return qx.locale.Manager.tr("tnf:assult");
                    case 4:
                        return qx.locale.Manager.tr("tnf:support");
                    case 5:
                        return qx.locale.Manager.tr("tnf:siege");
                    case 8:
                        return qx.locale.Manager.tr("tnf:raid");
                    case 9:
                        return qx.locale.Manager.tr("tnf:settle");
                    case 10:
                        return qx.locale.Manager.tr("tnf:boss raid");
                    case -2:
                        return "PvP";
                }
                return "??? " + type;
            },
            translateArray: function(arr) {
                var translated = [];
                for (var i = 0; i < arr.length; i++) {
                    translated.push(tr(arr[i]));
                }
                return translated;
            },
            createCitiesGroupsSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                sb.setToolTipText(tr("filter by: city group"));

                return sb;
            },
            populateCitiesGroupsSelectBox: function(sb) {
                if (sb == null) {
                    return;
                }
                sb.removeAll();
                if (webfrontend.data.Player.getInstance().citygroups != undefined) {
                    var groups = webfrontend.data.Player.getInstance().citygroups;
                    for (var i = 0, iCount = groups.length; i < iCount; i++) {
                        var item = groups[i];
                        sb.add(new qx.ui.form.ListItem(item.n, null, "cg" + item.i));
                    }
                }
            },
            createCitiesTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });

                sb.setToolTipText(tr("filter by: city types"));

                return sb;
            },
            populateCitiesTypesSelectBox: function(sb, onlyMilitary, onlyBosTypes) {
                if (sb == null) {
                    return;
                }

                if (onlyMilitary == undefined) {
                    onlyMilitary = false;
                }

                if (onlyBosTypes == undefined) {
                    onlyBosTypes = false;
                }

                sb.removeAll();

                sb.add(new qx.ui.form.ListItem(tr("all"), null, "A"));

                if (!onlyBosTypes && webfrontend.data.Player.getInstance().citygroups != undefined) {
                    var groups = webfrontend.data.Player.getInstance().citygroups;
                    for (var i = 0, iCount = groups.length; i < iCount; i++) {
                        var item = groups[i];
                        sb.add(new qx.ui.form.ListItem(item.n, null, "cg" + item.i));
                    }
                }

                if (!onlyMilitary) {
                    sb.add(new qx.ui.form.ListItem(tr("building"), null, "B"));
                }
                sb.add(new qx.ui.form.ListItem(tr("castles"), null, "C"));
                sb.add(new qx.ui.form.ListItem(tr("defensive"), null, "D"));

                if (!onlyMilitary) {
                    sb.add(new qx.ui.form.ListItem(tr("warehouses"), null, "W"));
                    sb.add(new qx.ui.form.ListItem(tr("moonstones"), null, "M"));
                    sb.add(new qx.ui.form.ListItem(tr("gold"), null, "G"));
                    var list = bos.Storage.getInstance().getCustomCityTypes();
                    for (var i = 0; i < list.length; i++) {
                        var item = list[i];
                        sb.add(new qx.ui.form.ListItem(item.description, null, item.letter));
                    }
                }
            },
            isCityInCityGroup: function(cityId, groupId) {
                if (webfrontend.data.Player.getInstance().citygroups == undefined) {
                    return false;
                }
                var groups = webfrontend.data.Player.getInstance().citygroups;
                for (var i = 0, iCount = groups.length; i < iCount; i++) {
                    var item = groups[i];
                    if (item.i == groupId) {
                        for (var j = 0, jCount = item.c.length; j < jCount; j++) {
                            if (item.c[j] == cityId) {
                                return true;
                            }
                        }
                        break;
                    }
                }

                return false;
            },
            shouldCityBeIncluded: function(city, selectedCityType, selectedContinent) {

                if (selectedCityType != null && selectedCityType != "A") {
                    if (selectedCityType.indexOf("cg") == 0) {
                        var groupId = parseInt(selectedCityType.substring(2));
                        var cityId = bos.Utils.convertCoordinatesToId(city.xPos, city.yPos);
                        if (bos.Utils.isCityInCityGroup(cityId, groupId) == false) {
                            return false;
                        }
                    } else {
                        var type = bos.CityTypes.getInstance().parseReference(city.reference);
                        switch (selectedCityType) {
                            case 'C':
                                if (!type.isCastle) return false;
                                break;
                            case 'B':
                                if (!type.isBuildInProgress) return false;
                                break;
                            case 'W':
                                if (!type.isWarehouse) return false;
                                break;
                            case 'M':
                                if (!type.hasMoonglowTower) return false;
                                break;
                            case 'G':
                                if (!type.isGold) return false;
                                break;
                            case 'D':
                                if (!type.isDefensive) return false;
                                break;
                            default:
                                if (type.customTypes.indexOf(selectedCityType) < 0) return false;
                                break;
                        }
                    }
                }

                if (selectedContinent != null && selectedContinent != "A") {
                    var cont = webfrontend.data.Server.getInstance().getContinentFromCoords(city.xPos, city.yPos);
                    if (parseInt(selectedContinent) != cont) {
                        return false;
                    }
                }

                return true;
            },
            createCitiesContinentsSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 60,
                    height: 28
                });
                var cities = webfrontend.data.Player.getInstance().cities;

                sb.setToolTipText("Filter by: <b>continents</b>");

                var continents = [];
                for (var cityId in cities) {
                    var city = cities[cityId];

                    var cont = webfrontend.data.Server.getInstance().getContinentFromCoords(city.xPos, city.yPos);
                    continents["c" + cont] = true;
                }

                var list = [];
                for (var key in continents) {
                    if (key.substring != undefined && qx.lang.Type.isString(key)) {
                        var cont = parseInt(key.substring(1), 10);
                        if (!isNaN(cont)) {
                            list.push(cont);
                        }
                    }
                }
                list.sort();

                sb.add(new qx.ui.form.ListItem(tr("all"), null, "A"));
                for (var i = 0; i < list.length; i++) {
                    var cont = list[i];
                    sb.add(new qx.ui.form.ListItem(sprintf("C%02d", cont), null, cont));
                }

                return sb;
            },
            makeClickable: function(msg, color) {
                return qx.lang.String.format("<div style=\"cursor:pointer;color:%1\">%2</div>", [color, msg]);
            },
            makeColorful: function(msg, color) {
                return qx.lang.String.format("<font color=\"%1\">%2</font>", [color, msg]);
            },
            handleError: function(message) {
                //TODO make it nicer than alert box (webfrontend.gui.ConfirmationWidget)
                bos.Utils._alert(message);
            },
            handleWarning: function(message) {
                bos.Utils._alert(message);
            },
            handleInfo: function(message) {
                alert(message);
            },
            _alert: function(message) {
                if (bos.Utils._popupsCount < bos.Const.MAX_POPUPS) {
                    alert(message);
                    bos.Utils._popupsCount++;
                }
            },
            displayLongText: function(body) {
                var dialog = new webfrontend.gui.ConfirmationWidget();
                //dialog.setZIndex(100000);
                var bgImg = new qx.ui.basic.Image("webfrontend/ui/bgr_popup_survey.gif");
                dialog.dialogBackground._add(bgImg, {left: 0, top: 0});
                var shrStr = new qx.ui.form.TextArea(body).set({allowGrowY: true, tabIndex: 303});
                dialog.dialogBackground._add(shrStr, {left: 30, top: 50, width: 90, height: 45});
                shrStr.selectAllText();
                var okButton = new qx.ui.form.Button("OK");
                okButton.setWidth(120);
                okButton.addListener("click", function(){dialog.disable();}, false);
                dialog.dialogBackground._add(okButton, {left: 445, top: 190});
                qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                dialog.show();
            },
            inputLongText: function(callback) {
                var dialog = new webfrontend.gui.ConfirmationWidget();
                //dialog.setZIndex(100000);
                var bgImg = new qx.ui.basic.Image("webfrontend/ui/bgr_popup_survey.gif");
                dialog.dialogBackground._add(bgImg, {left: 0, top: 0});
                var shrStr = new qx.ui.form.TextArea("").set({allowGrowY: true, tabIndex: 303});
                dialog.dialogBackground._add(shrStr, {left: 30, top: 50, width: 90, height: 45});
                shrStr.selectAllText();
                var okButton = new qx.ui.form.Button("OK");
                okButton.setWidth(120);
                okButton.addListener("click", function(){dialog.disable(); callback(shrStr.getValue()) }, false);
                dialog.dialogBackground._add(okButton, {left: 445, top: 190});
                qx.core.Init.getApplication().getDesktop().add(dialog, {left: 0, right: 0, top: 0, bottom: 0});
                dialog.show();
            },
            getDistance: function(x1, y1, x2, y2) {
                var diffX = Math.abs(x1 - x2);
                var diffY = Math.abs(y1 - y2);
                return Math.sqrt(diffX * diffX + diffY * diffY);
            },
            getDistanceUsingIds: function(id1, id2) {
                var c1 = this.convertIdToCoodrinates(id1);
                var c2 = this.convertIdToCoodrinates(id2);
                return this.getDistance(c1.xPos, c1.yPos, c2.xPos, c2.yPos);
            },
            summaryWidget: function() {
                return summaryWidget;
            }
        }
    });
});