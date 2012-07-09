/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:00
 */
GM_log(" - loading Main.js");

var a;
var summaryWidget = null;
var reportsTweaked = false;

//window.setTimeout(bosCheckIfLoaded, 1000);
loader.addFinishHandler(bosCheckIfLoaded);

function bosCheckIfLoaded() {
    console.log("[bosCheckIfLoaded] Try loading BoS");
    if (typeof(qx) != "undefined") {
        a = qx.core.Init.getApplication();
        if (a && a.chat && a.cityInfoView && a.title.reportButton) {
            console.log("[bosCheckIfLoaded] Signal game started to bos.Tweak");
            bos.Tweaks.getInstance().gameStarted();
        } else {
            console.log("[bosCheckIfLoaded] Retrying in a second because application is not yet ready");
            window.setTimeout(bosCheckIfLoaded, 1000);
        }
    } else {
        window.setTimeout(bosCheckIfLoaded, 1000);
        console.log("[bosCheckIfLoaded] Retrying in a second because qx is not yet defined");
    }
}

function getSummaryWidget() {
    if (summaryWidget == null) {
        summaryWidget = new bos.gui.SummaryWidget();
        if (bos.Storage.getInstance().getLoadPersistedCitiesAtStart()) {
            summaryWidget.loadPersistedCities();
        }
        if (bos.Storage.getInstance().getLoadTableSettingsAtStart()) {
            summaryWidget.loadPersistedTableSettings();
        }
    }
    return summaryWidget;
}

function handleError(dp) {
    try {
        var dq = dp.toString();
        var cx = " ";
        if (dp.hasOwnProperty("fileName")) dq += cx + dp.fileName;
        if (dp.getUri != null) dq += cx + dp.getUri();
        if (dp.hasOwnProperty("lineNumber")) dq += cx + dp.lineNumber;
        if (dp.getLineNumber != null) dq += cx + dp.getLineNumber();
        if (dp.hasOwnProperty("stack")) dq += cx + dp.stack;

        dq = qx.util.Json.stringify(dq);

        var msg = "{error:" + dq + "}";

        if (console.log != undefined) {
            console.log(msg);
        } else {
            alert(msg);
        }
    } catch (e) {
        alert("Error in error handler " + e);
    }
}

function selectReports(startsWith) {
    var rep = a.title.report;

    var select = startsWith != null;

    var parts;

    if (startsWith != null) {
        parts = startsWith.split("|");
    } else {
        parts = [];
        parts.push(null);
    }

    rep.headerData.iterateCachedRows(_changeCheckState, {
        s:select,
        parts:parts
    });

    rep.headerData.fireDataEvent("dataChanged", {
        firstColumn:0,
        lastColumn:0,
        firstRow:0,
        lastRow:rep.headerData.getRowCount()
    });
    rep._updateButtonState();
}

function _changeCheckState(D, E) {
    var rep = a.title.report;
    for (var key in this.parts) {
        var part = this.parts[key];
        if (part == null || part == "" || (E.s != null && E.s.indexOf(part) > 0)) {
            E.c = this.s;
            rep.headerData.setSelected(E.i, this.s);
            break;
        }
    }
}

function exportSelectedReports() {
    var rep = a.title.report;
    var ids = rep.headerData.getSelectedIds();

    if (ids.length == 0 || (ids.length == 1 && ids[0] == 0)) {
        return;
    }

    if (ids.length > 5) {
        if (locale == "de") {
            bos.Utils.handleWarning("Bitte wähle nicht mehr als 5 Berichte aus");
        }
        else {
            bos.Utils.handleWarning("Please do not select more than 5 reports");
        }

        return;
    }

    var counter = 1;
    for (key in ids) {
        var id = ids[key];
        bos.net.CommandManager.getInstance().sendCommand("GetReport", {
            id:id
        }, this, parseReport, counter);
        counter++;
    }
}

