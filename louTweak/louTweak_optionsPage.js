/**
 * Created by TriMoon <http://claimid.com/trimoon>
 * Date: 2012/08/29
 * LoU Tweak:
 * 		Author: AmpliDude
 * 		Script: http://userscripts.org/scripts/show/80532
 */
loader.addFinishHandler(function() {
	GM_log("louTweak - defining optionsPage");

	qx.Class.define("louTweak.optionsPage", {
		extend: webfrontend.gui.OverlayWidget,
		construct: function() {
			webfrontend.gui.OverlayWidget.call(this);

			this.clientArea.setLayout(new qx.ui.layout.Canvas());
			this.setTitle("LoU Tweak Options");
			this.tabView = new qx.ui.tabview.TabView().set({contentPaddingLeft: 15, contentPaddingRight: 10, contentPaddingTop: 10, contentPaddingBottom: 10});
			this.tabPages = [
				{name:"General", page:null, vbox:null},
				{name:"Hotkeys", page:null, vbox:null},
				{name:"Colors", page:null, vbox:null}
			];
			for (i=0; i<this.tabPages.length; i++) {
				page = new qx.ui.tabview.Page(this.tabPages[i].name);
				page.setLayout(new qx.ui.layout.Canvas());
				vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
				scroll = new qx.ui.container.Scroll(vbox);
				page.add(scroll, {top: 0, left: 0, right: 0, bottom: 0});
				this.tabPages[i].vbox = vbox;
				this.tabPages[i].page = page;
			}
			
			// ----- Page 1
{
			// ----- Switch to alliance tab
			cb = new qx.ui.form.CheckBox(L("opts_switch_to_ally_tab"));
			if (LT.options.switchToAllyTab)
				cb.setValue(true);
			cb.addListener("click", function() { LT.options.switchToAllyTab = this.getValue() ? true : false; }, cb);
			this.tabPages[0].vbox.add(cb);

			// ----- Chat max lines / transparency
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			cont.add(new qx.ui.core.Spacer(20));
			lab = new qx.ui.basic.Label(L("opts_max_chatlines")).set({paddingTop: 4});
			cont.add(lab);
			cont.add(new qx.ui.core.Spacer(10));
			
			sp = new webfrontend.ui.SpinnerInt(10, LT.options.chatMaxLines, 100);
			sp.getChildControl("textfield").setLiveUpdate(true);
			sp.getChildControl("textfield").addListener("changeValue", function() { _val = parseInt(this.getValue()); LT.options.chatMaxLines = _val; webfrontend.config.Config.getInstance().getChat().setMaxLines(_val); }, sp);
			LT.a.setElementModalInput(sp);
			cont.add(sp);

			cont.add(new qx.ui.core.Spacer(20));
			lab = new qx.ui.basic.Label(L("opts_chat_opacity")).set({paddingTop: 4});
			cont.add(lab);
			cont.add(new qx.ui.core.Spacer(10));
			
			sp = new webfrontend.ui.SpinnerInt(0, (100-parseInt(LT.options.chatOpacity)), 100);
			sp.getChildControl("textfield").setLiveUpdate(true);
			sp.getChildControl("textfield").addListener("changeValue", function() { _val = parseInt(this.getValue()); LT.options.chatOpacity = 100 - _val; LT.a.chat.BgrLabel.setOpacity((100-_val)/100); }, sp);
			LT.a.setElementModalInput(sp);
			cont.add(sp);
			this.tabPages[0].vbox.add(cont);
			this.tabPages[0].vbox.add(new qx.ui.core.Widget().set({ backgroundColor: "#bd966d", height: 1, allowGrowX: true}));
			// ----- -----
			
			// ----- Hide 'Get & U se' buttons
			cb = new qx.ui.form.CheckBox(L("opts_hide_get_use"));
			if (LT.options.hideGetUseBtn) {
				cb.setValue(true);
				LT.main.switchGetUseDisplay();
			}
			cb.addListener("click", function() { LT.options.hideGetUseBtn = this.getValue() ? true : false; LT.main.switchGetUseDisplay(); }, cb);
			this.tabPages[0].vbox.add(cb);
			
			// ----- Show queue info window
			cb = new qx.ui.form.CheckBox(L("opts_show_queue_win"));
			if (LT.options.showQueueTimes)
				cb.setValue(true);
			cb.addListener("click", function() { LT.options.showQueueTimes = this.getValue() ? true : false; }, cb);
			this.tabPages[0].vbox.add(cb);
			
			// ----- Save overlay layout in city notes
			cb = new qx.ui.form.CheckBox(L("opts_save_ss_cn"));
			if (LT.options.saveSsCn)
				cb.setValue(true);
			cb.addListener("click", function() { LT.options.saveSsCn = this.getValue() ? true : false; }, cb);
			this.tabPages[0].vbox.add(cb);

			// ----- Requested resources limit
			cb = new qx.ui.form.CheckBox(L("opts_limit_req_res"));
			if (LT.options.resLimit)
				cb.setValue(true);
			cb.addListener("click", function() { LT.options.resLimit = this.getValue() ? true : false; }, cb);
			this.tabPages[0].vbox.add(cb);
			this.tabPages[0].vbox.add(new qx.ui.core.Widget().set({ backgroundColor: "#bd966d", height: 1, allowGrowX: true}));
			// ----- -----
			
			// ----- Incoming resources label
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			cont.add(new qx.ui.core.Spacer(20));
			lab = new qx.ui.basic.Label(L("opts_inc_res").lab);
			cont.add(lab);
			cont.add(new qx.ui.core.Spacer(10));
			
			rg = new qx.ui.form.RadioGroup();
			
			rbs = [ L("opts_inc_res").disabled, L("opts_inc_res").always, L("opts_inc_res").context ];
			for (i=0; i<rbs.length; i++) {
				rb = new qx.ui.form.RadioButton(rbs[i]);
				rb.setUserData("id", i);
				rb.setGroup(rg);
				cont.add(rb);
				cont.add(new qx.ui.core.Spacer(10));
			}
			
			rg.setSelection([rg.getChildren()[LT.options.showIncResCont]]);
			rg.addListener("changeSelection", function() { LT.options.showIncResCont = this.getSelection()[0].getUserData("id"); }, rg);
			this.tabPages[0].vbox.add(cont);
			
			// ----- Thousands separator
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			cont.add(new qx.ui.core.Spacer(20));
			lab = new qx.ui.basic.Label(L("opts_separator").lab);
			cont.add(lab);
			cont.add(new qx.ui.core.Spacer(10));
			
			rg = new qx.ui.form.RadioGroup();
			
			rbs = [ L("opts_separator").period, L("opts_separator").comma, L("opts_separator").space, L("opts_separator").none ];
			for (i=0; i<rbs.length; i++) {
				rb = new qx.ui.form.RadioButton(rbs[i]);
				rb.setUserData("id", i);
				rb.setGroup(rg);
				cont.add(rb);
				cont.add(new qx.ui.core.Spacer(10));				
			}
		
			rg.setSelection([rg.getChildren()[LT.options.thousandsSeparator]]);
			rg.addListener("changeSelection", function() { LT.options.thousandsSeparator = this.getSelection()[0].getUserData("id"); }, rg);
			this.tabPages[0].vbox.add(cont);

			// ----- City tag
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			cont.add(new qx.ui.core.Spacer(20));
			lab = new qx.ui.basic.Label(L("opts_city_tag").lab);
			cont.add(lab);
			cont.add(new qx.ui.core.Spacer(10));
			
			rg = new qx.ui.form.RadioGroup();
			
			rbs = [ L("opts_city_tag").info, L("opts_city_tag").region ];
			for (i=0; i<rbs.length; i++) {
				rb = new qx.ui.form.RadioButton(rbs[i]);
				rb.setUserData("id", i);
				rb.setGroup(rg);
				cont.add(rb);
				cont.add(new qx.ui.core.Spacer(10));				
			}

			rg.setSelection([rg.getChildren()[LT.options.cityTag]]);
			rg.addListener("changeSelection", function() { LT.options.cityTag = this.getSelection()[0].getUserData("id"); }, rg);
			this.tabPages[0].vbox.add(cont);

			// ----- LoU Tweak language
			gr = new qx.ui.layout.Grid(0, 5);
			gr.setColumnMinWidth(0, 120);
			gr.setColumnMinWidth(1, 120);
			gr.setColumnMinWidth(2, 120);
			gr.setColumnMinWidth(3, 120);
			cont = new qx.ui.container.Composite(gr).set({marginLeft: 20});
			lab = new qx.ui.basic.Label(L("opts_lang").lab + " " + L("req_restart") + ":").set({marginLeft: 20});
			this.tabPages[0].vbox.add(lab);
			
			rg = new qx.ui.form.RadioGroup();
			
			rbs = [ "en", "de", "es", "pl", "pt", "ru", "it", "fr" ];
			for (i=0; i<rbs.length; i++) {
				rb = new qx.ui.form.RadioButton(L("opts_lang")[rbs[i]]);
				rb.setUserData("id", rbs[i]);
				rb.setGroup(rg);
				cont.add(rb, {row: Math.floor(i/4), column: i%4});
			}

			rg.setSelection([rg.getChildren()[LT.main.langToId(LT.options.userLang)]]);
			rg.addListener("changeSelection", function() { LT.options.userLang = this.getSelection()[0].getUserData("id"); }, rg);
			this.tabPages[0].vbox.add(cont);
			this.tabPages[0].vbox.add(new qx.ui.core.Widget().set({ backgroundColor: "#bd966d", height: 1, allowGrowX: true}));
			// ----- -----
			
			// ----- MiniMap
			gr = new qx.ui.layout.Grid(0, 9);
			gr.setColumnMinWidth(0, 80);
			gr.setColumnMinWidth(1, 60);
			gr.setColumnMinWidth(2, 60);
			gr.setColumnMinWidth(3, 60);
			gr.setColumnMinWidth(4, 60);
			gr.setColumnAlign(0, "right", "middle");
			gr.setColumnAlign(1, "center", "middle");
			gr.setColumnAlign(2, "center", "middle");
			gr.setColumnAlign(3, "center", "middle");
			gr.setColumnAlign(4, "center", "middle");
			cgb = new qx.ui.container.Composite(gr).set({marginLeft: 20});
			this.setUserData("mmcb", cgb);
			//cgb.setVisibility("excluded");
			
			cb = new qx.ui.form.CheckBox(L("opts_minimap").enable_lab);
				if (LT.options.showMiniMap) {
					cb.setValue(true);
					this.getUserData("mmcb").setVisibility("visible");
				}
			cb.addListener("click", function() {
				LT.options.showMiniMap = this.getValue() ? true : false;
				LT.main.optionsPage.getUserData("mmcb").setVisibility((this.getValue() ? "visible" : "excluded"));
				LT.main.miniMap.clientArea.setVisibility((this.getValue() ? "visible" : "excluded"));
			}, cb);
					
			this.tabPages[0].vbox.add(cb);
			
			cbs = [
				[L("opts_minimap").show_cities, 0, 0],
				[L("opts_minimap").show_none, 0, 1],
				[L("opts_minimap").show_noncastle, 0, 2],
				[L("opts_minimap").show_castle, 0, 3],
				[L("opts_minimap").show_all, 0, 4],
				[L("opts_minimap").show_self, 1, 0],
				[L("opts_minimap").show_alliance, 2, 0],
				[L("opts_minimap").show_allied, 3, 0],
				[L("opts_minimap").show_enemy, 4, 0],
				[L("opts_minimap").show_nap, 5, 0],
				[L("opts_minimap").show_other, 6, 0],
				[L("opts_minimap").show_lawless, 7, 0]
			];
			for (i=0; i<cbs.length; i++) {
				lab = new qx.ui.basic.Label(cbs[i][0]);
				cgb.add(lab, {row:cbs[i][1], column:cbs[i][2]});
			}
			lab = new qx.ui.basic.Label(L("opts_minimap").show_moongate);
			cgb.add(lab, {row:9, column:0});
			lab = new qx.ui.basic.Label(L("opts_minimap").show_shrine);
			cgb.add(lab, {row:10, column:0});
			
			for (j=0; j<7; j++) {
				rg = new qx.ui.form.RadioGroup();
				for (i=0; i<4; i++) {
					rb = new qx.ui.form.RadioButton(null);
					rb.setUserData("id", i);
					rb.setGroup(rg);
					cgb.add(rb, {row:j+1, column:i+1});
				}
				rg.setSelection([rg.getChildren()[LT.options.miniMapMark[j]]]);
				rg.addListener("changeSelection", function() { LT.options.miniMapMark[this.it] = this.g.getSelection()[0].getUserData("id"); }, {g:rg, it:j});
			}
			rg = new qx.ui.form.RadioGroup();
			rb = new qx.ui.form.RadioButton(L("no")); rb.setUserData("id", 0); rb.setGroup(rg); cgb.add(rb, {row:9, column:1});
			rb = new qx.ui.form.RadioButton(L("yes")); rb.setUserData("id", 1); rb.setGroup(rg); cgb.add(rb, {row:9, column:2});
			rg.setSelection([rg.getChildren()[LT.options.miniMapMark[7]]]);
			rg.addListener("changeSelection", function() { LT.options.miniMapMark[7] = this.getSelection()[0].getUserData("id"); }, rg);
			rg = new qx.ui.form.RadioGroup();
			rb = new qx.ui.form.RadioButton(L("no")); rb.setUserData("id", 0); rb.setGroup(rg); cgb.add(rb, {row:10, column:1});
			rb = new qx.ui.form.RadioButton(L("yes")); rb.setUserData("id", 1); rb.setGroup(rg); cgb.add(rb, {row:10, column:2});
			rg.setSelection([rg.getChildren()[LT.options.miniMapMark[8]]]);
			rg.addListener("changeSelection", function() { LT.options.miniMapMark[8] = this.getSelection()[0].getUserData("id"); }, rg);

			if (!LT.options.showMiniMap) {
				this.getUserData("mmcb").setVisibility("excluded");
			}
			this.tabPages[0].vbox.add(cgb);
			this.tabPages[0].vbox.add(new qx.ui.core.Widget().set({ backgroundColor: "#bd966d", height: 1, allowGrowX: true}));
			// ----- -----
			
			// ----- Lowest level upgrades
			gr = new qx.ui.layout.Grid(0, 9);
			gr.setColumnMinWidth(0, 130);
			gr.setColumnMinWidth(1, 130);
			gr.setColumnMinWidth(2, 130);
			gr.setColumnMinWidth(3, 130);
			cont = new qx.ui.container.Composite(gr);
			
			lab = new qx.ui.basic.Label(L("opts_lowest_lvl").lab1);
			this.tabPages[0].vbox.add(lab);
			
			_bids = [47,48,50,4,5,49,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,36,37,38,39,40,41,42,43,44,45,46,12,23];
			mb = webfrontend.res.Main.getInstance().buildings;
			for (i=0; i<34; i++) {
				cb = new qx.ui.form.CheckBox(mb[_bids[i]].dn);
				if (LT.options.lowestLevelUpgradeIDs[i] != "")
					cb.setValue(true);
				cb.addListener("click", function() { LT.options.lowestLevelUpgradeIDs[this.i] = this.c.getValue() ? this.b : ""; }, {c:cb, b:_bids[i], i:i});
				cont.add(cb, {column: i%4, row: Math.floor(i/4)});
			}			
			this.tabPages[0].vbox.add(cont);				
			
			// ----- Level limits
			lab = new qx.ui.basic.Label(L("opts_lowest_lvl").lab2);
			this.tabPages[0].vbox.add(lab);
			
			gr = new qx.ui.layout.Grid(4, 4);
			gr.setColumnMinWidth(0, 60);
			gr.setColumnMinWidth(2, 60);
			gr.setColumnAlign(0, "right", "middle");
			gr.setColumnAlign(2, "right", "middle");
			cont = new qx.ui.container.Composite(gr);
			bTypesLabels = [ L("opts_lowest_lvl").towers, L("opts_lowest_lvl").military, L("opts_lowest_lvl").resource, L("opts_lowest_lvl").cottage, L("opts_lowest_lvl").barracks, L("opts_lowest_lvl").utilities ];
			for (i=0; i<6; i++) {
				lab = new qx.ui.basic.Label(bTypesLabels[i]);
				cont.add(lab, {row: Math.floor(i/2), column: ((i%2 == 0) ? 0 : 2)});
				sp = new webfrontend.ui.SpinnerInt(0, LT.options.lowestLevelMax[i], 10);
				sp.getChildControl("textfield").setLiveUpdate(true);
				sp.getChildControl("textfield").addListener("changeValue", function() { LT.options.lowestLevelMax[this.i] = parseInt(this.c.getValue()); }, {c:sp, i:i});
				LT.a.setElementModalInput(sp);
				cont.add(sp, {row: Math.floor(i/2), column: ((i%2 == 0) ? 1 : 3)});
			}
			this.tabPages[0].vbox.add(cont);
			this.tabPages[0].vbox.add(new qx.ui.core.Spacer(0, 10));
}		
			// ----- Page 2
{
			lab = new qx.ui.basic.Label(L("opts_set_hotkeys"));
			this.tabPages[1].vbox.add(lab);
			
			gr = new qx.ui.layout.Grid(5, 5);
			gr.setColumnMinWidth(0, 50);
			gr.setColumnMinWidth(1, 150);
			gr.setColumnMinWidth(2, 50);
			gr.setColumnMinWidth(3, 50);
			gr.setColumnMinWidth(4, 200);
			cont = new qx.ui.container.Composite(gr);
			
			btn_arr = [];

			// ----- Build hotkeys
			lab = new qx.ui.basic.Label(L("opts_hotkey_labels").lab1).set({font: "bold"});
			cont.add(lab, {column: 0, row: 0, colSpan: 3});

			cnt = 1;
			for (var i in window.louTweak.main.lou_building_id) {
				name = mb[window.louTweak.main.lou_building_id[i]].dn;
				hk = LT.options.hotkeys.build[i];
				
				lab  = new qx.ui.basic.Label(name);
				cont.add(lab, {column: 1, row: cnt});
				
				btn = new qx.ui.form.Button(hk).set({appearance: "button-recruiting", font: "bold"});
				btn.addListener("click", function() { LT.a.allowHotKey = false; this.o.btn.setLabel("..."); LT.a.mainContainer.addListenerOnce("keypress", function(e) { this.o.t.setKey(e, this.o); }, {o:this.o}); }, {o:{btn:btn, t:this, prop:i, group:"build"}});
				btn_arr.push({"btn":btn, "group":"build", "prop":i, "hk":hk});
				cont.add(btn, {column: 0, row: cnt});
				cnt++;
			}
			
			// ----- Other hotkeys
			oh = [
				[L("opts_hotkey_labels").lab2, -1, "upgrades"],
				[L("opts_hotkey_labels").upgrade, "upgrade", "upgrades"],
				[L("opts_hotkey_labels").downgrade, "downgrade", "upgrades"],
				[L("opts_hotkey_labels").minister, "minister", "upgrades"],
				[L("opts_hotkey_labels").lab4, -1, "global"],
				[L("opts_hotkey_labels").prev_city, "prevcity", "global"],
				[L("opts_hotkey_labels").next_city, "nextcity", "global"]
			];
			
			for (i=0; i<oh.length; i++) {
				if (oh[i][1] == -1) {
					lab = new qx.ui.basic.Label(oh[i][0]).set({font: "bold"});
					cont.add(lab, {column: 3, row: i, colSpan: 2});
				} else {
					name = oh[i][0];
					hk = LT.options.hotkeys[oh[i][2]][oh[i][1]];
					
					lab  = new qx.ui.basic.Label(name);
					cont.add(lab, {column: 4, row: i});
					
					btn = new qx.ui.form.Button(hk).set({appearance: "button-recruiting", font: "bold"});
					btn.addListener("click", function() { LT.a.allowHotKey = false; this.o.btn.setLabel("..."); LT.a.mainContainer.addListenerOnce("keypress", function(e) { this.o.t.setKey(e, this.o); }, {o:this.o}); }, {o:{btn:btn, t:this, prop:oh[i][1], group:oh[i][2]}});
					btn_arr.push({"btn":btn, "group":oh[i][2], "prop":oh[i][1], "hk":hk});
					cont.add(btn, {column: 3, row: i});
				}
			}
			LT.a.setUserData("btn_arr", btn_arr);
			this.tabPages[1].vbox.add(cont);
			// ----- -----
}				
			// ----- Page 3
{				
			// Color selector
			this.clrSel = new qx.ui.control.ColorPopup();
			this.clrSel.exclude();
			this.clrSel._createColorSelector();
			for (var G in this.clrSel) {
				if (this.clrSel[G] instanceof qx.ui.window.Window) {
					this.clrSel[G].set({ showMaximize: false, showMinimize: false, allowMaximize: false });
					break;
				}
			}
			this.clrSel.addListener("changeValue", function(e) {
				co = e.getData();
				if (co == null) return;

				co = qx.util.ColorUtil.rgbToHexString(qx.util.ColorUtil.stringToRgb(co));
				if (!/#/.test(co)) co = "#" + co;
				t = this.clrSel.getUserData("_type");
				id = this.clrSel.getUserData("_id");
				if (t == "incres")
					LT.options.incResClrs[id] = co;
				else if (t == "chat") {
					LT.options.chatColors[id] = co;
					chat = webfrontend.config.Config.getInstance().getChat();
					prop = ["global", "_a", "not_used", "privatein", "privateout", "social", "LoUWin"];
					if (id != 2)
						chat.channelColors[prop[id]] = co;
					else
						LT.a.chat.BgrLabel.setBackgroundColor(co);
				} else if (t == "minimap") {
					LT.options.miniMapColors[id] = co;
				}
				this.clrSel.getUserData("_btn").setBackgroundColor(co);
			}, this);
			
			this.tabPages[2].page.add(this.clrSel);
			
			// ----- Incres colors
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox(3)).set({marginLeft: 50});
			lab = new qx.ui.basic.Label(L("opts_clr_inc_res"));
			this.tabPages[2].vbox.add(lab);
			
			cl = [ "Full:", "High:", "Med:", "Low:" ];
			for (i=0; i<cl.length; i++) {
				lab = new qx.ui.basic.Label(cl[i]);
				cont.add(lab);

				btn = new qx.ui.form.Button().set({width: 20, backgroundColor: LT.options.incResClrs[i], padding: [5,15,5,15], decorator: new qx.ui.decoration.Single(1, "solid", "#b2956e"), cursor: "pointer"});
				btn.addListener("click", this.setColor, {b:btn, id:i, t:this, type:"incres"});
				cont.add(btn);
				cont.add(new qx.ui.core.Spacer(10));
			}

			this.tabPages[2].vbox.add(cont);
			this.tabPages[2].vbox.add(new qx.ui.core.Widget().set({ backgroundColor: "#bd966d", height: 1, allowGrowX: true}));

			// ----- Chat colors
			cont = new qx.ui.container.Composite(new qx.ui.layout.Grid(10,5)).set({marginLeft: 50});
			lab = new qx.ui.basic.Label(L("opts_clr_chat").lab);
			this.tabPages[2].vbox.add(lab);
			
			cl = [
				[L("opts_clr_chat").all, 0, 0],
				[L("opts_clr_chat").alliance, 0, 2],
				[L("opts_clr_chat").background, 0, 4],
				[L("opts_clr_chat").whisper + "1:", 0, 6],
				[L("opts_clr_chat").whisper + "2:", 1, 0],
				[L("opts_clr_chat").social, 1, 2],
				[L("opts_clr_chat").louwin, 1, 4]
			];
			for (i=0; i<cl.length; i++) {
				lab = new qx.ui.basic.Label(cl[i][0]);
				cont.add(lab, {row: cl[i][1], column: cl[i][2]});

				btn = new qx.ui.form.Button().set({width: 20, backgroundColor: LT.options.chatColors[i], padding: [5,15,5,15], decorator: new qx.ui.decoration.Single(1, "solid", "#b2956e"), cursor: "pointer"});
				btn.addListener("click", this.setColor, {b:btn, id:i, t:this, type:"chat"});
				cont.add(btn, {row: cl[i][1], column: cl[i][2]+1});
			}
			this.tabPages[2].vbox.add(cont);
			this.tabPages[2].vbox.add(new qx.ui.core.Widget().set({ backgroundColor: "#bd966d", height: 1, allowGrowX: true}));
			
			// ----- MiniMap colors
			lab = new qx.ui.basic.Label(L("opts_minimap").clrs_lab);
			this.tabPages[2].vbox.add(lab);
			
			gr = new qx.ui.layout.Grid(5, 5);
			gr.setColumnMinWidth(1, 55);
			gr.setColumnMinWidth(2, 55);
			gr.setColumnMinWidth(3, 55);
			gr.setColumnMinWidth(4, 55);
			gr.setColumnMinWidth(5, 55);
			gr.setColumnMinWidth(6, 55);
			gr.setColumnMinWidth(7, 55);

			cont = new qx.ui.container.Composite(gr);
			cl = [
				[L("opts_minimap").clr_self, 0, 1],
				[L("opts_minimap").clr_alliance, 0, 2],
				[L("opts_minimap").clr_allied, 0, 3],
				[L("opts_minimap").clr_enemy, 0, 4],
				[L("opts_minimap").clr_nap, 0, 5],
				[L("opts_minimap").clr_other, 0, 6],
				[L("opts_minimap").clr_lawless, 0, 7],
				[L("opts_minimap").show_noncastle+":", 1, 0],
				[L("opts_minimap").show_castle+":", 2, 0]
			];

			for (i=0; i<cl.length; i++) {
				lab = new qx.ui.basic.Label(cl[i][0]);
				cont.add(lab, {row: cl[i][1], column: cl[i][2]});
			}
			for (i=0; i<14; i++) {
				btn = new qx.ui.form.Button().set({maxWidth: 20, backgroundColor: LT.options.miniMapColors[(i%7)*2+Math.floor(i/7)], padding: [5,15,5,15], decorator: new qx.ui.decoration.Single(1, "solid", "#b2956e"), cursor: "pointer"});
				btn.addListener("click", this.setColor, {b:btn, id:(i%7)*2+Math.floor(i/7), t:this, type:"minimap"});
				cont.add(btn, {row: Math.floor(i/7)+1, column: (i%7)+1});
			}
			lab = new qx.ui.basic.Label(L("opts_minimap").clr_moongate);
			cont.add(lab, {row: 4, column: 0});
			lab = new qx.ui.basic.Label(L("opts_minimap").clr_shrine);
			cont.add(lab, {row: 5, column: 0});
			btn = new qx.ui.form.Button().set({maxWidth: 20, backgroundColor: LT.options.miniMapColors[14], padding: [5,15,5,15], decorator: new qx.ui.decoration.Single(1, "solid", "#b2956e"), cursor: "pointer"});
			btn.addListener("click", this.setColor, {b:btn, id:14, t:this, type:"minimap"});
			cont.add(btn, {row: 4, column: 1});
			btn = new qx.ui.form.Button().set({maxWidth: 20, backgroundColor: LT.options.miniMapColors[16], padding: [5,15,5,15], decorator: new qx.ui.decoration.Single(1, "solid", "#b2956e"), cursor: "pointer"});
			btn.addListener("click", this.setColor, {b:btn, id:16, t:this, type:"minimap"});
			cont.add(btn, {row: 5, column: 1});
			this.tabPages[2].vbox.add(cont);
			// ----- -----
}
							

{

			// ----- Save Button
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox());
			btn = new qx.ui.form.Button(L("opts").save).set({width: 90, marginLeft: 30});
			btn.addListener("click", this.saveOptions, this);
			cont.add(btn);

			this.expImpWin = this.createExpImpWindow();
			// ----- Export button
			btn = new qx.ui.form.Button(L("opts")['export']).set({appearance: "button-text-small", marginLeft: 280});
			btn.addListener("click", function(){
				this.expImpWin.setCaption(L("opts")['export']);
				this.expImpWin.setUserData("id", 2);
				this.expImpWin.getUserData("lab").setValue(L("opts").export_lab);
				this.expImpWin.getUserData("ta").setValue(qx.lang.Json.stringify(LT.options));
				this.expImpWin.open();
			}, this);
			cont.add(btn);
			
			// ----- Import button
			btn = new qx.ui.form.Button(L("opts")['import']).set({appearance: "button-text-small"});
			btn.addListener("click", function(){
				this.expImpWin.setCaption(L("opts")['import']);
				this.expImpWin.setUserData("id", 1);
				this.expImpWin.getUserData("lab").setValue(L("opts").import_lab);
				this.expImpWin.getUserData("ta").setValue("");
				this.expImpWin.open();
			}, this);
			cont.add(btn);
			// ----- -----
			
			// ----- Add pages to tabview
			for (i=0; i<this.tabPages.length; i++) {
				this.tabView.add(this.tabPages[i].page);
			}
			
			this.clientArea.add(this.tabView, {top: 0, right: 3, bottom: 30, left: 3});
			this.clientArea.add(cont, {right: 3, bottom: 3, left: 3});
}
		},
		members: {
			tabView: null,
			tabPages: null,
			clrSel: null,
			expImpWin: null,
			setKey: function(e, o) {
				if (LT.a.getCurrentOverlay() != o.t) {
					LT.a.allowHotKey = true;
					return;
				}
				key = e.getKeyIdentifier();
				ch = null;
				cb = null;
				ba = LT.a.getUserData("btn_arr");
				for (i=0; i<ba.length; i++) {
					if (ba[i].group == o.group && ba[i].hk == key)
						ch = ba[i];
					if (ba[i].btn == o.btn)
						cb = ba[i];
				}
				
				if (!/,/.test(key)) {
					if (key != "Delete") {
						if (o.group == "global" && /[BCMEUL]/.test(key)) {// global hotkeys B,C,M,R,U,L,(S,X,[,]), E prior to asscession
							o.btn.setLabel(LT.options.hotkeys[o.group][o.prop]);
							LT.a.allowHotKey = true;
							return;
						}
						if (ch) {
							LT.options.hotkeys[o.group][ch.prop] = "";
							ch.btn.setLabel("");
							ch.hk = "";
						}
						LT.options.hotkeys[o.group][o.prop] = key;
						cb.btn.setLabel(key);
						cb.hk = key;
					} else {
						LT.options.hotkeys[o.group][o.prop] = "";
						cb.btn.setLabel("");
						cb.hk = "";
					}
				}
				LT.a.allowHotKey = true;
			},
			setColor: function() {
				cs = this.t.clrSel;
				cs.setUserData("_id", this.id);
				cs.setUserData("_btn", this.b);
				cs.setUserData("_type", this.type);
				cs.moveTo(100, 50);
				if (this.type == "incres")
					cs.setValue(LT.options.incResClrs[this.id]);
				else if (this.type == "chat")
					cs.setValue(LT.options.chatColors[this.id]);
				else if (this.type == "minimap")
					cs.setValue(LT.options.miniMapColors[this.id]);
				cs.show();
			},
			saveOptions: function() {
				str = qx.lang.Json.stringify(LT.options);
				localStorage.setItem("LT_options", str);
				LT.a.switchOverlay(null);
			},
			createExpImpWindow: function() {
				win = new qx.ui.window.Window("");
				win.setLayout(new qx.ui.layout.VBox(10));
				win.set({showMaximize: false, showMinimize: false, allowMaximize: false});
				win.setWidth(450);
				win.setHeight(200);
				//win.open();
				LT.a.getRoot().add(win, {left:250, top:200});

				lab = new qx.ui.basic.Label("");
				win.add(lab);
				win.setUserData("lab", lab);
				
				ta = new qx.ui.form.TextArea(qx.lang.Json.stringify(LT.options));
				ta.addListener("click", function(){this.selectAllText();});
				win.add(ta, {height: 65});
				win.setUserData("ta", ta);
				btn = new qx.ui.form.Button("OK").set({maxWidth: 50, alignX: "center"});
				btn.addListener("click", function(){
					id = this.getUserData("id");
					if (id == 1) {
						txt = this.getUserData("ta").getValue();
						try {
							obj = qx.lang.Json.parse(txt);
						} catch(e) { obj = "error"; }
						if (typeof obj == "object" && obj != null) {
							LT.options = qx.lang.Json.parse(txt);
							localStorage.setItem("LT_options", txt);
							this.close();
						} else {
							alert(L("opts").import_invalid);
						}
					} else if (id == 2) {
						this.close();
					}
				}, win);
				win.add(btn);
				return win;
			},
		}
	});

});