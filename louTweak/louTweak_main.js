/**
 * Created by TriMoon <http://claimid.com/trimoon>
 * Date: 2012/08/29
 * LoU Tweak:
 * 		Author: AmpliDude
 * 		Script: http://userscripts.org/scripts/show/80532
 */
loader.addFinishHandler(function() {
	GM_log("louTweak - defining main");

	qx.Class.define("louTweak.main", {
		type: "singleton",
		extend: qx.core.Object,
		statics: {
			lou_building_id: {
				"woodcutter": 47, "quarry": 48, "farm": 50, "cottage": 4, "market": 5, "ironmine": 49, "sawmill": 7, "mill": 8, "hideout": 9, "stonemason": 10, "foundry": 11, "townhouse": 13, "barracks": 14, "cityguardhouse": 15, "trainingground": 16, "stable": 17, "workshop": 18, "shipyard": 19, "warehouse": 20, "castle": 21, "harbor": 22, "moonglowtower": 36, "trinsictemple": 37, "lookouttower": 38, "ballistatower": 39, "guardiantower": 40, "rangertower": 41, "templartower": 42, "pitfalltrap": 43, "barricade": 44, "arcanetrap": 45, "camouflagetrap": 46
			},
			bd: {
/* woodcutter */		"1": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 1},
/* quarry */			"2": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 2},
/* farm */				"3": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 3},
/* cottage */			"4": {"w": [ 0, 0, 0, 0, 200, 500, 1000, 2000, 5000, 12000 ], "s": [ 50, 150, 300, 600, 1000, 2000, 4000, 7500, 14000, 17000 ], "th": 1},
/* marketplace */		"5": {"w": [ 40, 80, 160, 400, 1200, 2800, 5600, 9600, 15200, 23200 ], "s": [ 20, 40, 80, 200, 600, 1400, 2800, 4800, 7600, 11600 ], "th": 5},
/* iron mine */			"6": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 4},
/* sawmill */			"7": {"w": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "s": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "th": 6},
/* mill */				"8": {"w": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "s": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "th": 8},
/* hideout */			"9": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],"s": [ 50, 200, 600, 1000, 1500, 2200, 3500, 4500, 6000, 8000 ], "th": 2},
/* stonemason */		"10": {"w": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "s": [ 60, 150, 350, 1100, 2700, 5000, 7800, 13500, 21500, 33000 ], "th": 7},
/* foundry */			"11": {"w": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "s": [ 60, 150, 350, 1100, 2700, 5000, 8500, 13500, 21500, 33000 ], "th": 9},
/* town hall */			"12": {"w": [ 0, 200, 500, 1000, 3000, 8000, 15000, 30000, 60000, 120000 ], "s": [ 0, 0, 100, 300, 1500, 4000, 10000, 25000, 60000, 120000 ], "th": 0},
/* townhouse */			"13": {"w": [ 0, 0, 0, 0, 1000, 2000, 3500, 7000, 14000, 29000 ], "s": [ 100, 300, 600, 2000, 4000, 7000, 11500, 17000, 24000, 29000 ], "th": 5},
/* barracks */			"14": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ],"s": [ 50, 150, 300, 600, 1200, 2500, 4000, 7000, 11500, 17500 ], "th": 4},
/* city guard house */	"15": {"w": [ 15, 30, 55, 140, 400, 1000, 1900, 3200, 5100, 8000 ], "s": [ 30, 60, 110, 280, 800, 2000, 3800, 6400, 10200, 16000 ], "th": 3},
/* training ground */	"16": {"w": [ 20, 40, 80, 200, 600, 1400, 2800, 4800, 7500, 11500 ], "s": [ 40, 80, 160, 400, 1200, 2800, 5600, 9600, 15000, 23000 ], "th": 4},
/* stable */			"17": {"w": [ 25, 55, 110, 275, 800, 1900, 3750, 6500, 10200, 15500 ], "s": [ 50, 110, 220, 550, 1600, 3800, 7500, 13000, 20400, 31000 ], "th": 6},
/* workshop */			"18": {"w": [ 40, 75, 150, 370, 1100, 2600, 5200, 8900, 14000, 21500 ], "s": [ 80, 150, 300, 740, 2200, 5200, 10400, 17800, 28000, 43000 ], "th": 9},
/* shipyard */			"19": {"w": [ 50, 100, 200, 500, 1500, 3500, 7000, 12000, 19000, 29000 ], "s": [ 100, 200, 400, 1000, 3000, 7000, 14000, 24000, 38000, 58000 ], "th": 10},
/* warehouse */			"20": {"w": [ 60, 150, 250, 500, 1600, 3000, 6000, 9600, 15000, 20000 ], "s": [ 0, 0, 50, 150, 400, 1000, 2000, 4800, 9000, 13000 ], "th": 1},
/* castle */			"21": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 20000, 25000, 30000, 40000, 55000, 75000, 100000, 130000, 160000, 200000 ], "th": 8},
/* harbor */			"22": {"w": [ 80, 160, 320, 800, 2400, 5600, 11200, 19200, 30400, 46400 ], "s": [ 40, 80, 160, 400, 1200, 2800, 5600, 9600, 15200, 23200 ], "th": 10},
/* wall */				"23": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 200, 2000, 8000, 20000, 30000, 45000, 70000, 100000, 140000, 200000 ], "th": 2},
/* moonglow tower */	"36": {"w": [ 30, 60, 120, 300, 900, 2100, 4200, 7200, 11400, 17400 ], "s": [ 60, 120, 240, 600, 1800, 4200, 8400, 14400, 22800, 34800 ], "th": 7},
/* trinsic temple */	"37": {"w": [ 35, 70, 135, 335, 1000, 2350, 4650, 8000, 12700, 19500 ], "s": [ 70, 140, 270, 670, 2000, 4700, 9300, 16000, 25400, 39000 ], "th": 8},
/* lookout tower */		"38": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 200, 400, 600, 1000, 1500, 2200, 3500, 5000, 7500, 10000 ], "th": 2},
/* ballista tower */	"39": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 100, 200, 400, 1000, 3000, 7000, 14000, 24000, 38000, 58000 ], "th": 9},
/* guardian tower */	"40": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 100, 200, 400, 1000, 3000, 7000, 14000, 24000, 38000, 58000 ], "th": 6},
/* ranger tower */		"41": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 100, 200, 400, 1000, 3000, 7000, 14000, 24000, 38000, 58000 ], "th": 3},
/* templar tower */		"42": {"w": [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ], "s": [ 100, 200, 400, 1000, 3000, 7000, 14000, 24000, 38000, 58000 ], "th": 8},
/* pitfall trap */		"43": {"w": [ 30, 60, 110, 280, 830, 1930, 3850, 6600, 10500, 16000 ], "s": [ 90, 180, 330, 840, 2490, 5790, 11550, 19800, 31500, 48000 ], "th": 5},
/* barricade */			"44": {"w": [ 30, 60, 110, 280, 830, 1930, 3850, 6600, 10500, 16000 ], "s": [ 90, 180, 330, 840, 2490, 5790, 11550, 19800, 31500, 48000 ], "th": 7},
/* arcane trap */		"45": {"w": [ 30, 60, 110, 280, 830, 1930, 3850, 6600, 10500, 16000 ], "s": [ 90, 180, 330, 840, 2490, 5790, 11550, 19800, 31500, 48000 ], "th": 8},
/* camouflage trap */	"46": {"w": [ 30, 60, 110, 280, 830, 1930, 3850, 6600, 10500, 16000 ], "s": [ 90, 180, 330, 840, 2490, 5790, 11550, 19800, 31500, 48000 ], "th": 10},
/* woodcutter */		"47": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 1},
/* quarry */			"48": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 2},
/* iron mine */			"49": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 4},
/* farm */				"50": {"w": [ 50, 200, 400, 1400, 3500, 6000, 10000, 16000, 25000, 38000 ], "s": [ 0, 0, 200, 600, 1500, 3000, 5000, 8000, 13000, 20000 ], "th": 3},
			}
		},
		members: {
			app: null,
			chat: null,
			titleW: null,
			cBar: null,
			srvBar: null,
			cInfoView: null,
			cDetView: null,
			dDetView: null,
			ncView: null,
			bDetView: null,
			bPlaceDetView: null,
			bQc: null,
			bQcSpdLab: null,
			bQh: null,
			uQc: null,
			uQh: null,
			city: null,
			cityId: null,
			originalConvertBBCode: null,
			createdTopBottomButtons: null,
			topBottomButtonsListener: null,
			tradeButtonsListener: null,
			temp_limit: null,
			lang: null,
			options: null,
			optionsPage: null,
			layoutWindow: null,
			miniMap: null,
			qtLab: null,
			timer: null,
			lastSendCommand: null,
			sendCommandBuffer: null,
			sendCommandBusy: null,
			reportPage: null,
			reportPageListener: null,
			cTradeInfoView: null,
			getUseBtnVisibility: null,
			getUseCont1: null,
			getUseCont2: null,
			getUseCont3: null,
			cCmdInfoView: null,
			moveBuldingDetView: null,
			initialize: function() {
				if (typeof qx.lang.Json == "undefined")
					qx.lang.Json = qx.util.Json;
				if (typeof webfrontend.ui.SpinnerInt == "undefined")
					webfrontend.ui.SpinnerInt = webfrontend.gui.SpinnerInt;
				
				this.app = qx.core.Init.getApplication();

				this.cInfoView = this.app.cityInfoView;
				
				this.chat = this.app.chat;
				
				this.bQc = this.cInfoView.buildingQueue;
				this.bQh = this.bQc.header;
				this.bQcSpdLab = this.bQc.constructionSpeedLabel;
				
				this.bDetView = this.app.buildingDetailView;
				this.bPlaceDetView = this.app.buildingPlaceDetailView;
				
				this.cDetView = this.app.cityDetailView;
				this.dDetView = this.app.dungeonDetailView;
				this.ncView = this.app.newCityView;
				
				this.titleW = this.app.title;
				this.cBar = this.app.cityBar;
				this.srvBar = this.app.serverBar;
				
				this.lang = qx.locale.Manager.getInstance().getLocale();
				if (!/en|de|es|pl|pt|pt_BR|ru|it/.test(this.lang)) this.lang = "en";
				
				this.createdTopBottomButtons = 0;
				this.getUseBtnVisibility = "visible";
				
				this.timer = qx.util.TimerManager.getInstance();
				this.lastSendCommand = 0;
				this.sendCommandBuffer = new Array();
				this.sendCommandBusy = false;
				civ_ch = this.cInfoView.container.getChildren();
				for (i=0; i<civ_ch.length; i++) {
					if (civ_ch[i] instanceof webfrontend.gui.CityTradeInfoView)
						this.cTradeInfoView = civ_ch[i];
				}
				this.moveBuildingDetView = this.app.getMoveBuildingDetailView();
				this.tweakLoU();
			},
			tweakLoU: function() {
	try {
				_LT = LT;
				this.loadOptions();
				if (this.options.userLang == "") this.options.userLang = this.lang;
				else this.setLang(this.options.userLang);
				LT.options = this.options;
				LT.srvTime = webfrontend.data.ServerTime.getInstance().refTime; // reference time (server start date in milisec?)
				LT.debug = this.debug;
				LT.thSep = this.thSep;
				LT.a = this.app;
				LT.main = this;
				
				this.miniMap = new window.louTweak.miniMap();
				if (!this.app.selectorBar.isMapSelectorBarAnchorToLeft()) {
					this.app.desktop.add(this.miniMap.clientArea, {right: 0, top: 133});
				} else {
					this.app.desktop.add(this.miniMap.clientArea, {right: 0, top: 62});
				}
				if (!LT.options.showMiniMap)
					LT.main.miniMap.clientArea.setVisibility("excluded");
		
				this.app.visMain.addListener("changeMapLoaded", this.miniMap.updateCameraPos, this.miniMap);
				webfrontend.data.City.getInstance().addListener("changeVersion", this.miniMap.updateCameraPos, this.miniMap); // hack to redraw map in region view while switching cities
				qx.bom.Element.addListener(this.app.worldView, "mouseup", LT.main.miniMap.updateCameraPos, this.miniMap);
				
				// ***** Options button ***** //
				btn = new qx.ui.form.Button("O");
				btn.set({width: 30, appearance: "button-text-small", toolTipText: L("options_btn_tt")});
				btn.addListener("click", this.showOptionsPage, this);
				this.srvBar.add(btn, {top: 2, left: 390});
				
				// ***** City layout button ***** //
				btn = new qx.ui.form.Button("L");
				btn.set({width: 25, appearance: "button-text-small", toolTipText: L("layout_btn_tt")});
				btn.addListener("click", function(){this.layoutWindow.generateSharestring(); this.layoutWindow.open();}, this);
				this.bQh.add(btn, {top: 33, left: 305});
				// make the button disabled if in region view
				this.app.visMain.addListener("changeMapLoaded", function() { this.setEnabled(LT.a.visMain.mapmode == "c" ? true : false); }, btn);
				
				// ***** Purify resources window button ***** //
				btn = new qx.ui.form.Button("P");
				btn.set({width: 25, appearance: "button-text-small", toolTipText: L("purify_btn_tt")});
				btn.addListener("click", this.showPurifyWindow, this);
				this.bQh.add(btn, {top: 33, left: 275});
				
				// ***** Show 'Get & use' buttons ***** //
				btn = new qx.ui.form.Button("A");
				btn.set({width: 25, appearance: "button-text-small", toolTipText: L("show_get_use_btn_tt"), visibility: "excluded"});
				btn.addListener("click", function() {
					if (this.getUseBtnVisibility == "visible")
						this.getUseBtnVisibility = "excluded";
					else
						this.getUseBtnVisibility = "visible";
					this.showGetUseButtons();
				}, this);
				this.bQh.add(btn, {top: 33, left: 8});
				this.app.setUserData("showGetUseBtn", btn);

				// ***** 'Show/Hide Trade Summary labels' button ***** //
				btn = new qx.ui.form.Button(null, "webfrontend/theme/scrollbar/scrollbar-up.png");
				btn.set({width: 30, height: 20, appearance: "button-brown-sort", toolTipText: L("btn_trade_hide")});
				btn.addListener("click", function() {
					if (LT.main.cTradeInfoView._getChildren()[2].getVisibility() == "visible") {
						LT.main.cTradeInfoView._getChildren()[2].setVisibility("excluded");
						this.set({toolTipText: L("btn_trade_show"), icon: "webfrontend/theme/scrollbar/scrollbar-down.png"});
					} else {
						LT.main.cTradeInfoView._getChildren()[2].setVisibility('visible');
						this.set({toolTipText: L("btn_trade_hide"), icon: "webfrontend/theme/scrollbar/scrollbar-up.png"});
					}
				}, btn);
				LT.main.cTradeInfoView._getChildren()[0].add(btn, {top: 7, left: 140});

				
				// ***** 'Show/Hide Support Container' button ***** //
				civ_cont = this.cInfoView.container.getChildren();
				for (i=0; i<civ_cont.length; i++) {
					if (civ_cont[i].basename == "CityCommandInfoView") {
						this.cCmdInfoView = civ_cont[i];
						break;
					}
				}
				btn = new qx.ui.form.Button(null, "webfrontend/theme/scrollbar/scrollbar-up.png");
				btn.set({width: 30, height: 20, appearance: "button-brown-sort", toolTipText: L("btn_support_hide")});
				btn.addListener("click", function() {
					if (LT.main.cCmdInfoView.supports.getVisibility() == "visible") {
						LT.main.cCmdInfoView.supports.setVisibility("excluded");
						this.set({toolTipText: L("btn_support_show"), icon: "webfrontend/theme/scrollbar/scrollbar-down.png"});
					} else {
						LT.main.cCmdInfoView.supports.setVisibility('visible');
						this.set({toolTipText: L("btn_support_hide"), icon: "webfrontend/theme/scrollbar/scrollbar-up.png"});
					}
				}, btn);
				this.cCmdInfoView.supportHeaderData.header.add(btn, {top: 7, left: 210});

				// ***** BBCode buttons in chat window ***** //
				cont = new qx.ui.container.Composite(new qx.ui.layout.Grid());

				btns = [
					{lab: L("chat_btn_city"), func: this.parseCoords},
					{lab: L("chat_btn_player"), func: function() {this.parseText("player")}},
					{lab: L("chat_btn_alliance"), func: function() {this.parseText("alliance")}},
					{lab: L("chat_btn_url"), func: function() {this.parseText("url")}}
				];
				for (i=0; i<btns.length; i++) {
					btn = new qx.ui.form.Button(btns[i].lab).set({appearance: "button-text-small", padding: [0,3,0,3]});
					btn.addListener("click", btns[i].func, this);
					cont.add(btn, {row: Math.floor(i/2), column: i%2});
				}
				this.chat.add(cont, {top: 0, left: 275});

				// ***** Copy City Coords To Chat buttons ***** //
				btn = new qx.ui.form.Button(L("copy_coords_btn")).set({maxWidth:160, height: 32, alignX: "center", paddingLeft: 2, paddingRight: 2});
					btn.addListener("click", function() {this.copyCoordsToChat("c")}, this);
				this.cDetView.actionArea.add(btn, {left:86, top: 130});
				btn = new qx.ui.form.Button(L("copy_coords_btn")).set({width:160, height: 32, paddingLeft: 2, paddingRight: 2});
					btn.addListener("click", function() {this.copyCoordsToChat("d")}, this);
				this.dDetView.actionArea.add(btn, {left:86, top: 110});
				btn = new qx.ui.form.Button(L("copy_coords_btn")).set({maxWidth:160, height: 32, alignX: "center", paddingLeft: 2, paddingRight: 2});
					btn.addListener("click", function() {this.copyCoordsToChat("n")}, this);
				this.ncView.container.add(new qx.ui.core.Spacer(0,30));
				this.ncView.container.add(btn);

				// ***** Queue times label ***** //
				this.qtLab = new window.louTweak.queueTimesLabel();
				if (this.app.selectorBar.isMapSelectorBarAnchorToLeft()) {
					this.app.desktop.add(this.qtLab.queueTimeCont, {left: 690, top: 65});
				} else {
					this.app.desktop.add(this.qtLab.queueTimeCont, {left: 405, top: 65});
				}
		
				// ***** Incoming resources label ***** //
				lab = new window.louTweak.incomingResourcesLabel();
				this.bQc.getLayoutParent().addBefore(lab.incResCont, this.bQc);

				// ***** Switch to ally tab on start ***** //
				if (this.options.switchToAllyTab)
					this.chat.tabView.setSelection([this.chat.tabView.getChildren()[1]]);

				// ***** Listeners ***** //
				// app keyboard
				this.app.mainContainer.addListener("keypress", this.appPerformAction, this);
				// scene keyboard
				this.app.visMain.scene.getOutputWidget().addListener("keypress", this.scenePerformAction, this);
		
				webfrontend.data.City.getInstance().addListener("changeVersion", this.countUpgradeable, this);

				webfrontend.data.City.getInstance().addListener("changeVersion", this.showGetUseButtons, this);
				this.cInfoView.addListener("appear", this.showGetUseButtons, this);
				if (this.cInfoView.quickUseBuildingItemBtn != null) {
					this.cInfoView.quickUseBuildingItemBtn.addListener("appear", this.showGetUseButtons, this);
				} else {
					for (var p in this.cInfoView) {
						if (this.cInfoView[p] != null && (this.cInfoView[p].basename == "SoundButton" || this.cInfoView[p].basename == "QuickUseButton")) {
							if (this.cInfoView[p].getAppearance() == "button-quickuse") {
								glp = this.cInfoView[p].getLayoutParent();
								if (this.getUseCont1 == null) {
									this.getUseCont1 = glp;
									continue;
								}
								if (this.getUseCont2 == null) {
									if (this.getUseCont1 != glp) {
										this.getUseCont2 = glp;
									}
									continue;
								}
								if (this.getUseCont2 != glp && this.getUseCont3 == null) {
									this.getUseCont3 = glp;
									break;
								}
							}
						}
					}
				}

				//this.topBottomButtonsListener = webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateTopBottomButtons, this);
				this.tradeButtonsListener = webfrontend.base.Timer.getInstance().addListener("uiTick", this.createTradeButtons, this);
				webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateMiniMapButton, this);
				this.reportPageListener = this.app.getReportPage().reportBody.addListenerOnce("addChildWidget", this.tweakReport, this);
				
				// ***** Chat colors ***** //
				chatIns = webfrontend.config.Config.getInstance().getChat();
				chatIns.channelColors.global = this.options.chatColors[0];
				chatIns.channelColors._a = this.options.chatColors[1];
				chatIns.channelColors.privatein = this.options.chatColors[3];
				chatIns.channelColors.privateout = this.options.chatColors[4];
				chatIns.channelColors.social = this.options.chatColors[5];
				chatIns.channelColors.LoUWin = this.options.chatColors[6];
				chatIns.setMaxLines(this.options.chatMaxLines);
				
				this.chat.BgrLabel.setBackgroundColor(this.options.chatColors[2]);
				this.chat.BgrLabel.setOpacity((parseInt(this.options.chatOpacity))/100);

				this.tweakInterface();

				this.optionsPage = new window.louTweak.optionsPage();
				this.layoutWindow = new window.louTweak.layoutWindow();

				this.app.visMain.addListener("changeMapLoaded", function(){this.tabView.setSelection([this.tabView.getChildren()[0]]); this.win.close(); this.showOverlayLayout();}, this.layoutWindow);
				this.getCity();
				//
				
				this.originalConvertBBCode = webfrontend.gui.Util.convertBBCode;
				webfrontend.gui.Util.convertBBCode = this.newConvertBBCode;
	} catch (e) {
		console.log(e);
	}
			},
			appPerformAction: function(e) {
				if (!this.app.allowHotKey || this.bDetView.visBuilding != null || this.bPlaceDetView.active || this.app.currentOverlay != null || this.app.cityBar.citiesSelect.getSelectables()[0].getLayoutParent().getLayoutParent().getLayoutParent().getLayoutParent().isVisible()) {
					return;
				}
				key = e.getKeyIdentifier();
				if (key == "") return;
				shft = e.isShiftPressed();
				ctrl = e.isCtrlPressed();
				
				if (key == this.options.hotkeys.global.prevcity)
					this.cBar.prevButton.execute();
				else if (key == this.options.hotkeys.global.nextcity)
					this.cBar.nextButton.execute();
				
				if (this.app.visMain.mapmode != "c" || this.sendCommandBusy) return;
				switch (key) {
					case 'T':
						this.upgradeLowestLevelBuilding("T", shft);
						break;
					case 'N':
						this.upgradeLowestLevelBuilding("M", shft);
						break;
					case 'B':
						this.upgradeLowestLevelBuilding("B", shft);
						break;
					case 'C':
						this.upgradeLowestLevelBuilding("C", shft);
						break;
					case 'L':
						this.upgradeLowestLevelBuilding("A", shft);
						break;
					case 'E':
						this.upgradeLowestLevelBuilding("R", shft);
						break;
					case 'U':
						this.upgradeLowestLevelBuilding("U", shft);
						break;
					case 'Q':
						if (shft)
							this.upgradeLowestLevelBuilding("F", false);
						break;
					case 'A':
						if (shft)
							this.upgradeLowestLevelBuilding("F", true);
						break;
					default:
						return;
				}
			},
			scenePerformAction: function(e) {
				if (this.app.visMain.mapmode != "c" || this.sendCommandBusy) return;
				
				key = e.getKeyIdentifier();
				shft = e.isShiftPressed();

				if (this.moveBuildingDetView.active && this.moveBuildingDetView.placeId != null) {
					this.moveBuildingDetView._onMoveBuildingQuickUse();
					return;
				}
				if (!this.bDetView.visBuilding) {
					if (this.bPlaceDetView.active) {
						if (/\b(27|28|29|30|60|61|62|63)\b/.test(this.bPlaceDetView.buildingType) && key == this.options.hotkeys.upgrades.downgrade) {
							this.bPlaceDetView.downgradeButton.execute(); // destroy resource
							return;
						} else {
							for (var i in this.options.hotkeys.build) {
								if (this.options.hotkeys.build[i] == key) {
									_bid = this.self(arguments).lou_building_id[i];
									if (this.bPlaceDetView.buildingInfo[_bid].canBuild) {
										this.cityObject("Build", this.bPlaceDetView.placeId, _bid, 1, false);
										return;
									}
								}
							}
						}
					}
				}
				if (this.bDetView.visBuilding) {
				try {
					_bid = this.bDetView.visBuilding.getId();
					_ind = this.getIndex(_bid);
					if (_ind == -1) return;
					_btype = this.city[_ind][2];
					if (/\b(27|28|29|30|60|61|62|63)\b/.test(_btype)) return;
					_blvl = this.city[_ind][1];
					if (_blvl < 0) return;
					if (/\b(1|2|3|4|5|6|7|8|9)\b/.test(key)) {
						if (this.isAssignedToMinister(_bid)) return;
						_ups = (RegExp.$1 == "1" ? 10 - _blvl : parseInt(RegExp.$1) - _blvl);
						if (_ups <= 0) return;
						au = this.availUpgrades(_btype, _blvl, _ups);
						this.cityObject("UpgradeBuilding", _bid, _btype, au, false);
						return;
					}
					au = 10;
					_ups = shft ? au - _blvl : 1;
					if (key != this.options.hotkeys.upgrades.minister) {
						if (this.isAssignedToMinister(_bid)) return;
						au = this.availUpgrades(_btype, _blvl, _ups);
					} else
						au = _ups;
					switch (key) {
						case this.options.hotkeys.upgrades.upgrade:
							this.cityObject("UpgradeBuilding", _bid, _btype, au, false);
							break;
						case this.options.hotkeys.upgrades.downgrade:
							au = shft ? 10 : 1;
							this.cityObject("DowngradeBuilding", _bid, _btype, au, false);
							break;
						case this.options.hotkeys.upgrades.minister:
							this.cityObject("UpgradeBuilding", _bid, _btype, au, true);
							break;
						case 'M':
							this.bDetView.quMoveBuilding.btn.execute();
							break;
						default:
							return;
					}
				} catch (e) { LT.debug(e); }
			}
			},
			cityObject: function(_action, _buildingId, _buildingType, _upgrades, _minister) {
				if (_upgrades <= 0) return;

				bqmax = webfrontend.data.Player.getInstance().getMaxBuildQueueSize();
				bqcur = webfrontend.data.City.getInstance().buildQueue;
				bqcur = (bqcur != null) ? bqcur.length : 0;
				freeSlots = bqmax - bqcur;
				if (freeSlots == 0) return;
				if (freeSlots < _upgrades && _action != "DowngradeBuilding") _upgrades = freeSlots;
				
				if (_action == "Build") {
					if (_buildingType == 21 && this.bPlaceDetView.active) {
						this.bPlaceDetView.buildingType = 21;
						this.bPlaceDetView._onClickBuild();
						return;
					}
					_action = "UpgradeBuilding";
				}
				
				if (_action == "DowngradeBuilding" && _upgrades == 10) {
					_action = "DemolishBuilding";
					_upgrades = 1;
				}
				_cid = webfrontend.data.City.getInstance().getId()
				for (o=0; o<_upgrades; o++) {
					//console.log({a:_action, p:{cityid: _cid, buildingid: _buildingId, buildingType: _buildingType, isPaid: !_minister}});
					this.sendCommandBuffer.push({a:_action, p:{cityid: _cid, buildingid: _buildingId, buildingType: _buildingType, isPaid: !_minister}});
				}
				if (!this.sendcommandBusy) {
					this.sendCommandBusy = true;
					this.sendCmd();
				}
			},
			sendCmd: function() {
				if (this.sendCommandBuffer.length == 0) {
					this.sendCommandBusy = false;
					return;
				}
				currentTime = new Date().getTime();
				if (currentTime > this.lastSendCommand+500) {
					cmd = this.sendCommandBuffer.shift();
					//LT.debug(cmd.a + ", " + cmd.p);
					webfrontend.net.CommandManager.getInstance().sendCommand(cmd.a, cmd.p, this, function(){});
					this.lastSendCommand = currentTime;
				}
				this.timer.start(this.sendCmd, null, this, null, 250);
			},
			availUpgrades: function(bt, bl, bu) {
				c = webfrontend.data.City.getInstance();
				th = c.getTownhallLevel();
				if (this.self(arguments).bd[bt].th > th)
					return 0;
				wood = c.getResourceCount(1);
				stone = c.getResourceCount(2);
				u = 0;
				while (bu > 0) {
					wn = this.self(arguments).bd[bt].w[bl];
					sn = this.self(arguments).bd[bt].s[bl];
					if (wn > wood || sn > stone) break;
					wood -= wn;
					stone -= sn;
					u++;
					bl++;
					bu--;
				}
				return u;
			},
			isAssignedToMinister: function(bid) {
				cBuildQueue = webfrontend.data.City.getInstance().getBuildQueue();
				if (cBuildQueue != null) {
					for (m=0; m<cBuildQueue.length; m++) {
						if (cBuildQueue[m].building == bid && cBuildQueue[m].isPaid == false) return true;
					}
				}
				return false;
			},
			upgradeLowestLevelBuilding: function(_type, _minis) {
				if (this.app.visMain.mapmode != "c") return;

				c = webfrontend.data.City.getInstance();
				tw = parseInt(c.getResourceCount(1));
				ts = parseInt(c.getResourceCount(2));
				bqmax = webfrontend.data.Player.getInstance().getMaxBuildQueueSize();
				bqcur = c.buildQueue;
				bqcur = (bqcur != null) ? bqcur.length : 0;
				freeS = bqmax - bqcur;
				if (freeS == 0) return;
				
				buildingTypes = {
					"T":"|38|39|40|41|42|43|44|45|46|",
					"M":"|15|16|17|18|19|21|36|37|",
					"R":"|1|2|3|6|47|48|49|50|",
					"C":"|4|",
					"B":"|14|",
					"U":"|5|7|8|9|10|11|12|13|20|22|",
					"A":"|"+this.options.lowestLevelUpgradeIDs.join("|")+(this.options.lowestLevelUpgradeIDs[0] != "" ? "|1" : "")+(this.options.lowestLevelUpgradeIDs[1] != "" ? "|2" : "")+(this.options.lowestLevelUpgradeIDs[2] != "" ? "|3" : "")+(this.options.lowestLevelUpgradeIDs[5] != "" ? "|6" : "")+"|"
				};
				maxLvls = {
					"T":this.options.lowestLevelMax[0],
					"M":this.options.lowestLevelMax[1],
					"R":this.options.lowestLevelMax[2],
					"C":this.options.lowestLevelMax[3],
					"B":this.options.lowestLevelMax[4],
					"U":this.options.lowestLevelMax[5]
				}
				if (_type != "F") freeS = 1;
				if (_type == "F") _type = "A";
				_bTable = this.getValidBuildings(buildingTypes[_type]);
				ud = {"wl":tw, "sl":ts,"a":[]};
				for (j=0; j<freeS; j++) {
					_bTable.sort(function(a,b){return a[1]-b[1];});
					_bType = "";
					for (i=0; i<_bTable.length; i++) {
						if (_type == "A") {
							for (var b in buildingTypes) {
								if (b == "A") continue;
								if (buildingTypes[b].indexOf("|" + _bTable[i][2] + "|") != -1) _bType = b;
							}
							if (buildingTypes["A"].indexOf("|" + _bTable[i][2] + "|") != -1 && _bTable[i][1] >= maxLvls[_bType])
								continue;
							if (_bTable[i][2] == 23 && _bTable[i][1] >= 10)
								continue;
						}
						if (buildingTypes[_type].indexOf("|" + _bTable[i][2] + "|") != -1) {
							if (!_minis) {
								if (this.isAssignedToMinister(_bTable[i][0])) continue;
								wn = this.self(arguments).bd[_bTable[i][2]].w[_bTable[i][1]];
								sn = this.self(arguments).bd[_bTable[i][2]].s[_bTable[i][1]];
								if (wn > ud.wl || sn > ud.sl) continue;
								ud.wl -= wn;
								ud.sl -= sn;
							}
							ud.a.push([_bTable[i][0], _bTable[i][2], _minis]);
							_bTable[i][1] += 1;
							break;
						}
					}
				}
				for (i=0; i<ud.a.length; i++) {
					this.cityObject("UpgradeBuilding", ud.a[i][0], ud.a[i][1], 1, ud.a[i][2]);
				}
			},
			getValidBuildings: function(_ids) {
				c = webfrontend.data.City.getInstance();
				th = c.getTownhallLevel();
				this.getCity();
				_arr = new Array();
				_wallIn = false;
				for (k=0; k<this.city.length; k++) {
					if (_ids.indexOf("|" + this.city[k][2] + "|") != -1 && this.city[k][1] < 10 && this.city[k][1] > -1) {
						if ((_wallIn && this.city[k][2] == 23) || this.self(arguments).bd[this.city[k][2]].th > th)
							continue;
						_arr.push(this.city[k]);
						if (this.city[k][2] == 23)
							_wallIn = true;
					}
				}
				return _arr;
			},
			getCity: function() {
				if (LT.a.visMain.mapmode != "c") return;
				_cells = LT.a.visMain.cells;
				if (!_cells[0]) {
					window.setTimeout(function(){LT.main.getCity()}, 250);
					return;
				}
				_cgi = webfrontend.data.City.getInstance();
				waterCity = _cgi.getOnWater();

				_se = new Array();
				for (var _c in _cells) {
					_cell = _cells[_c].entities;
					for (var d in _cell) {
						if (_cell[d].basename != "CityWallLevel" && _cell[d].basename != "CityObject") {
							if (_cell[d].selectNode2 != null && _cell[d].selectNode3 != null) {
								if (_cell[d].selectNode.getY() < 880) {
									_se.push([_cell[d], _cell[d].selectNode2.getY()*256+_cell[d].selectNode2.getX()+1, _cell[d].visId]);
								} else {
									_se.push([_cell[d], _cell[d].selectNode3.getY()*256+_cell[d].selectNode3.getX()+1, _cell[d].visId]);
								}
								_se.push([_cell[d], _cell[d].selectNode.getY()*256+_cell[d].selectNode.getX(), _cell[d].visId]);
								_se.push([_cell[d], _cell[d].selectNode.getY()*256+_cell[d].selectNode.getX()+1, _cell[d].visId]);
								_se.push([_cell[d], _cell[d].selectNode2.getY()*256+_cell[d].selectNode2.getX(), _cell[d].visId]);
								_se.push([_cell[d], _cell[d].selectNode3.getY()*256+_cell[d].selectNode3.getX(), _cell[d].visId]);
							} else {
								if (_cell[d].getType) {
									if (_cell[d].getType() > 51 && _cell[d].getType() < 60) {
										_se.push([_cell[d], _cell[d].selectNode.getY()*256+_cell[d].selectNode.getX()+1, _cell[d].visId]);
										_se.push([_cell[d], _cell[d].selectNode.getY()*256+_cell[d].selectNode.getX()+2, _cell[d].visId]);
										_se.push([_cell[d], (_cell[d].selectNode.getY()+80)*256+_cell[d].selectNode.getX(), _cell[d].visId]);
										_se.push([_cell[d], (_cell[d].selectNode.getY()+80)*256+_cell[d].selectNode.getX()+1, _cell[d].visId]);
										_se.push([_cell[d], (_cell[d].selectNode.getY()+80)*256+_cell[d].selectNode.getX()+2, _cell[d].visId]);
										_se.push([_cell[d], (_cell[d].selectNode.getY()+160)*256+_cell[d].selectNode.getX(), _cell[d].visId]);
										_se.push([_cell[d], (_cell[d].selectNode.getY()+160)*256+_cell[d].selectNode.getX()+1, _cell[d].visId]);
										_se.push([_cell[d], (_cell[d].selectNode.getY()+160)*256+_cell[d].selectNode.getX()+2, _cell[d].visId]);
									}
								}
								_se.push([_cell[d], _cell[d].selectNode.getY()*256+_cell[d].selectNode.getX(), _cell[d].visId]);
							}
						}
					}
				}

				_se.sort(function(a,b){return a[1]-b[1];});

				this.city = new Array(441);
				_empty = [0, 1, 19, 20, 21, 41, 399, 419, 420, 421, 439, 440];
				_water = [352, 353, 373, 374, 375, 395, 396, 397, 398, 417, 418, 438];

				for (i=0; i<this.city.length; i++) this.city[i] = null;

				for (i=0; i<_empty.length; i++)	this.city[_empty[i]] = [-1, -1, -1]; // [buildingID/placeID, buildingLvl, buildingType]

				if (waterCity) {
					for (i=0; i<_water.length; i++) this.city[_water[i]] = [-1, -1, -2];
				}

				try {
					for (i=0, c=0; i<_se.length; i++) {
						while(this.city[c] != null) c++;
						if (_se[i][0].getResType != undefined)
							this.city[c] = [_se[i][0].getId(), 0, _se[i][0].getResType()+900]; // resource node
						else if (_se[i][0].getType != undefined) {
							if (_se[i][0].getLevel != undefined) // building
								this.city[c] = [_se[i][0].getId(), _se[i][0].getLevel()+LT.main.checkBuilding(_se[i][0].getId()), _se[i][0].getType()];
							else
								this.city[c] = [_se[i][0].getId(), _cgi.getWallLevel()+LT.main.checkBuilding("wall"), _se[i][0].getType()]; // wall
						} else if (_se[i][0].getPlaceId != undefined) {
							if (_se[i][0].drawNode != null) {
								if (_se[i][0].drawNode.image != undefined) {
									if (_se[i][0].drawNode.image.indexOf("tower") != -1) {
										this.city[c] = [_se[i][0].getPlaceId(), 0, 99]; // tower place
									} else {
										this.city[c] = [_se[i][0].getPlaceId(), 0, 98]; // empty, can be corn field
									}
								} else if (_se[i][0].drawNode.basename == "EffectNode") {
									this.city[c] = [_se[i][0].getPlaceId(), 0, 99]; // ??? bottom left tower in water city
								}
							} else {
								if (waterCity && /\b(331|332|351|354|372|376|394|416)\b/.test(c)) {
									this.city[c] = [_se[i][0].getPlaceId(), 0, 97]; // water building place
								} else {
									this.city[c] = [_se[i][0].getPlaceId(), 0, 98]; // empty
								}
							}
						}
					}

				for (i=0; i<this.city.length; i++) {
					if (this.city[i] == null) {
						this.city = new Array(441);
						window.setTimeout(function(){LT.main.getCity()}, 1000);
						return;
					}
				}

				LT.main.cityId = _cgi.getId();
				LT.city = this.city;
				} catch (e) { LT.debug(e); }
			},
			checkBuilding: function(_buildingId) {
				try {
					cBuildQueue = webfrontend.data.City.getInstance().getBuildQueue();
					d = 0;
					if (cBuildQueue != null) {
						for (j=0; j<cBuildQueue.length; j++) {
							if (cBuildQueue[j].building == _buildingId && (cBuildQueue[j].state == 2 || cBuildQueue[j].state == 5)) return -11; // single downgrade / full demolish
							if (cBuildQueue[j].building == _buildingId) d++;
							if (cBuildQueue[j].type == 23 && _buildingId == "wall") d++; // is city wall on queue?
						}
					}
				} catch(e) { LT.debug(e); }
				return d;
			},
			getIndex: function(_buildingId) {
				this.getCity();
				for (i=0; i<this.city.length; i++) {
					if (this.city[i][0] == _buildingId) return i;
				}
				return -1;
			},
			countUpgradeable: function() {
				if (this.app.visMain.getBuildings().length == 0) {
					window.setTimeout(function(){LT.main.countUpgradeable()}, 1500);
					return;
				}
				this.getCity();

				_upCount = 0;
				_wallLvl = 0;
				_palaceLvl = 0;
				for (i=0; i<this.city.length; i++) {
					if (this.city[i] == null) {
						this.getCity();
						window.setTimeout(function(){LT.main.countUpgradeable()}, 250);
						return;
					}
					if (this.city[i][1] > -1 && this.city[i][1] < 10 && !/\b(-1|-2|23|27|28|29|30|60|61|62|63|900|901|902|903|904|905|906|907|97|98|99)\b/.test(this.city[i][2]) && !(this.city[i][2] > 52 && this.city[i][2] < 60)) _upCount++;
					else if (this.city[i][2] == 23) _wallLvl = this.city[i][1];
					else if (this.city[i][2] > 51 && this.city[i][2] < 60) _palaceLvl = this.city[i][1];
				}
				if (_wallLvl < 10) _upCount++;
				if (_palaceLvl > 0 && _palaceLvl < 10) _upCount++;
				_cba = _cgi.getBuildingLimit() - _cgi.getBuildingCount();
				if (this.bQc.buildingSlotsTooltip.getLabel().indexOf("LT_cUp") == -1) {
					this.bQc.buildingSlotsValue.setValue(_cba + " (" + _upCount + ")");
					_ctxt = '</tr><tr><td id="LT_cUp">' + L("up_count_tt") + '</td><td>' + _upCount + '</td></tr></table>';
					_ttxt = LT.main.bQc.buildingSlotsTooltip.getLabel().replace("</tr></table>", _ctxt);
					this.bQc.buildingSlotsTooltip.setLabel(_ttxt);
				}
			},
			parseCoords: function() {
				tag = (this.lang != "de") ? "city" : "stadt";
				if (this.chat.chatLine.getValue() == null) this.chat.chatLine.setValue("");
				re = new RegExp("\\b(\\d{1,3}\\:\\d{1,3})(?!\\[\\\/" + tag + "\\])\\b", "g");
				if (this.chat.chatLine.getValue().match(re)) {
					this.chat.chatLine.setValue(this.chat.chatLine.getValue().replace(re, "[" + tag + "]$1[/" + tag + "]"));
					this.chat.chatLine.focus();
				} else {
					pos = this.chat.chatLine.getValue().length + tag.length + 3;
					this.chat.chatLine.setValue(this.chat.chatLine.getValue() + " " + "[" + tag + "][/" + tag + "]");
					this.chat.chatLine.focus();
					this.chat.chatLine.setTextSelection(pos, pos);
				}
			},
			parseText: function(txt) {
				if (this.lang == "de") {
					if (txt == "player") txt = "spieler";
					if (txt == "alliance") txt = "allianz";
				}
				
				if (this.chat.chatLine.getValue() == null) this.chat.chatLine.setValue("");
				cs = this.chat.chatLine.getTextSelection();
				ss = this.chat.chatLine.getTextSelectionStart();
				se = this.chat.chatLine.getTextSelectionEnd();
				if (cs != "") {
					this.chat.chatLine.setValue(this.chat.chatLine.getValue().substring(0, ss) + "[" + txt + "]" + cs + "[/" + txt + "]" + this.chat.chatLine.getValue().substring(se));
					this.chat.chatLine.focus();
				} else {
					pos = this.chat.chatLine.getValue().length + txt.length + 3;
					this.chat.chatLine.setValue(this.chat.chatLine.getValue() + " " + "[" + txt + "][/" + txt + "]");
					this.chat.chatLine.focus();
					this.chat.chatLine.setTextSelection(pos, pos);
				}
			},
			newConvertBBCode: function (D,E,F) {
				if (LT.options.cityTag == 1) {
					if (LT.main.getLang() != 1)
						D = D.replace(/\[city\]([0-9]*?)\:([0-9]*?)\[\/city\]/g, '<a href=# style="color: #1d79ff" onClick="qx.core.Init.getApplication().setMainView(\'r\', 0, $1*128, $2*80)">$1:$2</a>');
					if (LT.main.getLang() == 1)
						D = D.replace(/\[stadt\]([0-9]*?)\:([0-9]*?)\[\/stadt\]/g, '<a href=# style="color: #1d79ff" onClick="qx.core.Init.getApplication().setMainView(\'r\', 0, $1*128, $2*80)">$1:$2</a>');
				}
				D = LT.main.originalConvertBBCode(D,E,F);
				return D;
			},
			tweakInterface: function() {
				this.titleW.pointsLabel.setWidth(50);
				this.titleW.manaLabel.setLayoutProperties({left: 630});
				this.titleW.manaIcon.setLayoutProperties({left: 607})
				this.titleW.goldLabel.setWidth(110);
				this.bQc.sortButtonCont.setLayoutProperties({left: 200});
			},
			tweakReport: function() {
				children = this.app.getReportPage().reportBody.getChildren();
				if (children.length != 0 && typeof children[0].getValue != 'undefined') {
					if (qx.event.Registration.serializeListeners(children[0]).length != 0) return;
					children[0].addListener("click", function() {
						labValue = this.app.getReportPage().reportBody.getChildren()[0].getValue();
						reportId = labValue.match(/[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}/)[0];
						if (!reportId) return;
						if (this.chat.chatLine.getValue() == null) this.chat.chatLine.setValue("");
						this.chat.chatLine.setValue(this.chat.chatLine.getValue() + " " + "[report]" + reportId + "[/report]");
					}, this);
					children[0].addListener("disappear", function() {
						this.app.getReportPage().reportBody.addListenerOnce("addChildWidget", this.tweakReport, this);
					}, this);
					children[0].set({cursor: "pointer"});
				}
			},
			copyCoordsToChat: function(v) {
				posX = posY = 0;
				if (v == "c") {
					if (typeof this.cDetView.city.get_Coordinates == "undefined") {
						posX = this.cDetView.city.getPosX(); posY = this.cDetView.city.getPosY();
					} else {
						ctid = this.cDetView.city.get_Coordinates(); posX = ctid & 0xFFFF; posY = ctid >> 16;
					}
				}
				else if (v == "d") {
					if (typeof this.dDetView.city.get_Coordinates == "undefined") {
						posX = this.dDetView.city.getPosX(); posY = this.dDetView.city.getPosY();
					} else {
						did = this.dDetView.city.get_Coordinates(); posX = did & 0xFFFF; posY = did >> 16;
					}
				}
				else if (v == "n") { posX = this.ncView.cityPosX; posY = this.ncView.cityPosY; }
				//ctag = (this.lang != "de") ? "city" : "stadt";
				ctag = "coords";
				ccl = this.chat.chatLine.getValue();
				if (ccl == null) { this.chat.chatLine.setValue(""); ccl = ""; }
				if (posX >= 0 && posX <= 9) posX = "00" + posX;
				else if (posX > 9 && posX < 100) posX = "0" + posX;
				if (posY >= 0 && posY <= 9) posY = "00" + posY;
				else if (posY > 9 && posY < 100) posY = "0" + posY;
				this.chat.chatLine.setValue(ccl + " " + "[" + ctag + "]" + posX + ":" + posY + "[/" + ctag + "]");
			},
			showPurifyWindow: function() {
				if (webfrontend.data.City.getInstance().getCanPurifyResources()) {
					var g = this.app.getTradeWidget();
					g.setTab(5);
					this.app.switchOverlay(g);
					return;
				}
			},
			updateTopBottomButtons: function() {
				_j = this.bQc.getJobs();
				for (i=1; i<_j.length; i++) {
					if (_j[i].getUserData("Warnings") == 0) {
						if (i > 1) {
							bTop = _j[i].getUserData("top");
							bTop.set({width: 25, label: "T"});
							_j[i].getLayout()._getLayoutChildren()[0]._add(bTop, {left: 153, top: 26});
						}
						if (i >= 1 && i < _j.length-1) {
							bBottom = _j[i].getUserData("bottom");
							bBottom.set({width: 25, label: "B"});
							_j[i].getLayout()._getLayoutChildren()[0]._add(bBottom, {left: 238, top: 26});						
						}
						_j[i].getUserData("payButton").setLayoutProperties({left: 89, width: 16});
					}
				}
			},
			updateMiniMapButton: function() {
				if (typeof this.app.selectorBar.isMapSelectorBarAnchorToLeft != 'undefined') {
					if (!this.app.selectorBar.isMapSelectorBarAnchorToLeft()) {
						if (this.app.selectorBar.contNavigationRose.isVisible())
							this.miniMap.clientArea.setLayoutProperties({right:0, top: 260});
						else
							this.miniMap.clientArea.setLayoutProperties({right: 0, top: 133});
					} else {
						this.miniMap.clientArea.setLayoutProperties({right: 0, top: 62});
					}
				}
			},
			showGetUseButtons: function() {
				if (this.getUseCont1 == null) {
					this.cInfoView.palaceQuickUseStoneButton.getLayoutParent().setVisibility((this.cInfoView.palaceQuickUseStoneButton.getVisibility() == "excluded" ? "excluded" : this.getUseBtnVisibility));
					this.cInfoView.palaceQuickUseWoodButton.getLayoutParent().setVisibility((this.cInfoView.palaceQuickUseWoodButton.getVisibility() == "excluded" ? "excluded" : this.getUseBtnVisibility));
					this.cInfoView.quickUseBuildSpeedItemBtn.getLayoutParent().setVisibility((this.cInfoView.quickUseBuildSpeedItemBtn.getVisibility() == "excluded" ? "excluded" : this.getUseBtnVisibility));
					this.cInfoView.quickUseTownHallButton.getLayoutParent().setVisibility((this.cInfoView.quickUseTownHallButton.getVisibility() == "excluded" ? "excluded" : this.getUseBtnVisibility));
					this.cInfoView.quickUseBuildingItemBtn.getLayoutParent().setVisibility((this.cInfoView.quickUseBuildingItemBtn.getVisibility() == "excluded" ? "excluded" : this.getUseBtnVisibility));
					this.cInfoView.quickUseUnitQueueItemBtn.getLayoutParent().setVisibility((this.cInfoView.quickUseUnitQueueItemBtn.getVisibility() == "excluded" ? "excluded" : this.getUseBtnVisibility));
				} else {
					this.getUseCont1.getLayoutParent().setHeight((this.getUseBtnVisibility == "visible" ? 61 : 0));
					this.getUseCont2.getLayoutParent().setHeight((this.getUseBtnVisibility == "visible" ? 61 : 0));
					this.getUseCont3.getLayoutParent().setHeight((this.getUseBtnVisibility == "visible" ? 61 : 0));
				}
			},
			switchGetUseDisplay: function() {
				if (this.getUseCont1 == null) {
					if (LT.options.hideGetUseBtn) {
						this.getUseBtnVisibility = "excluded";
						this.app.getUserData("showGetUseBtn").setVisibility("visible");
						this.cInfoView.palaceQuickUseStoneButton.getLayoutParent().setVisibility("excluded");
						this.cInfoView.palaceQuickUseWoodButton.getLayoutParent().setVisibility("excluded");
						this.cInfoView.quickUseBuildSpeedItemBtn.getLayoutParent().setVisibility("excluded");
						this.cInfoView.quickUseTownHallButton.getLayoutParent().setVisibility("excluded");
						this.cInfoView.quickUseBuildingItemBtn.getLayoutParent().setVisibility("excluded");
						this.cInfoView.quickUseUnitQueueItemBtn.getLayoutParent().setVisibility("excluded");
					} else {
						this.getUseBtnVisibility = "visible";
						this.app.getUserData("showGetUseBtn").setVisibility("excluded");
						this.cInfoView.palaceQuickUseStoneButton.getLayoutParent().setVisibility("visible");
						this.cInfoView.palaceQuickUseWoodButton.getLayoutParent().setVisibility("visible");
						this.cInfoView.quickUseBuildSpeedItemBtn.getLayoutParent().setVisibility("visible");
						this.cInfoView.quickUseTownHallButton.getLayoutParent().setVisibility("visible");
						this.cInfoView.quickUseBuildingItemBtn.getLayoutParent().setVisibility("visible");
						this.cInfoView.quickUseUnitQueueItemBtn.getLayoutParent().setVisibility("visible");
					}
				} else {
					if (LT.options.hideGetUseBtn) {
						this.app.getUserData("showGetUseBtn").setVisibility("visible");
						if (this.getUseCont1 != null) {
							this.getUseCont1.getLayoutParent().setHeight(0);
							this.getUseCont2.getLayoutParent().setHeight(0);
							this.getUseCont3.getLayoutParent().setHeight(0);
						}
					} else {
						this.app.getUserData("showGetUseBtn").setVisibility("excluded");
						if (this.getUseCont1 != null) {
							this.getUseCont1.getLayoutParent().setHeight(61);
							this.getUseCont2.getLayoutParent().setHeight(61);
							this.getUseCont3.getLayoutParent().setHeight(61);
						}
					}
				}
			},
			createTradeButtons: function() {
				if (this.app.tradeWidget) {
					_pageSend = null;
					for (var o in LT.a.tradeWidget) {
						if (LT.a.tradeWidget[o] != null && /SendResourcesPage/.test(LT.a.tradeWidget[o].basename))
							_pageSend = LT.a.tradeWidget[o];
						if (LT.a.tradeWidget[o] != null && /RequestResourcesPage/.test(LT.a.tradeWidget[o].basename))
							_prr = LT.a.tradeWidget[o];
					}
					if (_pageSend == null) return;
					_pageSendCont = _pageSend.aResValueSpinner[0].getLayoutParent(); // spinners container
					_tbd = [
						["1k", 1], ["5k", 5], ["10k", 10], ["25k", 25],
						["50k", 50], ["100k", 100], ["250k", 250], ["500k", 500]
					];
					_pageSendCont.getLayout().setSpacingX(5);
					for (i=0; i<4; i++) {
						for (j=0; j<8; j++) {
							tb = new qx.ui.form.Button(_tbd[j][0]).set({appearance: "button-recruiting", font: "bold"});
								tb.addListener("click", this.increaseResAmount, {am:_tbd[j][1], r:i, p:_pageSend});
							_pageSendCont.add(tb, {column: j+3, row: i+1});
						}
					}

					// add listeners to spinners in request resources page
					_prrTable = null;
					_spObj = null;
					_prrSel = null;
					for (var p in _prr) {
						if (_prr[p] != null) {
							if (_prr[p].toString().indexOf("SpinnerInt") != -1 && _prr[p].toString().indexOf("9999999") != -1) {
								re = /([_a-zA-z]+)(?=\s*=\s*\(?new\s*\(?webfrontend\.g?ui\.SpinnerInt)/g;
								_spObj = _prr[p].toString().match(re);
							}
							if (_prr[p].toString().indexOf("SimpleColFormattingDataModel") != -1) {
								_prrTable = _prr[p];
							}
							if (_prr[p].toString().indexOf("SelectBox") != -1) {
								_prrSel = _prr[p];
							}
						}
					}
					cb = new qx.ui.form.CheckBox(L("trade_limit"));
					if (LT.options.resLimit)
						cb.setValue(true);
					cb.addListener("appear", function() { this.setValue(LT.options.resLimit); }, cb);
					_prr[_spObj[0]].getLayoutParent().add(cb, {row:2, column:0});
					LT.main.temp_limit = cb;
					_prrSel.addListener("changeSelection", function() { if (this.getSelectables()[1] == this.getSelection()[0]) {LT.main.temp_limit.setValue(false);} else {LT.main.temp_limit.setValue(LT.options.resLimit);}}, _prrSel);
					_prrSel.addListener("appear", function() { if (this.t.getData().length > 0 && this.t.getData()[0].originalData.resType > 2) this.s.setSelection([this.s.getChildren()[0]]); if (this.s.getSelectables()[1] == this.s.getSelection()[0]) {LT.main.temp_limit.setValue(false);} else {LT.main.temp_limit.setValue(LT.options.resLimit);}}, {t:_prrTable, s:_prrSel});
					
					_prr[_spObj[0]].addListener("changeValue", this.limitResources, {t:_prrTable, s:_prr[_spObj[0]], b:0});
					_prr[_spObj[1]].addListener("changeValue", this.limitResources, {t:_prrTable, s:_prr[_spObj[1]], b:1});

					webfrontend.base.Timer.getInstance().removeListenerById(this.tradeButtonsListener);
				}
			},
			increaseResAmount: function() {
				curVal = this.p.aResValueSpinner[this.r].getValue();
				this.p.aResValueSpinner[this.r].setValue(curVal + this.am*1000);
			},
			limitResources: function() {
				if (!LT.main.temp_limit.getValue()) return;
				c = webfrontend.data.City.getInstance();
				_it = c.tradeIncoming;
				if (_it == null || _it == undefined) _it = [];
				_data = this.t.getData();
				for (i=0; i<_data.length; i++) {
					if (_data[i][0] == true) {
						_res = _data[i].originalData.resType; // resource type
						_inc = 0;
						// incoming trade
						for (k=0; k<_it.length; k++) {
							for (j=0; j<_it[k].resources.length; j++) {
								if (_it[k].resources[j].type == _res) 
									_inc += _it[k].resources[j].count;
							}
						}
				
						_timeSpan = (this.b == 0) ? _data[i].originalData.tl : _data[i].originalData.ts;
						if (_res == 4) {
							_fc = Math.round(c.getFoodConsumption() * 3600);
							_fcs = Math.round(c.getFoodConsumptionSupporter() * 3600);
							_ft = c.getResourceGrowPerHour(4) - _fc - _fcs;
						}
						curVal = c.getResourceCount(_res);
						curDel = c.resources[_res].delta;
						curMax = c.getResourceMaxStorage(_res);

						_val = Math.floor(curMax - (curVal + ((_res == 4) ? _ft*_timeSpan/3600 : _timeSpan * curDel)) - _inc);
						if (_val < 0) _val = 0;

						if (this.s.getValue() > _val) {
							this.s.setValue(_val);
						}
					}
				}
			},
			showOptionsPage: function() {
				this.app.switchOverlay(this.optionsPage);
			},
			loadOptions: function() {
				forceSave = false;
				_str = localStorage.getItem("LT_options");
				if (_str)
					this.options = qx.lang.Json.parse(_str);
				else {
					this.options = {
						"thousandsSeparator": 0,
						"hotkeys": {
							"build": {
								"woodcutter": "W",
								"quarry": "Q",
								"farm": "F",
								"cottage": "C",
								"market": "P",
								"ironmine": "I",
								"sawmill": "L",
								"mill": "M",
								"hideout": "H",
								"stonemason": "A",
								"foundry": "D",
								"townhouse": "U",
								"barracks": "B",
								"cityguardhouse": "K",
								"trainingground": "G",
								"stable": "E",
								"workshop": "Y",
								"shipyard": "V",
								"warehouse": "S",
								"castle": "X",
								"harbor": "R",
								"moonglowtower": "J",
								"trinsictemple": "Z",
								"lookouttower": "1",
								"ballistatower": "2",
								"guardiantower": "3",
								"rangertower": "4",
								"templartower": "5",
								"pitfalltrap": "6",
								"barricade": "7",
								"arcanetrap": "8",
								"camouflagetrap": "9"
							},
							"upgrades": {
								"upgrade": "U",
								"downgrade": "D",
								"minister": "A"
							},
							"global": {
								"prevcity": "[",
								"nextcity": "]"
							}
						},
						"lowestLevelUpgradeIDs": [47,48,50,4,5,49,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,36,37,38,39,40,41,42,43,44,45,46,12,23],
						"lowestLevelMax": [10,10,10,10,10,10],
						"switchToAllyTab": false,
						"showIncResCont": 1,
						"showQueueTimes": true,
						"incResClrs": ["#FF0000","#F7941D","#FFE400","#40C849"],
						"chatColors": ["#fcbf8f", "#78b042", "#000000", "#ff4076", "#fa9bb6", "#aaaaaa", "#b0843f"],
						"chatMaxLines": 100,
						"chatOpacity": 55,
						"cityTag": 0,
						"resLimit": true,
						"userLang": "",
						"showMiniMap": true,
						"miniMapColors": [ "#00C0FF", "#0000FF", "#00FF80", "#468246", "#E0E060", "#969640", "#FF8080", "#FF0000", "#00C8C8", "#008080", "#8C4600", "#643200", "#C0C0C0", "#737373", "#FFFFFF", "#000000", "#FFFFFF", "#000000" ],
						"miniMapMark": [ 3, 3, 3, 3, 3, 3, 3, 1, 1 ],
						"saveSsCn": false,
						"tradeLabelsAmount": 999,
						"hideGetUseBtn": false,
						"LTver": LTversion
					};
				}
				//1.3.2
				if (this.options.lowestLevelUpgradeIDs[0] == 1) this.options.lowestLevelUpgradeIDs[0] = 47;
				if (this.options.lowestLevelUpgradeIDs[1] == 2) this.options.lowestLevelUpgradeIDs[1] = 48;
				if (this.options.lowestLevelUpgradeIDs[2] == 3) this.options.lowestLevelUpgradeIDs[2] = 50;
				if (this.options.lowestLevelUpgradeIDs[5] == 6) this.options.lowestLevelUpgradeIDs[5] = 49;
				//
				//1.3.7
				if (!this.options.hasOwnProperty("showMiniMap")) this.options.showMiniMap = true;
				if (!this.options.hasOwnProperty("miniMapColors")) this.options.miniMapColors = [ "#00C0FF", "#0000FF", "#00FF80", "#468246", "#E0E060", "#969640", "#FF8080", "#FF0000", "#00C8C8", "#008080", "#8C4600", "#643200", "#C0C0C0", "#737373", "#FFFFFF", "#000000", "#FFFFFF", "#000000" ];
				if (!this.options.hasOwnProperty("miniMapMark")) this.options.miniMapMark = [ 3, 3, 3, 3, 3, 3, 3, 1, 1 ];
				//1.3.8
				if (this.options.miniMapColors.length == 8) this.options.miniMapColors = [ "#00C0FF", "#0000FF", "#00FF80", "#468246", "#E0E060", "#969640", "#FF8080", "#FF0000", "#00C8C8", "#008080", "#8C4600", "#643200", "#C0C0C0", "#737373", "#FFFFFF", "#000000", "#FFFFFF", "#000000" ];
				if (this.options.miniMapMark.length == 8) this.options.miniMapMark = [ 3, 3, 3, 3, 3, 3, 3, 1, 1 ];
				//1.3.9
				if (/false|true/.test(this.options.miniMapMark.join(""))) this.options.miniMapMark = [ 3, 3, 3, 3, 3, 3, 3, 1, 1 ];
				//1.4.7
				if (!this.options.hasOwnProperty("saveSsCn")) this.options.saveSsCn = false;
				//1.5.1
				if (this.options.chatColors.length == 5) this.options.chatColors.push("#bd0000");
				if (!this.options.hasOwnProperty("tradeLabelsAmount")) this.options.tradeLabelsAmount = 999;
				if (!this.options.hasOwnProperty("hideGetUseBtn")) this.options.hideGetUseBtn = false;

				//1.5.8
				if (this.options.hasOwnProperty("LTver") && parseInt(this.options.LTver.replace(/\./g, "")) < 158) {
					this.options.LTver = LTversion;
					if (this.options.chatColors.length < 7) {
						this.options.chatColors[5] = "#aaaaaa";
						this.options.chatColors.push("#b0843f");
					}
					forceSave = true;
				}
				
				this.app.setUserData("LT_options", this.options);
				if (forceSave) {
					str = qx.lang.Json.stringify(this.options);
					localStorage.setItem("LT_options", str);
				}
			},
			getLang: function() {
				return this.langToId(this.lang);
			},
			setLang: function(l) {
				this.lang = l;
				//qx.locale.Manager.getInstance().setLocale(l);
			},
			langToId: function(l) {
				switch(l) {
					case "en":
						return 0;
					case "de":
						return 1;
					case "es":
						return 2;
					case "pl":
						return 3;
					case "pt":
					case "pt_BR":
						return 4;
					case "ru":
						return 5;
					case "it":
						return 6;
					case "fr":
						return 7;
					default:
						return 0;
				}
			},
			thSep: function(val) {
				if (val == undefined) return "";
				separators = [".", ",", " ", ""];
				return val.toString().replace(/\d(?=(\d{3})+(\D|$))/g, "$&" + separators[LT.options.thousandsSeparator]);
			},
			debug: function(s) {
				if (typeof console != 'undefined') console.log(s);
				else if (window.opera) opera.postError(s);
				else GM_log(s);
			}
		}
	});

});