function parseReport(r, data, eh) {

    if (r == false || data == null) return;

    var date = new Date(data.h.d);
    var header = data.h.l + " on " + qx.util.format.DateFormat.getDateTimeInstance().format(date) + ".";

    var result = new Array();
    result["short"] = header;
    result["onlyDef"] = header;
    result["csv"] = "TODO";

    if (data.a != null && data.a.length > 0) {

        var totalAtt = [];
        var totalDef = [];

        for (var i = 0; i < data.a.length; i++) {
            var army = data.a[i];

            for (var key in army.u) {
                var total = army.r == bos.Const.ORDER_ATTACK ? totalAtt : totalDef;

                var unit = army.u[key];
                var totalKey = unit.t;
                if (total[totalKey] == undefined) {
                    total[totalKey] = {o:0, l:0, t:unit.t};
                }

                total[totalKey].o += unit.o;
                total[totalKey].l += unit.l;
            }
        }

        result["short"] += "\nAttackers: " + formatUnits(totalAtt) + ".";

        var tmp = "\nTotal Defenders: " + formatUnits(totalDef) + ".";
        result["onlyDef"] += tmp;
        result["short"] += tmp;
    }

    result["full"] = result["short"];
    if (data.rs != null && data.rs.length > 0) {
        result["full"] += "\nRes: ";
        for (var i = 0; i < data.rs.length; i++) {
            if (i > 0) {
                result["full"] += ", ";
            }
            result["full"] += formatResource(data.rs[i]);
        }
        result["full"] += ".";
    }

    if (data.r != null && data.r.length > 0) {
        result["full"] += "\nRes looted: ";
        for (var i = 0; i < data.r.length; i++) {
            if (i > 0) {
                result["full"] += ", ";
            }
            result["full"] += formatResource(data.r[i]);
        }
        result["full"] += ".";
    }

    if (data.cp != undefined && data.cpo != undefined && data.cp >= 0) {
        result["full"] += "\nPower of claim: ";
        if (data.cp > data.cpo) {
            result["full"] += "increased from " + data.cpo + "% to " + data.cp + "%";
        } else if (data.cp == data.cpo) {
            result["full"] += "stays at " + data.cp + "%";
        } else {
            result["full"] += "decreased from " + data.cpo + "% to " + data.cp + "%";
        }
    }

    if (data.b != undefined && data.b.m != undefined && data.b.n != undefined) {
        result["full"] += "\nMorale: " + Math.round(100 * (data.b.m - 1)) + "%";
        result["full"] += "\nAttack reduction: " + Math.round(100 * (data.b.n - 1)) + "%";
    }

    if (data.s != null && data.s.length > 0) {
        result["full"] += "\nBuildings: ";
        for (var i = 0; i < data.s.length; i++) {
            if (i > 0) {
                result["full"] += ", ";
            }
            result["full"] += formatBuilding(data.s[i]);
        }
        result["full"] += ".";
    }

    showReport(result);
}

function formatResource(rs) {
    if (rs.t == bos.Const.GOLD) {
        return rs.v + " " + "gold";
    } else {
        var res = webfrontend.res.Main.getInstance();
        var resource = res.resources[rs.t];
        return rs.v + " " + resource.n.toLowerCase();
    }
}

function formatBuilding(s) {
    var res = webfrontend.res.Main.getInstance();
    var building = res.buildings[s.t];

    var res = "";
    if (s.a > 1) {
        res += s.a + " x ";
    }
    res += "lvl " + s.l + " " + building.dn.toLowerCase();
    return res;
}

function showReport(report) {
    var dialog = shareReportWindow();
    dialog.show(report);
    qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
    dialog.show();
}

