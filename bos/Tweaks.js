/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 7/07/12
 * Time: 23:41
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.Tweaks");

    qx.Class.define("bos.Tweaks", {
        type: "singleton",
        extend: qx.core.Object,
        members: {
            app: null,
            gameStarted: function() {
                trace("In gameStarted");
                app = qx.core.Init.getApplication();

                this.tweakErrorReporting();
                var res = webfrontend.res.Main.getInstance();

                try {
                    var container = app.title.reportButton.getLayoutParent();
                    var menuColumns = container.getChildren().length;

                    var btnSummary = new qx.ui.form.Button(tr("summary")).set({
                        marginLeft: 10
                    });
                    btnSummary.setWidth(78);
                    btnSummary.setHeight(32);
                    container._add(btnSummary, {
                        row: 0,
                        column: menuColumns + 1
                    });
                    btnSummary.addListener("click", function (event) {
                        bos.Tweaks.getInstance().showSummary();
                    }, this);

                    var menu = new qx.ui.menu.Menu();

                    var btnCombatCalc = new qx.ui.menu.Button(tr("combat calculator"), null);
                    btnCombatCalc.addListener("execute", function(event) {
                        bos.Tweaks.getInstance().showCombatCalc();
                    });

                    var btnFoodCalc = new qx.ui.menu.Button(tr("food calculator"), null);
                    btnFoodCalc.addListener("execute", function(event) {
                        bos.Tweaks.getInstance().showFoodCalc();
                    });

                    var btnRecruitmentSpeedCalc = new qx.ui.menu.Button(tr("recruitment speed calculator"), null);
                    btnRecruitmentSpeedCalc.addListener("execute", function(event) {
                        bos.Tweaks.getInstance().showRecruitmentSpeedCalc();
                    });

                    var btnJumpCoords = new qx.ui.menu.Button(tr("jump to coords"), null);
                    btnJumpCoords.addListener("execute", function(event) {
                        bos.Tweaks.getInstance().showJumpToCoordsDialog();
                    });

                    var btnJumpToCity = new qx.ui.menu.Button(tr("jump to city"), null);
                    btnJumpToCity.addListener("execute", function(event) {
                        var s = prompt(tr("please enter city coordinates"), "");
                        if (s != null && s != "") {
                            s.match(/^(\d{1,3}):(\d{1,3})$/);
                            var x = parseInt(RegExp.$1, 10);
                            var y = parseInt(RegExp.$2, 10);
                            webfrontend.gui.Util.openCityProfile(x, y);
                        }
                    });

                    var btnJumpPlayer = new qx.ui.menu.Button(tr("jump to player"), null);
                    btnJumpPlayer.addListener("execute", function(event) {
                        var name = prompt(tr("please enter player name:"), "");
                        if (name != null && name != "") {
                            //webfrontend.gui.Util.openPlayerProfile(name);
                            app.showInfoPage(app.getPlayerInfoPage(), {
                                name: name
                            });
                        }
                    });

                    var btnJumpAlliance = new qx.ui.menu.Button(tr("jump to alliance"), null);
                    btnJumpAlliance.addListener("execute", function(event) {
                        var name = prompt(tr("please enter alliance name:"), "");
                        if (name != null && name != "") {
                            //webfrontend.gui.Util.openAllianceProfile(name);
                            app.showInfoPage(app.getAllianceInfoPage(), {
                                name: name
                            });
                        }
                    });

                    var btnJumpContinent = new qx.ui.menu.Button(tr("jump to continent"), null);
                    btnJumpContinent.addListener("execute", function(event) {
                        var s = prompt(tr("please enter continent:"), "");
                        if (s != null && s != "") {
                            var cont = parseInt(s, 10);
                            var col = Math.floor(cont % 10);
                            var row = Math.floor(cont / 10);
                            var srv = webfrontend.data.Server.getInstance();
                            var height = srv.getContinentHeight();
                            var width = srv.getContinentWidth();

                            var x = Math.floor(col * width + 0.5 * width);
                            var y = Math.floor(row * height + 0.5 * height);

                            app.setMainView('r', 0, x * app.visMain.getTileWidth(), y * app.visMain.getTileHeight());
                        }
                    });

                    var btnExtraSummary = new qx.ui.menu.Button(tr("extra summary"), null);
                    btnExtraSummary.addListener("execute", this.extraSummary);

                    menu.add(btnCombatCalc);
                    menu.add(btnFoodCalc);
                    menu.add(btnRecruitmentSpeedCalc);
                    menu.addSeparator();
                    menu.add(btnJumpCoords);
                    menu.add(btnJumpToCity);
                    menu.add(btnJumpPlayer);
                    menu.add(btnJumpAlliance);
                    menu.add(btnJumpContinent);

                    menu.addSeparator();
                    menu.add(btnExtraSummary);
                    menu.addSeparator();

                    var btnZoomOut = new qx.ui.menu.Button(tr("zoom out"), null);
                    btnZoomOut.addListener("execute", function(event) {
                        this.setZoom(0.5);
                    }, this);

                    menu.add(btnZoomOut);

                    var btnZoomIn = new qx.ui.menu.Button(tr("zoom in"), null);
                    btnZoomIn.addListener("execute", function(event) {
                        this.setZoom(1.0);
                    }, this);
                    menu.add(btnZoomIn);

                    menu.addSeparator();

                    var btnFillWithResources = new qx.ui.menu.Button(tr("fill with resources"), null);
                    btnFillWithResources.addListener("execute", function(event) {
                        bos.gui.ResourcesFillerWidget.getInstance().open();
                        bos.gui.ResourcesFillerWidget.getInstance().setCurrentCityAsTarget();
                    }, this);
                    menu.add(btnFillWithResources);

                    var btnMenu = new qx.ui.form.MenuButton("BOS Tools", null, menu).set({
                        marginLeft: 10
                    });

                    menuColumns = container.getChildren().length;
                    container._add(btnMenu, {
                        row: 0,
                        column: menuColumns + 1
                    });

                    var zoomSlider = new qx.ui.form.Slider().set({
                        minimum: 25,
                        maximum: 200,
                        singleStep: 5,
                        pageStep: 1,
                        value: 100,
                        width: 200
                    });
                    zoomSlider.addListener("changeValue", function(e) {
                        this.setZoom(zoomSlider.getValue() / 100.0);
                    }, this);

                    var btnZoomReset = new qx.ui.form.Button("R");
                    btnZoomReset.addListener("execute", function(e) {
                        this.setZoom(1);
                        zoomSlider.setValue(100);
                    }, this);

                    var zoomBox = new qx.ui.container.Composite().set({
                        width: 250,
                        height: 28
                    });
                    zoomBox.setLayout(new qx.ui.layout.HBox(0));
                    zoomBox.add(zoomSlider);
                    zoomBox.add(btnZoomReset);

                    qx.core.Init.getApplication().getDesktop().add(zoomBox, {
                        left: 400 + 300,
                        top: 70,
                        right: null
                    });

                } catch (e) {
                    bos.Utils.handleError(tr("error during BOS Tools menu creation: ") + e);
                }

                app.overlaySizes[bos.Const.EXTRA_WIDE_OVERLAY] = {
                    width: 0,
                    height: 0
                };

                var pos = app.overlayPositions[0];
                app.overlayPositions[bos.Const.EXTRA_WIDE_OVERLAY] = {
                    left: pos.left,
                    top: pos.top,
                    bottom: pos.bottom
                };

                server = bos.Server.getInstance();

                try {
                    this.applyPersistedTweaks();
                } catch (e) {
                    bos.Utils.handleError("applyPersistedTweaks failed " + e);
                }

                trace("after gameStarted");

            },
            sentResourcesCounter: {},
            countSentResources: function(x, y) {
                this.sentResourcesCounter = new Object();
                var cityId = bos.Utils.convertCoordinatesToId(x, y);
                bos.net.CommandManager.getInstance().sendCommand("ReportGetCount", {
                    "folder": 0,
                    "city": cityId,
                    "mask": 197119
                }, this, this.processReportGetCount, cityId);
            },
            processReportGetCount: function(isOk, result, cityId) {
                if (isOk && result != null) {
                    var count = result;

                    bos.net.CommandManager.getInstance().sendCommand("ReportGetHeader", {
                        "folder": 0,
                        "city": cityId,
                        "start": 0,
                        "end": count,
                        "sort": 0,
                        "ascending": false,
                        "mask": 197119
                    }, this, this.processReportGetHeader, cityId);

                }
            },
            processReportGetHeader: function(isOk, result, cityId) {
                if (isOk && result != null) {
                    this.sentResourcesCounter = {
                        reports: 0,
                        ok: 0,
                        errors: 0,
                        players: {}
                    };
                    for (var i = 0; i < result.length; i++) {
                        var report = result[i];
                        if (report.t == "02010" || report.t == "02110") {
                            //resources arrived
                            this.sentResourcesCounter.reports++;
                            bos.net.CommandManager.getInstance().sendCommand("GetReport", {
                                "id": report.i
                            }, this, this.processGetReport, {cityId: cityId, state: this.sentResourcesCounter});
                        }
                    }
                }
            },
            processGetReport: function(isOk, result, params) {
                if (isOk && result != null) {
                    params.state.ok++;
                    var players = params.state.players;
                    if (players[result.h.p] == undefined) {
                        players[result.h.p] = {
                            1: 0,
                            2: 0,
                            3: 0,
                            4: 0
                        };
                    }
                    var res = players[result.h.p];

                    for (var i = 0; i < result.r.length; i++) {
                        var item = result.r[i];
                        res[item.t] += item.v;
                    }
                } else {
                    params.state.errors++;
                }

                if (params.state.errors + params.state.ok >= params.state.reports) {
                    var json = qx.util.Json.stringify(params);
                    bos.Utils.displayLongText(json);
                }
            },
            setZoom: function(zoom) {
                //for region and world
                var visMain = ClientLib.Vis.VisMain.GetInstance();
                visMain.set_ZoomFactor(zoom);

                //for city view
                try {
                    if (qx.bom.client.Engine.GECKO) {
                        app.visMain.scene.domRoot.style.MozTransform = "scale(" + zoom + ")";
                        app.visMain.scene.domRoot.style["overflow"] = "hidden";
                    } else {
                        app.visMain.scene.domRoot.style["zoom"] = zoom;
                    }
                } catch (ex) {
                    //ignore any exception
                }
            },
            extraSummary: function() {
                var widget = bos.gui.ExtraSummaryWidget.getInstance();
                widget.open();
            },
            tweakErrorReporting: function() {
                if (bos.Const.DEBUG_VERSION) {
                    //qx.event.GlobalError.setErrorHandler(null, this);
                    //window.onerror = null;
                    qx.event.GlobalError.setErrorHandler(handleError, this);
                    //qx.event.GlobalError.setErrorHandler(null, this);
                }
            },
            bosTest: function() {
                //webfrontend.net.UpdateManager.getInstance().completeRequest = this.test_completeRequest;
            },
            tweakReports: function() {

                if (reportsTweaked) {
                    return;
                }

                trace("in tweakReports");
                //app.title.reportButton.removeListener(app.title.reportButton, reportsBtnListener);

                //webfrontend.gui.ReportListWidget
                var rep = app.title.report;
                if (rep == null) {
                    debug("rep is NULL");
                    return;
                }

                rep.selectAllBtn.set({
                    width: 90
                });

                rep.deleteBtn.set({
                    width: 90
                });

                var left = 110;
                var step = 35;
                var bottom = 7;

                var selectDropdown = new qx.ui.form.SelectBox().set({
                    width: 100,
                    height: 28
                });

                var locale = qx.locale.Manager.getInstance().getLocale();
                if (locale == "de") {
                    selectDropdown.add(new qx.ui.form.ListItem("Keine", null, null));
                    selectDropdown.add(new qx.ui.form.ListItem("Alle", null, ""));
                    selectDropdown.add(new qx.ui.form.ListItem("Spionage", null, "Spionage: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Plünderung", null, "Plünderung: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Überfall", null, "Überfall: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Belagerung", null, "Belagerung: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Unterstützung", null, "Unterstützung: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Waren", null, "Waren: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Handel", null, "Handel: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Jagd", null, "Jagd: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Schatzsuche", null, "Schatzsuche: "));
                } else {
                    selectDropdown.add(new qx.ui.form.ListItem("None", null, null));
                    selectDropdown.add(new qx.ui.form.ListItem("All", null, ""));
                    selectDropdown.add(new qx.ui.form.ListItem("Assault", null, "Assault: |: Assaulted by "));
                    selectDropdown.add(new qx.ui.form.ListItem("Goods", null, "Goods: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Plunder", null, "Plunder: |: Plundered by "));
                    selectDropdown.add(new qx.ui.form.ListItem("Raids", null, "Raid: "));
                    selectDropdown.add(new qx.ui.form.ListItem("Scout", null, "Scout: |: Scouted by "));
                    selectDropdown.add(new qx.ui.form.ListItem("Siege", null, "Siege: |: Siege canceled by |: Sieged by |Reinforcement: Joins Siege vs."));
                    selectDropdown.add(new qx.ui.form.ListItem("Support", null, ": Support sent for your city |: Support from |Support: Your troops arrived at |: Support retreat by |Support: Sent home by "));
                    selectDropdown.add(new qx.ui.form.ListItem("Trade", null, "Trade: "));
                }

                selectDropdown.addListener("changeSelection", function onReportSelectFilter() {
                    var sel = selectDropdown.getSelection()[0].getModel();
                    selectReports(sel);
                }, false);


                rep.clientArea.add(selectDropdown, {
                    bottom: 1,
                    right: 1
                });
                //right = 100 + 1;

                var btnExport = new qx.ui.form.Button("Export");
                btnExport.set({width: 60, appearance: "button-text-small", toolTipText: locale =="de" ? "Exportieren den ausgewählten Report" : "Export selected reports."});
                btnExport.addListener("click", exportSelectedReports, false);
                rep.clientArea.add(btnExport, {
                    bottom: 1,
                    right: 110
                });
                //right += step;

                var tcm = rep.headers.getTableColumnModel();
                var behavior = tcm.getBehavior();
                behavior.setWidth(2, 90);

                //webfrontend.gui.ReportPage
                var reportPage = app.getReportPage();
                var widgets = reportPage.getChildren();
                var container = widgets[widgets.length - 1];
                var btnExportThisReport = new qx.ui.form.Button("Export");
                btnExportThisReport.addListener("execute", function(event) {
                    //XXX after maintaince search for "checkAttackersLeft: function(" and look below in private method, to get name of private field with id
                    var id = reportPage.__AV;
                    var counter = 1;
                    bos.net.CommandManager.getInstance().sendCommand("GetReport", {
                        id: id
                    }, this, parseReport, counter);
                    counter++;
                }, this);
                container.add(btnExportThisReport);

                var btnExportToCombatCalc = new qx.ui.form.Button(locale == "de" ? "Zum Kampfkalk hinzuf." : "To Combat calc");
                btnExportToCombatCalc.setToolTipText(locale == "de" ? "Fügt den Spionage Report zum Kampfkalkulator hinzu." : "Adds <b>scout</b> report to combat calculator");
                btnExportToCombatCalc.addListener("execute", function(event) {
                    //XXX after maintaince search for "checkAttackersLeft: function(" and look below in private method, to get name of private field with id
                    var id = reportPage.__AV;
                    onCombatCalc();
                    var combat = getCombatCalculatorWidget();
                    combat.addDefendersFromReport = true;
                    var counter = 1;
                    bos.net.CommandManager.getInstance().sendCommand("GetReport", {
                        id: id
                    }, combat, combat.parseReport, counter);
                    counter++;
                }, this);
                container.add(btnExportToCombatCalc);

                trace("after tweakReports");

                reportsTweaked = true;

            },
            applyPersistedTweaks: function() {
                var storage = bos.Storage.getInstance();

                if (storage.getTweakReportAtStart()) {
                    this.tweakReport();
                }

                if (storage.getTweakChatAtStart()) {
                    this.tweakChat();
                }

            },
            tweakChat: function() {
                var cls = app.chat;
                if (cls.oldOnNewMessage != undefined) {
                    //already applied
                    return;
                }

                app.chat.tabView.addListener("changeSelection", this._onChatChangeTab, this);
                app.chat.tabView.setSelection([app.chat.tabView.getChildren()[1]]);

                this._onChatChangeTab();

                cls.oldOnNewMessage = cls._onNewMessage;
            },
            _onChatChangeTab: function(event) {
                var chatId = app.chat.tabView.getSelection()[0].getUserData("ID");
                var ch = app.chat.chatLine;

                switch (chatId) {
                    case 0:
                        ch.setBackgroundColor("red");
                        break;
                    case 1:
                        ch.setBackgroundColor("");
                        break;
                    case 99:
                        ch.setBackgroundColor("");
                        break;
                }

            },
            showJumpToCoordsDialog: function() {
                var cwac = jumpCoordsDialog();
                cwac.askCoords();
                app.allowHotKey = false;
                //qx.core.Init.getApplication().getDesktop().add(cwac, {left: 0, right: 0, top: 0, bottom: 0});
                app.getDesktop().add(cwac, {left: 0, right: 0, top: 0, bottom: 0});
                cwac.show();
            },
            showSummary: function() {

                var server = bos.Server.getInstance();
                server.updateCity();

                var summary = getSummaryWidget();
                if (summary.isVisible()) {
                    summary.close();
                } else {
                    summary.open();
                    summary.updateView();
                }
            },
            showCombatCalc: function() {
                var server = bos.Server.getInstance();
                server.updateCity();
                var widget = this.getCombatCalculatorWidget();
                //widget.updateView();
                if (app.getCurrentOverlay() == widget) {
                    app.switchOverlay(null);
                } else {
                    app.switchOverlay(widget, bos.Const.EXTRA_WIDE_OVERLAY);
                }
            },
            showFoodCalc: function() {
                var server = bos.Server.getInstance();
                server.updateCity();
                var widget = this.getFoodCalculatorWidget();
                if (app.getCurrentOverlay() == widget) {
                    app.switchOverlay(null);
                } else {
                    app.switchOverlay(widget);
                }
            },
            showRecruitmentSpeedCalc: function () {
                var server = bos.Server.getInstance();
                server.updateCity();
                var widget = this.getRecruitmentSpeedCalculatorWidget();
                if (app.getCurrentOverlay() == widget) {
                    app.switchOverlay(null);
                } else {
                    app.switchOverlay(widget);
                }
            },
            getCombatCalculatorWidget: function() {
                if (this.combatCalculatorWidget == null) {
                    this.combatCalculatorWidget = new bos.gui.CombatCalculatorWidget();
                }
                return this.combatCalculatorWidget;
            },
            getFoodCalculatorWidget: function() {
                if (this.foodCalculatorWidget == null) {
                    this.foodCalculatorWidget = new bos.gui.FoodCalculatorWidget();
                }
                return this.foodCalculatorWidget;
            },
            getRecruitmentSpeedCalculatorWidget: function () {
                if (this.recruitmentSpeedCalculatorWidget == null) {
                    this.recruitmentSpeedCalculatorWidget = new bos.gui.RecruitmentSpeedCalculatorWidget();
                }
                return this.recruitmentSpeedCalculatorWidget;
            }
        }
    });
});