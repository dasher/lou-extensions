/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:23
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.CombatCalculatorWidget");

    qx.Class.define("bos.gui.CombatCalculatorWidget", {
        type: "singleton",
        extend: webfrontend.gui.OverlayWidget,
        construct: function() {
            webfrontend.gui.OverlayWidget.call(this);

            this.clientArea.setLayout(new qx.ui.layout.Canvas());
            this.setWidth(790);

            this.setTitle(locale == "de" ? "Kampf Kalkulator" : "Combat calculator");
            var res = webfrontend.res.Main.getInstance();
            var scroll = new qx.ui.container.Scroll();
            this.clientArea.add(scroll, {
                left: 0,
                top: 2,
                right: 0,
                bottom: 2
            });

            var box = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 20));
            scroll.add(box);

            this.attUnitContainer = new qx.ui.groupbox.GroupBox();
            this.attUnitContainer.setLegend(locale == "de" ? "Angreifer" : "Attacker");
            this.attUnitContainer.setLayout(new qx.ui.layout.Basic());
            box.add(this.attUnitContainer, {row: 0, column: 0});

            this.defUnitContainer = new qx.ui.groupbox.GroupBox();
            this.defUnitContainer.setLegend(locale == "de" ? "Verteidiger" : "Defender");
            this.defUnitContainer.setLayout(new qx.ui.layout.Basic());
            box.add(this.defUnitContainer, {row: 0, column: 1});

            this.defUnits = new Object();
            this.attUnits = new Object();

            var lblAttScore = new qx.ui.basic.Label(locale == "de" ? "Punkte" : "Score");
            this.attUnitContainer.add(lblAttScore, {
                left: 0,
                top: 6
            });
            this.attScore = new qx.ui.form.TextField(webfrontend.data.Player.getInstance().getPoints().toString());
            this.attUnitContainer.add(this.attScore, {
                left: 40,
                top: 6
            });

            var lblDefScore = new qx.ui.basic.Label(locale == "de" ? "Punkte" : "Score");
            this.defUnitContainer.add(lblDefScore, {
                left: 0,
                top: 6
            });
            this.defScore = new qx.ui.form.TextField(webfrontend.data.Player.getInstance().getPoints().toString());
            this.defUnitContainer.add(this.defScore, {
                left: 40,
                top: 6
            });

            var cT = 0;
            for (var key in res.units) {
                var cY = res.units[key];
                if (cY.x < 0 || cY.y < 0) continue;
                this.defUnits[key] = this.createUnitSlot(cY.x * 560, cY.y * 31 + 31, cY, this.defUnitContainer);
                this.attUnits[key] = this.createUnitSlot(cY.x * 560, cY.y * 31 + 31, cY, this.attUnitContainer);
                if (key == "1") {
                    this.attUnits[key].count.setEditable(false);
                }
                if (cY.y > cT) cT = cY.y;
            }
            this.defUnitContainer.setMinHeight((cT + 1) * 31);
            this.attUnitContainer.setMinHeight((cT + 1) * 31);

            box.add(this.createDefences(), {row: 0, column: 2});

            var rightColumn = new qx.ui.container.Composite(new qx.ui.layout.VBox(5));
            box.add(rightColumn, {row: 0, column: 3});

            rightColumn.add(this.createSummary());
            rightColumn.add(this.createFooter());
            /*
             this.clientArea.add(this.createFooter(), {
             bottom: 0,
             left: 0,
             right: 250
             });
             */

            /*
             this.clientArea.add(this.createSummary(), {
             bottom: 0,
             left: 450,
             right: 0
             });
             */

        },
        members: {
            defUnits: null,
            defUnitContainer: null,
            attUnits: null,
            attUnitContainer: null,
            defences: null,
            summary: null,
            sbAdd: null,
            hourInput: null,
            minuteInput: null,
            addDefendersFromReport: false,
            btnSubstractLosses: null,
            sbCombatType: null,
            btnClearAll: null,
            btnCalc: null,
            activateOverlay: function(activated) {
                //nothing to do
            },
            createFooter: function() {
                var container = new qx.ui.groupbox.GroupBox();
                container.setLegend("Actions");
                //container.setHeight(120);
                container.setLayout(new qx.ui.layout.VBox(5));

                var typeContainer = new qx.ui.container.Composite(new qx.ui.layout.Flow(5, 5));
                container.add(typeContainer);

                this.hourInput = new webfrontend.gui.SpinnerInt(0, 0, 23);
                this.hourInput.setValue(10);
                this.hourInput.setWidth(40);
                typeContainer.add(this.hourInput);

                var separatorLabel = new qx.ui.basic.Label(":");
                typeContainer.add(separatorLabel);

                this.minuteInput = new webfrontend.gui.SpinnerInt(0, 0, 59);
                this.minuteInput.setValue(0);
                this.minuteInput.setWidth(40);
                typeContainer.add(this.minuteInput);

                this.sbCombatType = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });
                if (locale == "de") {
                    this.sbCombatType.add(new qx.ui.form.ListItem("Überfall", null, "Assault"));
                    this.sbCombatType.add(new qx.ui.form.ListItem("Belagerung", null, "Siege"));
                    this.sbCombatType.add(new qx.ui.form.ListItem("Plünderung", null, "Plunder"));
                } else {
                    this.sbCombatType.add(new qx.ui.form.ListItem("Assault", null, "Assault"));
                    this.sbCombatType.add(new qx.ui.form.ListItem("Siege", null, "Siege"));
                    this.sbCombatType.add(new qx.ui.form.ListItem("Plunder", null, "Plunder"));
                }

                container.add(this.sbCombatType, {
                    row: 1,
                    column: 0
                });

                this.btnCalc = new qx.ui.form.Button("Calc");
                this.btnCalc.setWidth(50);
                container.add(this.btnCalc);
                this.btnCalc.addListener("click", this.calculateLosses, this);

                this.btnClearAll = new qx.ui.form.Button(locale == "de" ? "Alles Löschen" : "Clear All");
                this.btnClearAll.setWidth(90);
                container.add(this.btnClearAll);
                this.btnClearAll.addListener("click", this.clearAll, this);

                this.btnSubstractLosses = new qx.ui.form.Button(locale == "de" ? "Substract losses" : "Substract losses");
                this.btnSubstractLosses.setWidth(90);
                container.add(this.btnSubstractLosses);
                this.btnSubstractLosses.addListener("click", this.substractLosses, this);

                typeContainer = new qx.ui.container.Composite(new qx.ui.layout.Flow(5, 5));
                container.add(typeContainer);
                this.sbAdd = new qx.ui.form.SelectBox().set({
                    width: 160,
                    height: 28
                });
                if (locale == "de") {
                    this.sbAdd.add(new qx.ui.form.ListItem("Verteidiger & Verteidigung", null, "Defenders & Defences"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Verteidiger", null, "Defenders"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Verteidigung", null, "Defences"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Angreifer", null, "Attackers"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Spionage Report: Alle", null, "Scout Report: All"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Spionage Report: Verteidigung", null, "Scout Report: Defences"));
                } else {
                    this.sbAdd.add(new qx.ui.form.ListItem("Defenders & Defences", null, "Defenders & Defences"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Defenders", null, "Defenders"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Defences", null, "Defences"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Attackers", null, "Attackers"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Scout Report: All", null, "Scout Report: All"));
                    this.sbAdd.add(new qx.ui.form.ListItem("Scout Report: Defences", null, "Scout Report: Defences"));
                }

                typeContainer.add(this.sbAdd);

                this.btnAdd = new qx.ui.form.Button(locale == "de" ? "Hinzufügen" : "Add");
                this.btnAdd.setWidth(50);
                typeContainer.add(this.btnAdd);
                this.btnAdd.addListener("execute", this.onAdd, this);

                return container;
            },
            onAdd: function() {
                var add = this.sbAdd.getSelection()[0].getModel();
                if (add == "Attackers") {
                    this.addAttackers();
                } else if (add == "Defences") {
                    this.addDefences();
                } else if (add == "Defenders") {
                    this.addDefenders();
                } else if (add == "Defenders & Defences") {
                    this.addDefences();
                    this.addDefenders();
                } else if (add == "Scout Report: All") {
                    this.addReport(true);
                } else if (add == "Scout Report: Defences") {
                    this.addReport(false);
                }

            },
            calculateLosses: function() {
                var attStrength = this.calculateAttackStrength(this.attUnits, this.defences);
                var defStrength = this.calculateDefenceStrength(this.defUnits, this.defences);

                //dumpObject(attStrength);
                //dumpObject(defStrength);

                var str;

                var attackerForcesTypes = 0;
                var totalAttackerStrength = 0;
                var totalDefenderStrength = 0;

                str = 0;
                if (attStrength[1] != null) {
                    str = attStrength[1].strength;
                    if (str > 0) {
                        attackerForcesTypes++;
                        totalAttackerStrength += str;
                    }
                }
                this.summary.att[1].setValue(str);

                str = 0;
                if (attStrength[2] != null) {
                    str = attStrength[2].strength;
                    if (str > 0) {
                        attackerForcesTypes++;
                        totalAttackerStrength += str;
                    }
                }
                this.summary.att[2].setValue(str);

                str = 0;
                if (attStrength[3] != null) {
                    str = attStrength[3].strength;
                    if (str > 0) {
                        attackerForcesTypes++;
                        totalAttackerStrength += str;
                    }
                }
                this.summary.att[3].setValue(str);

                str = 0;
                if (attStrength[4] != null) {
                    str = attStrength[4].strength;
                    if (str > 0) {
                        attackerForcesTypes++;
                        totalAttackerStrength += str;
                    }
                }
                this.summary.att[4].setValue(str);

                str = 0;
                if (defStrength[1] != null) {
                    str = defStrength[1].strength;
                    totalDefenderStrength += str;
                }
                this.summary.def[1].setValue(str);

                str = 0;
                if (defStrength[2] != null) {
                    str = defStrength[2].strength;
                    totalDefenderStrength += str;
                }
                this.summary.def[2].setValue(str);

                str = 0;
                if (defStrength[3] != null) {
                    str = defStrength[3].strength;
                    totalDefenderStrength += str;
                }
                this.summary.def[3].setValue(str);

                str = 0;
                if (defStrength[4] != null) {
                    str = defStrength[4].strength;
                    totalDefenderStrength += str;
                }
                this.summary.def[4].setValue(str);

                this.clearLosses(this.defUnits);
                this.clearLosses(this.attUnits);


                //Mixed attacks are resolved as single type attacks where defensing forces are divided as proportions of attack strength.
                //Example attacker: 100 zerks and 100 mages. Total attack is 12000.
                //Defender is divided 41,7% (50*100/12000) against zerks and 58,3% (70*100/12000) against mages.
                var totalDefenderStrength = 0;
                for (var i = 1; i <= 4; i++) {

                    if (attStrength[i] != null && attStrength[i].strength > 0 && defStrength[i] != null) {
                        var attackPart = attStrength[i].strength / totalAttackerStrength;

                        var def = defStrength[i].strength * attackPart;
                        //alert(def + " = " + defStrength[i].strength + " * " + attackPart);
                        totalDefenderStrength += def;
                    }
                }

                //alert("totalAttackerStrength: " + totalAttackerStrength);
                //alert("totalDefenderStrength: " + totalDefenderStrength);

                for (var i = 1; i <= 4; i++) {
                    if (attStrength[i] != null && attStrength[i].strength > 0 && defStrength[i] != null) {
                        var attackPart = attStrength[i].strength / totalAttackerStrength;
                        var defAgainstThatGroup = defStrength[i].strength * attackPart;
                        var attackerLosses = (defAgainstThatGroup / totalAttackerStrength) * this.getAttackerMultiplier();

                        this.applyAttackerLosses(i, attackerLosses);
                    }
                }

                if (totalDefenderStrength > 0) {
                    var defenderLosses = (totalAttackerStrength / totalDefenderStrength) * this.getDefenderMultiplier();
                    this.applyDefenderLosses(0, defenderLosses);
                }


            },
            clearLosses: function(units) {

                for (var key in units) {
                    var inputs = units[key];
                    inputs.losses.setValue("");
                }

            },
            getAttackerMultiplier: function() {
                var mode = this.sbCombatType.getSelection()[0].getModel();
                if (mode == "Assault") {
                    return 0.5;
                } else if (mode == "Siege") {
                    return 0.1;
                } else if (mode == "Plunder") {
                    return 0.1;
                } else {
                    bos.Utils.handleError("Unknown mode=" + mode);
                }
            },
            getDefenderMultiplier: function() {
                var mode = this.sbCombatType.getSelection()[0].getModel();
                if (mode == "Assault") {
                    return 0.5;
                } else if (mode == "Siege") {
                    return 0.1;
                } else if (mode == "Plunder") {
                    return 0.02;
                } else {
                    bos.Utils.handleError("Unknown mode=" + mode);
                }
            },
            substractLosses: function() {
                this._substractLossesImpl(this.attUnits);
                this._substractLossesImpl(this.defUnits);

                var hour = parseInt(this.hourInput.getValue());
                hour++;
                if (hour >= 24) {
                    hour = 0;
                }
                this.hourInput.setValue(hour);
            },
            _substractLossesImpl: function(units) {
                for (var key in units) {
                    var inputs = units[key];
                    var count = parseInt(inputs.count.getValue());

                    var s = inputs.losses.getValue();
                    if (s != null && s != "") {
                        inputs.losses.setValue("");
                        var lost = parseInt(s);
                        if (qx.lang.Type.isNumber(lost) && !isNaN(lost)) {
                            count = Math.max(0, count - lost);
                            inputs.count.setValue(count);
                        }
                    }
                }
            },
            applyAttackerLosses: function(type, losses) {
                var res = webfrontend.res.Main.getInstance();
                for (var key in this.attUnits) {
                    var unit = res.units[key];
                    var inputs = this.attUnits[key];
                    var count = parseInt(inputs.count.getValue());
                    var attackType = getUnitAttackType(key);
                    if (count <= 0 || attackType != type) {
                        continue;
                    }

                    var lost = Math.min(count, Math.round(count * losses));
                    inputs.losses.setValue(lost);

                }

            },
            applyDefenderLosses: function(type, losses) {
                var res = webfrontend.res.Main.getInstance();
                for (var key in this.defUnits) {
                    var unit = res.units[key];
                    var inputs = this.defUnits[key];
                    var count = parseInt(inputs.count.getValue());
                    var attackType = getUnitAttackType(key);
                    if (count <= 0) {
                        continue;
                    }

                    var lost = Math.min(count, Math.round(count * losses));
                    inputs.losses.setValue(lost);
                }
            },
            calculateAttackStrength: function(units, defences) {
                var res = webfrontend.res.Main.getInstance();
                var result = [];
                for (var key in units) {
                    var unit = res.units[key];
                    var inputs = units[key];
                    var count = parseInt(inputs.count.getValue());

                    var attackType = getUnitAttackType(key);
                    if (result[attackType] == null) {
                        result[attackType] = {count: 0, strength: 0, neutralized: 0};
                    }
                    result[attackType].count += count;
                }

                for (var key in units) {
                    var unit = res.units[key];
                    var inputs = units[key];
                    var count = parseInt(inputs.count.getValue());

                    var attackType = getUnitAttackType(key);
                    var r = result[attackType];
                    var trapId = this.getTrapAgainst(attackType);

                    var maxNeutralized = 0;
                    if (defences[trapId] != null) {
                        maxNeutralized = parseInt(defences[trapId].count.getValue());
                    }

                    maxNeutralized -= r.neutralized;

                    if (maxNeutralized > 0) {
                        maxNeutralized = Math.min(maxNeutralized, parseInt(r.count / 2) - r.neutralized);
                        if (count <= maxNeutralized) {
                            r.neutralized += count;
                            count = 0;
                        } else {
                            r.neutralized += maxNeutralized;
                            count -= maxNeutralized;
                        }
                    }

                    var attack = unit.av * count;
                    r.strength += attack;
                }

                var hour = parseInt(this.hourInput.getValue(), 10);
                var minute = parseInt(this.minuteInput.getValue(), 10);
                var attackReduction = this.calculateAttackReduction(hour, minute);
                this.summary.attackReduction.setValue(attackReduction + "%");

                if (attackReduction != 0) {
                    for (var attackType in result) {
                        var attack = result[attackType];
                        attack.strength = Math.round(attack.strength * (1 + attackReduction / 100.0));
                    }
                }
                return result;
            },
            calculateDefenceStrength: function(units, defences) {
                var res = webfrontend.res.Main.getInstance();
                var result = [];

                var totalBoosted = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "8": 0};

                for (var key in units) {
                    if (key == "1")
                        continue;

                    var unit = res.units[key];
                    var inputs = units[key];
                    var count = parseInt(inputs.count.getValue());

                    for (var u in unit.def) {
                        if (result[u] == null) {
                            result[u] = {count: 0, strength: 0};
                        }
                        result[u].count += count;
                        //var defValue = unit.def[u];
                        //result[u].strength += defValue * count;
                    }
                }

                var cityWallsLevel = parseInt(defences[23].count.getValue());

                for (var key in units) {

                    if (key == "1")
                        continue;

                    var unit = res.units[key];
                    var inputs = units[key];
                    var count = parseInt(inputs.count.getValue());

                    var boosted = 0;
                    var towerId = this.getTowerFor(key);

                    if (towerId >= 0) {
                        var maxBoosted = parseInt(defences[towerId].count.getValue()) - totalBoosted[key];
                        if (maxBoosted >= count) {
                            boosted = count;
                            count = 0;
                        } else {
                            boosted = maxBoosted;
                            count -= boosted;
                        }

                        totalBoosted[key] += boosted;
                    }

                    for (var u in unit.def) {
                        if (result[u] == null) {
                            result[u] = {count: 0, strength: 0};
                        }

                        var defValue = unit.def[u];

                        var unitsDef = defValue * count + 2 * defValue * boosted;
                        if (!this.isNavalUnit(key)) {
                            //walls bonus not for naval units
                            var bonus = this.getCityWallsBonus(cityWallsLevel);
                            unitsDef = parseInt(unitsDef * (1 + bonus));
                        }

                        result[u].strength += unitsDef;
                    }
                }

                //dumpObject(totalBoosted);

                for (var key in units) {

                    if (key != "1")
                        continue;

                    var unit = res.units[key];

                    var boostableGuards = 0;
                    for (var b in totalBoosted) {

                        var towerId = this.getTowerFor(b);
                        if (towerId > 0) {
                            var maxBoosted = parseInt(defences[towerId].count.getValue()) - totalBoosted[key];

                            var guardsPerUnit = this.getAffectedGuardsPerUnit(towerId);

                            boostableGuards += guardsPerUnit * maxBoosted;
                        }
                    }

                    var unit = res.units[key];
                    var inputs = units[key];
                    var count = parseInt(inputs.count.getValue());

                    var boosted = Math.min(boostableGuards, count);
                    count -= boosted;

                    for (var u in unit.def) {
                        if (result[u] == null) {
                            result[u] = {count: 0, strength: 0};
                        }

                        var defValue = unit.def[u];

                        var unitsDef = defValue * count + 2 * defValue * boosted;
                        if (!this.isNavalUnit(key)) {
                            //walls bonus not for naval units
                            var bonus = this.getCityWallsBonus(cityWallsLevel);
                            unitsDef = parseInt(unitsDef * (1 + bonus));
                        }

                        result[u].strength += unitsDef;
                    }

                }

                var moraleBoost = this.calculateMoraleBoost();
                if (moraleBoost > 0) {
                    var factor = (1 + moraleBoost / 100.0);
                    for (var u in result) {
                        result[u].strength = parseInt(result[u].strength * factor);
                    }
                }

                this.summary.moraleBonus.setValue("+" + moraleBoost.toString() + "%");

                return result;
            },
            calculateAttackReduction: function(hour, minute) {
                /* some test data:
                 22:00:01 -0
                 22:10:00 -3
                 22:20:00 -7
                 22:26:35 -9%
                 22:27:53 -9%
                 22:30    -10
                 22:40    -13
                 22:50    -17
                 23:00    -20
                 23:10    -23
                 23:20:27 -27%
                 23:26:35 -29
                 23:27:53 -29
                 23:30    -30
                 23:40    -33
                 23:50    -37
                 00:26:35 -40
                 07:27:52 -40
                 08:26:35 -31
                 09:26:35 -11
                 */
                if (hour >= 10 && hour <= 21) {
                    return 0;
                }
                if (hour >= 0 && hour <= 7) {
                    return -40;
                }
                var m = hour * 60 + minute;
                if (hour >= 22) {
                    var result = (-1.0/3.0) * m + 440;
                    return Math.round(result);
                }
                if (hour >= 8) {
                    var result = (1.0/3.0) * m - 200;
                    return Math.round(result);
                }
                bos.Utils.handleError("It shouldn't happend " + hour + ":" + minute);
                return 0;
            },
            calculateMoraleBoost: function() {
                var a = parseInt(this.attScore.getValue());
                var d = parseInt(this.defScore.getValue());

                if (a == 0 || d == 0) {
                    return 0;
                }

                var factor = a / d;
                if (factor <= 4) {
                    return 0;
                }

                if (factor >= 40) {
                    return 300;
                }

                if (factor < 10) {
                    var y = (100 / 6) * factor - 200 / 3;
                    return parseInt(y);
                }

                var y = 10 * factor;
                return parseInt(y);

            },
            getCityWallsBonus: function(level) {
                var bonusses = [0, 0.01, 0.03, 0.06, 0.1, 0.15, 0.2, 0.26, 0.33, 0.41, 0.5];
                if (bonusses[level] != null) {
                    return bonusses[level];
                } else {
                    return 0;
                }
            },
            isNavalUnit: function(unitType) {
                var t = parseInt(unitType);
                if (t >= 15 && t <= 17) {
                    return true;
                } else {
                    return false;
                }
            },
            addReport: function(addDefenders) {

                var rep = a.title.report;
                if (rep == null) {
                    if (locale == "de"){
                        bos.Utils.handleWarning("Der Reportframe ist nicht geöffnet, bitte klicke auf den Report-Button");
                    } else {
                        bos.Utils.handleWarning("Cannot find reports widget, please click Reports button");
                    }
                    return;
                }

                var rep = a.title.report;
                var ids = rep.headerData.getSelectedIds();

                if (ids.length == 0 || (ids.length == 1 && ids[0] == 0) || ids.length != 1) {
                    if (locale == "de"){
                        bos.Utils.handleWarning("Bitte markiere einen Spionage Report");
                    } else {
                        bos.Utils.handleWarning("Please select one scout report");
                    }

                    return;
                }

                this.addDefendersFromReport = addDefenders;
                var counter = 1;
                for (key in ids) {
                    var id = ids[key];
                    bos.net.CommandManager.getInstance().sendCommand("GetReport", {
                        id: id
                    }, this, this.parseReport, counter);
                    counter++;
                }

            },
            parseReport: function(r, data, eh) {

                if (r == false || data == null) return;

                this.clear(this.defences);

                if (this.addDefendersFromReport) {
                    this.clear(this.defUnits);
                }

                if (data.a != null && data.a.length > 0 && this.addDefendersFromReport) {

                    var totalDef = new Array();

                    for (var i = 0; i < data.a.length; i++) {
                        var def = data.a[i];
                        if (def.r == bos.Const.ORDER_ATTACK) {
                            continue;
                        }

                        for (var key in def.u) {

                            var unit = def.u[key];
                            if (totalDef[unit.t] == undefined) {
                                totalDef[unit.t] = {o: 0, l: 0, t: unit.t};
                            }

                            totalDef[unit.t].o += unit.o;
                            totalDef[unit.t].l += unit.l;
                        }

                    }

                    for (var i = 1; i <= 19; i++) {
                        if (i == 18) continue;
                        var inputs = this.defUnits[i];

                        if (totalDef[i] != null) {
                            var unit = totalDef[i];
                            inputs.count.setValue(unit.l);
                        }
                    }

                }

                if (data.s != null && data.s.length > 0) {
                    for (var i = 0; i < data.s.length; i++) {
                        var building = data.s[i];

                        var bt = parseInt(building.t);
                        if (this.defences[bt] != null) {
                            //dumpObject(building);
                            if (bt == 23) {
                                //walls
                                this.defences[bt].count.setValue(building.l);
                            } else {
                                //tower
                                var count = parseInt(this.defences[bt].count.getValue());


                                var affected = this._getAffectedTroops(bt, parseInt(building.l));

                                this.defences[bt].count.setValue(count + parseInt(building.a) * affected.affected);
                            }
                        }
                    }
                }

            },
            clearAll: function() {
                this.clear(this.defences);
                this.clear(this.defUnits);
                this.clear(this.attUnits);
            },
            clear: function(list) {
                for (var key in list) {
                    var inputs = list[key];
                    inputs.count.setValue(0);
                    if (inputs.losses) {
                        inputs.losses.setValue("");
                    }
                }

            },
            addDefenders: function() {
                var server = bos.Server.getInstance();
                var city = webfrontend.data.City.getInstance();
                for (var i = 1; i <= 19; i++) {
                    if (i == 18) continue;
                    var inputs = this.defUnits[i];

                    var unit = server.cities[city.getId()].getUnitTypeInfo(i);
                    inputs.count.setValue(unit.count);
                }

                if (city.getSupportOrders() != null) {
                    for (var i = 0; i < city.getSupportOrders().length; i++) {
                        var order = city.getSupportOrders()[i];
                        if (order.state = 4 && order.units != null) {
                            for (var u = 0; u < order.units.length; u++) {
                                var unit = order.units[u];
                                var inputs = this.defUnits[unit.type];
                                var current = parseInt(inputs.count.getValue());
                                inputs.count.setValue(current + unit.count);
                            }
                        }
                    }
                }
            },
            addAttackers: function() {
                var server = bos.Server.getInstance();
                var city = webfrontend.data.City.getInstance();
                for (var i = 2; i <= 19; i++) {
                    if (i == 18) continue;
                    //var unitKey = "unit_" + i;
                    var inputs = this.attUnits[i];

                    var unit = server.cities[city.getId()].getUnitTypeInfo(i);
                    inputs.count.setValue(unit.total);
                    inputs.losses.setValue("");
                }

            },
            addDefences: function() {
                var city = webfrontend.data.City.getInstance();
                var buildings = a.visMain.getBuildings();

                for (var key in this.defences) {
                    this.defences[key].count.setValue(0);
                }

                var affectedTroops = {};

                if (buildings.length == 0) {
                    if (locale == "de"){
                        bos.Utils.handleWarning("Du musst in der Stadt sein um die Verteidigung und die Verteidiger zu erhalten!");
                    } else {
                        bos.Utils.handleWarning("You need to be in city to fetch it's defences!");
                    }
                }

                for (var i = 0; i < buildings.length; i++) {
                    var b = buildings[i];
                    var bType = parseInt(b.getType());

                    if ((bType >= 38 && bType <= 46)) {
                        var count = parseInt(this.defences[bType].count.getValue());

                        var affected = this.getAffectedTroops(b);

                        this.defences[bType].count.setValue(count + affected.affected);
                    }

                }

                this.defences[23].count.setValue(city.getWallLevel());

            },
            getTowerFor: function(unitType) {
                var t = parseInt(unitType);
                if (t == 2) {
                    return 39;
                } else if (t == 3) {
                    return 41;
                } else if (t == 4) {
                    return 40;
                } else if (t == 5) {
                    return 42;
                } else if (t == 8) {
                    return 38;
                }
                return -1;
            },
            _getAffectedTroops: function(type, level) {
                // 38 - lookout tower
                // 39 - ballista tower
                // 40 - guardian tower
                // 41 - ranger tower
                // 42 - templar tower
                // 43 - pitfall trap
                // 44 - barricade
                // 45 - arcane trap
                // 46 - camouflage trap
                var stats = [];
                //0 index = guards multiplier
                stats[38] = [2, 4, 8, 15, 25, 40, 60, 88, 125, 175, 250];
                stats[39] = [10, 4, 8, 15, 25, 40, 60, 88, 125, 175, 250];
                stats[40] = [1, 30, 60, 120, 200, 320, 480, 700, 1000, 1400, 2000];
                stats[41] = [1, 30, 60, 120, 200, 320, 480, 700, 1000, 1400, 2000];
                stats[42] = [1, 30, 60, 120, 200, 320, 480, 700, 1000, 1400, 2000];
                stats[43] = [0, 16, 26, 50, 100, 150, 240, 350, 500, 700, 1000];
                stats[44] = [0, 16, 26, 50, 100, 150, 240, 350, 500, 700, 1000];
                stats[45] = [0, 16, 26, 50, 100, 150, 240, 350, 500, 700, 1000];
                stats[46] = [0, 20, 30, 50, 100, 160, 240, 350, 500, 700, 1000]

                var result = {affected: 0, guards: 0};

                var bType = parseInt(type);

                if (stats[bType] != null) {
                    result.affected = stats[bType][level];
                    result.guards = result.affected * stats[bType][0];
                }

                return result;

            },
            getAffectedTroops: function(b) {
                return this._getAffectedTroops(b.getType(), b.getLevel());
            },
            getAffectedGuardsPerUnit: function(towerId) {
                var id = parseInt(towerId);
                switch (id) {
                    case 38: return 2;
                    case 39: return 10;
                    case 40: return 1;
                    case 41: return 1;
                    case 42: return 1;
                    default:
                        return 0;
                }
            },
            getTrapAgainst: function(attackType) {
                if (attackType == 1) {
                    return 43;
                } else if (attackType == 2) {
                    return 44;
                } else if (attackType == 3) {
                    return 45;
                } else if (attackType == 4) {
                    return 46;
                } else {
                    bos.Utils.handleError("Unknown attackType: " + attackType);
                    return 0;
                }
            },
            createSummary: function() {

                var container = new qx.ui.groupbox.GroupBox();
                container.setLegend("Summary");
                container.setLayout(new qx.ui.layout.Grid(5, 5));

                this.summary = {att: [], def: [], attackReduction: 0, moraleBonus: 0};
                var label;

                var att = new qx.ui.basic.Label(tr("attacker"));
                container.add(att, {
                    row: 0,
                    column: 1
                });

                var def = new qx.ui.basic.Label(tr("defender"));
                container.add(def, {
                    row: 0,
                    column: 2
                });

                var inf = new qx.ui.basic.Label("Inf.");
                container.add(inf, {
                    row: 1,
                    column: 0
                });

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 1,
                    column: 1
                });
                this.summary.att[1] = label;

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 1,
                    column: 2
                });
                this.summary.def[1] = label;

                var cav = new qx.ui.basic.Label(locale == "de" ? "Kavallerie" : "Cavalry");
                container.add(cav, {
                    row: 2,
                    column: 0
                });

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 2,
                    column: 1
                });
                this.summary.att[2] = label;

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 2,
                    column: 2
                });
                this.summary.def[2] = label;

                var mag = new qx.ui.basic.Label(locale == "de" ? "Magie" : "Magic");
                container.add(mag, {
                    row: 3,
                    column: 0
                });

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 3,
                    column: 1
                });
                this.summary.att[4] = label;

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 3,
                    column: 2
                });
                this.summary.def[4] = label;

                var siege = new qx.ui.basic.Label(locale == "de" ? "Artilery" : "Siege");
                container.add(siege, {
                    row: 4,
                    column: 0
                });

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 4,
                    column: 1
                });
                this.summary.att[3] = label;

                label = new qx.ui.basic.Label("0");
                container.add(label, {
                    row: 4,
                    column: 2
                });
                this.summary.def[3] = label;

                var siege = new qx.ui.basic.Label("Modifier");
                container.add(siege, {
                    row: 5,
                    column: 0
                });

                label = new qx.ui.basic.Label("0");
                label.setToolTipText(locale == "de" ? "Angriffsverringerung  durch den Nachtschutz" : "Night protection attack reduction");
                container.add(label, {
                    row: 5,
                    column: 1
                });
                this.summary.attackReduction = label;

                label = new qx.ui.basic.Label("0");
                label.setToolTipText(locale == "de" ? "Maloral Bonus" : "Morale bonus");
                container.add(label, {
                    row: 5,
                    column: 2
                });
                this.summary.moraleBonus = label;

                return container;
            },
            createDefences: function() {
                var walls = new qx.ui.groupbox.GroupBox();
                walls.setLegend(locale == "de" ? "Verteidigung (des Verteidigers)" : "Defences (affected)");
                walls.setLayout(new qx.ui.layout.Basic());

                this.defences = new Object();

                var x = 0;
                var y = 0;
                var margin = 36;

                var res = webfrontend.res.Main.getInstance();

                var building = res.buildings[23];
                this.defences[23] = this.createBuildingSlot(x, y, building, walls, 10);
                y += margin;

                // 38 - lookout tower
                // 39 - ballista tower
                // 40 - guardian tower
                // 41 - ranger tower
                // 42 - templar tower
                // 43 - pitfall trap
                // 44 - barricade
                // 45 - arcane trap
                // 46 - camouflage trap

                for (var i = 38; i <= 46; i++) {
                    var building = res.buildings[i];
                    this.defences[i] = this.createBuildingSlot(x, y, building, walls, 48000);
                    y += margin;
                }

                return walls;
            },
            createBuildingSlot: function(x, y, building, container, max) {
                var res = webfrontend.res.Main.getInstance();
                var img = null;
                if (building.mimg >= 0) {
                    var fi = res.getFileInfo(building.mimg);
                    img = new qx.ui.basic.Image(webfrontend.config.Config.getInstance().getUIImagePath(fi.url));
                    img.setWidth(32);
                    img.setHeight(32);
                    img.setScale(true);

                    var tt = new qx.ui.tooltip.ToolTip(building.dn);
                    img.setToolTip(tt);
                    container.add(img, {
                        left: x + 8 - 4,
                        top: y + 6
                    });
                }
                var countInput = new webfrontend.gui.SpinnerInt(0, 0, max);
                countInput.setWidth(70);
                //countInput.getChildControl("textfield").setLiveUpdate(true);
                container.add(countInput, {
                    left: x + 50 - 4,
                    top: y + 10
                });
                //XXX countInput.addListener("changeValue", this.updateResValue, this);
                a.setElementModalInput(countInput);

                var result = {
                    image: img,
                    count: countInput
                };
                //countInput.getChildControl("textfield").addListener("changeValue", this.spinnerTextUpdate, cq);

                return result;
            },
            createUnitSlot: function(x, y, unit, container) {
                var res = webfrontend.res.Main.getInstance();
                var img = null;
                if (unit.mimg >= 0) {
                    var fi = res.getFileInfo(unit.mimg);
                    img = new qx.ui.basic.Image(webfrontend.config.Config.getInstance().getUIImagePath(fi.url));
                    img.setWidth(22);
                    img.setHeight(22);
                    img.setScale(true);

                    var tt = new qx.ui.tooltip.ToolTip(unit.dn);
                    img.setToolTip(tt);
                    container.add(img, {
                        left: x,
                        top: y + 6
                    });
                }
                var countInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                countInput.setWidth(70);
                //countInput.getChildControl("textfield").setLiveUpdate(true);
                container.add(countInput, {
                    left: x + 40,
                    top: y + 4
                });
                //XXX countInput.addListener("changeValue", this.updateResValue, this);
                a.setElementModalInput(countInput);

                var losses = new qx.ui.basic.Label("");
                container.add(losses, {
                    left: x + 40 + 75,
                    top: y + 4
                });

                var result = {
                    'image': img,
                    'count': countInput,
                    'losses': losses
                };
                //cj.getChildControl("textfield").addListener("changeValue", this.spinnerTextUpdate, cq);
                //cn.addListener("click", this._onMax, cq);
                return result;
            },
            spinnerTextUpdate: function(e) {
                if (e.getData().length == 0) this.buildCount.setValue(0);
            },
            clearSelections: function() {
                for (var bG in this.units) {
                    this.units[bG].buildCount.setValue(0);
                }
            }
        }
    });
});