function shareReportWindow() {
    var dialog = new webfrontend.gui.ConfirmationWidget();

    dialog.show = function (report) {

        var bgImg = new qx.ui.basic.Image("webfrontend/ui/bgr_popup_survey.gif");
        this.dialogBackground._add(bgImg, {left:0, top:0});

        var la = new qx.ui.basic.Label("Exported report");
        la.setFont("font_subheadline_sidewindow");
        la.setTextColor("text-gold");
        la.setTextAlign("left");
        this.dialogBackground._add(la, {left:17, top:5});


        var shrStr = new qx.ui.form.TextArea(report["short"]).set({allowGrowY:true, tabIndex:303});
        this.dialogBackground._add(shrStr, {left:30, top:50, width:90, height:45});
        shrStr.selectAllText();

        var shwStr = function (type) {
            shrStr.setValue(report[type]);
            shrStr.selectAllText();
        }

        var top = 175;
        var btnShort = new qx.ui.form.Button(locale == "de" ? "Kurz" : "Short").set({width:125, appearance:"button-text-small"});
        btnShort.addListener("click", function () {
            shwStr("short");
        }, false);
        this.dialogBackground._add(btnShort, {left:30, top:top});

        var btnOnlyDef = new qx.ui.form.Button(locale == "de" ? "Nur Verteidiger" : "Only defender").set({width:125, appearance:"button-text-small"});
        btnOnlyDef.addListener("click", function () {
            shwStr("onlyDef");
        }, false);
        this.dialogBackground._add(btnOnlyDef, {left:160, top:top});

        var btnFull = new qx.ui.form.Button(locale == "de" ? "Komplett" : "Full").set({width:125, appearance:"button-text-small"});
        btnFull.addListener("click", function () {
            shwStr("full");
        }, false);
        this.dialogBackground._add(btnFull, {left:290, top:top});


        var okButton = new qx.ui.form.Button("OK");
        okButton.setWidth(120);
        okButton.addListener("click", function () {
            dialog.disable();
        }, false);
        this.dialogBackground._add(okButton, {left:445, top:190});
    }
    return dialog;
}

function formatUnits(units) {
    var s = "";

    for (var key in units) {
        if (key == undefined) continue;

        var unit = units[key];

        if (unit == undefined || unit.o == undefined || unit.t == undefined || unit.l == undefined) {
            continue;
        }

        if (s != "") {
            s += ", ";
        }

        //var lost = unit.o - unit.l;
        //s += unit.o + "-" + lost + "=" + unit.l + " ";
        /* old format */
        s += unit.o + " ";
        if (unit.l != unit.o) {
            s += "(" + unit.l + ") ";
        }

        s += formatUnitType(unit.t, unit.o);
    }

    if (s == "") {
        s = "none";
    }

    return s;
}

function formatUnitType(unitType, count) {
    var res = webfrontend.res.Main.getInstance();
    var unit = res.units[unitType];
    if (unit == null) {
        return "UNKNOWN_" + unitType;
    }
    var name = unit.dn.toLowerCase();
    var locale = qx.locale.Manager.getInstance().getLocale();
    if (locale == "en") {
        if (name != null && name.length > 0 && name.charAt(name.length - 1) != 's' && count > 1) {
            name += 's';
            if (name == "crossbowmans") {
                name = "crossbowmen";
            }
        }
    } else {
        if (name != null && name.length > 0 && count > 1) {
            switch (name) {
                case "stadtwächter":
                    name = "Stadtwächter";
                    break;
                case "balliste":
                    name = "Baliste(n)";
                    break;
                case "jäger":
                    name = "Jäger";
                    break;
                case "pikenier":
                    name = "Pikenier(e)";
                    break;
                case "templer":
                    name = "Templer";
                    break;
                case "beserker":
                    name = "Berserker";
                    break;
                case "magier":
                    name = "Magier";
                    break;
                case "kundschafter":
                    name = "Kundschafter";
                    break;
                case "armbrustschütze":
                    name = "Armbrustschütze(n)";
                    break;
                case "paladin":
                    name = "Paladin(e)";
                    break;
                case "ritter":
                    name = "Ritter";
                    break;
                case "hexenmeister":
                    name = "Hexenmeister";
                    break;
                case "rammbock":
                    name = "Rammböcke";
                    break;
                case "katapult":
                    name = "Katapult(e)";
                    break;
                case "fregatte":
                    name = "Fregatte(n)";
                    break;
                case "schaluppe":
                    name = "Schaluppe(n)";
                    break;
                case "kriegsgaleone":
                    name = "Kriegsgaleone(n)";
                    break;
                case "baron":
                    name = "Baron(e)";
                    break;
            }
        }
    }
    return name;
}

function getUnitAttackType(unitId) {
    var unitId = parseInt(unitId);
    var infantry = new qx.data.Array([1, 3, 4, 5, 6, 19]);
    var cavalery = new qx.data.Array([8, 9, 10, 11]);
    var magic = new qx.data.Array([7, 12]);
    var artilery = new qx.data.Array([2, 13, 14, 15, 16, 17]);

    if (infantry.indexOf(unitId) >= 0) {
        //return "infantry";
        return 1;
    }
    if (cavalery.indexOf(unitId) >= 0) {
        //return "cavalery";
        return 2;
    }
    if (magic.indexOf(unitId) >= 0) {
        //return "magic";
        return 4;
    }
    if (artilery.indexOf(unitId) >= 0) {
        //return "artilery";
        return 3;
    }
    //return "unknown";
    bos.Utils.handleError("Unknown attack type for unit " + unitId);
    return 0;
}

function getUnitRequiredSpace(unitType) {
    var res = webfrontend.res.Main.getInstance();
    var unit = res.units[unitType];
    if (unit == null) {
        return 0;
    }
    return unit.uc;
}

function human_time(val) {
    if (val <= 0)
        return "00:00:00";

    var seconds = val % 60;
    var minutes = Math.floor(val / 60) % 60;
    var hours = Math.floor(val / 3600) % 24;
    var days = Math.floor(val / 86400);

    var str = sprintf("%02d:%02d:%02d", hours, minutes, seconds);

    if (days > 0)
        str = sprintf("%dd %s", days, str);

    return str;
}

function debug(sMsg) {
    if (bos.Const.DEBUG_VERSION) {
        /*
         if (window.JS_log != undefined)
         window.JS_log(sMsg);
         else
         */
        alert(sMsg);
    }
}

function trace(sMsg) {
    //alert(sMsg);
}

function dumpObject(obj) {
    debug(qx.util.Json.stringify(obj));
}

function jumpCoordsDialog() {
    var wdg = new webfrontend.gui.ConfirmationWidget();
    wdg.askCoords = function () {
        var bgImg = new qx.ui.basic.Image("webfrontend/ui/bgr_popup_castle_warning.gif");
        this.dialogBackground._add(bgImg, {left:0, top:0});

        var f20 = new qx.bom.Font(20);
        var f25 = new qx.bom.Font(25);

        var la = new qx.ui.basic.Label("Coordinates");
        la.setFont("font_subheadline_sidewindow");
        la.setTextColor("text-gold");
        la.setTextAlign("left");
        this.dialogBackground._add(la, {left:17, top:5});

        var lb = new qx.ui.basic.Label(locale == "de" ? "Gebe die Koordinaten in das Textfeld ein" : "Insert target coords into text field.");

        lb.setFont(f20);
        this.dialogBackground._add(lb, {left:275, top:65});

        var lc = new qx.ui.basic.Label(locale == "de" ? "Koordinaten(0-699) müssen mit einem Doppelpunkt getrennt werden! <br />Beispiel: 432:231 " : "Values (0-699) should be separated by a colon<br />Example: 432:231");
        lc.setRich(true);
        lc.setTextAlign("center");
        this.dialogBackground._add(lc, {left:305, top:90});

        var crds = new qx.ui.form.TextField("").set({width:120, maxLength:7, font:f25});
        crds.setTextAlign("center");
        this.dialogBackground._add(crds, {left:360, top:137});

        var ok = new qx.ui.form.Button("OK").set({width:120});
        ok.addListener("click", function () {
            crds.getValue().match(/^(\d{1,3}):(\d{1,3})$/);
            var x = parseInt(RegExp.$1, 10);
            var y = parseInt(RegExp.$2, 10);

            a.setMainView('r', 0, x * a.visMain.getTileWidth(), y * a.visMain.getTileHeight());
            wdg.disable();
        }, true);
        ok.setEnabled(false);
        this.dialogBackground._add(ok, {left:295, top:205});

        var c = new qx.ui.form.Button("Cancel").set({width:120});
        c.addListener("click", function () {
            a.allowHotKey = true;
            wdg.disable();
        }, true);
        this.dialogBackground._add(c, {left:445, top:205});

        var validateCoords = function () {
            tfc = crds.getValue().match(/^(\d{1,3}):(\d{1,3})$/);
            if (tfc == null) {
                ok.setEnabled(false);
                return;
            }
            if (!/[^\d]/.test(tfc[1]) && !/[^\d]/.test(tfc[2])) {
                if (tfc[1] >= 0 && tfc[1] <= 699 && tfc[2] >= 0 && tfc[2] <= 699) {
                    ok.setEnabled(true);
                } else {
                    ok.setEnabled(false);
                }
            }
        }
        crds.addListener("input", validateCoords, false);
        crds.focus();
    }
    return wdg;
}
