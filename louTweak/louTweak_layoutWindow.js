/**
 * Created by TriMoon <http://claimid.com/trimoon>
 * Date: 2012/08/29
 * LoU Tweak:
 * 		Author: AmpliDude
 * 		Script: http://userscripts.org/scripts/show/80532
 */
loader.addFinishHandler(function() {
	GM_log("louTweak - defining layoutWindow");

	qx.Class.define("louTweak.layoutWindow", {
		extend: qx.core.Object,
		statics: {
			node: {
				"28":0,	"900":0, "29":1, "901":1, "27":2, "902":2, "30":3, "903":3, "23":4, "1":5, "2":6, "3":7, "4":8,
				"5":9,	"6":10,	"7":11,	"8":12,	"9":13,	"10":14,"11":15,"12":16,"13":17,"14":18,"15":19,"16":20,"17":21,
				"18":22,"19":23,"20":24,"21":25,"22":26,"36":27,"37":28,"38":29,"39":30,"40":31,"41":32,"42":33,"43":34,
				"44":35,"45":36,"46":37,"98":38,"99":39,"-2":40,"-1":41,"97":46,"47":42,"48":43,"49":45,"50":44,"52":38,
				"53":38,"54":38,"55":38,"56":38,"57":38,"58":38,"59":38,
				"904":0, "61":0, "905":1, "62":1, "906":2, "60":2, "907":3, "63":3, //magic res
				"64":0, "65":0, "66":0, "67":0, "68":0, "69":0 // special buildings
			},
			louCityP: [
				":",".",",",";","#","W","Q","F","C","P","I","L","M","H","A","D","T","U","B","K","G", //20
				"E","Y","V","S","X","R","J","Z","#","#","#","#","#","#","#","#","#","-","#","#","#", //41
				"2","3","1","4","_" //42-45, 46
			],
			louFCityP: [
				"B","A","C","D", "","F","G","I","O","J","H","K","N","1","L","M","0","E","P","S","Q",
				"U","V","Y","Z","X","T","R","W", "", "", "", "", "", "", "", "", "","0", "","0", "",
				"2","3","5","4","0"
			],
			fcpToSs: {
				"B":":", "A":".", "C":",", "D":";", "E":"U", "F":"W", "G":"Q", "H":"I",
				"I":"F", "J":"P", "K":"L", "L":"A", "M":"D", "N":"M", "O":"C", "P":"B",
				"Q":"G", "R":"J", "S":"K", "T":"R", "U":"E", "V":"Y", "W":"Z", "X":"X",
				"Y":"V", "Z":"S", "1":"H", "0":"-", "2":"2", "3":"3", "4":"4", "5":"1"
			},
			ssToId: {
				"2":47, "3":48, "1":50, "C": 4, "P": 5, "4":49, "L": 7, "M": 8,
				"H": 9, "A":10, "D":11, "T":12, "U":13, "B":14, "K":15, "G":16,
				"E":17, "Y":18, "V":19, "S":20, "X":21, "R":22, "J":36, "Z":37
			},
			land: "########################-------#-------#####--------#--------###---------#---------##---------#---------##------#######------##-----##-----##-----##----##-------##----##----#---------#----##----#---------#----#######---------#######----#---------#----##----#---------#----##----##-------##----##-----##-----##-----##------#######------##---------#---------##---------#---------###--------#--------#####-------#-------########################",
			water: "########################-------#-------#####--------#--------###---------#---------##---------#---------##------#######------##-----##-----##-----##----##-------##----##----#---------#----##----#---------#----#######---------#######----#---------#----##----#---------#----##----##-------##----##-----##-----##-----##------#######--__--##---------#----_##_-##---------#----_###_###--------#-----_#######-------#------_########################",
			error: {
				"resource": "invalid resource node position",
				"castle": "invalid building position (Castle)",
				"water": "invalid building position (Harbor/Shipyard)",
				"type": "invalid Sharestring type (stype => ctype)",
				"hash": "invalid Sharestring"
			}
		},
		construct: function() {
			this.win = new qx.ui.window.Window(L("layout").city);
			this.win.setLayout(new qx.ui.layout.Canvas());
			this.win.set({showMaximize: false, showMinimize: false, allowMaximize: false});
			this.win.setWidth(500);
			this.win.setHeight(350);

			this.tabView = new qx.ui.tabview.TabView().set({contentPadding: 5});
			page1 = new qx.ui.tabview.Page("Sharestring");
			page1.setLayout(new qx.ui.layout.VBox(5));
			page2 = new qx.ui.tabview.Page(L("layout").overlay);
			page2.setLayout(new qx.ui.layout.VBox(5));
			
			// Page 1
			gr = new qx.ui.layout.Grid(5, 5);
			gr.setColumnAlign(0, "right", "middle");
			gr.setColumnWidth(1, 380);
			cont = new qx.ui.container.Composite(gr);
			this.ssTa1 = new qx.ui.form.TextArea("").set({height: 60});
			this.ssTa1.addListener("click", function(){this.selectAllText();});
			cont.add(new qx.ui.basic.Label("Sharestring:"), {row: 0, column: 0});
			cont.add(this.ssTa1, {row: 0, column: 1});
			this.ssTa2 = new qx.ui.form.TextArea("").set({height: 60});
			this.ssTa2.addListener("click", function(){this.selectAllText();});
			cont.add(new qx.ui.basic.Label("Flash Planner 1:"), {row: 1, column: 0});
			cont.add(this.ssTa2, {row: 1, column: 1});
			this.ssTa3 = new qx.ui.form.TextArea("").set({height: 60});
			this.ssTa3.addListener("click", function(){this.selectAllText();});
			cont.add(new qx.ui.basic.Label("Flash Planner 2:"), {row: 2, column: 0});
			cont.add(this.ssTa3, {row: 2, column: 1});
			page1.add(cont);
			
			this.louFCPlink = new qx.ui.basic.Label("Open in Flash City Planner 1").set({
				textColor: "#105510",
				rich: true,
				appearance: "clickable-link",
				cursor: "pointer",
				marginLeft: 310
			});
			this.louFCPlink.addListener("click", function(){LT.a.showExternal(this.cityLayout.u);}, this);
			page1.add(this.louFCPlink);
			this.louFCPlink2 = new qx.ui.basic.Label("Open in Flash City Planner 2").set({
				textColor: "#105510",
				rich: true,
				appearance: "clickable-link",
				cursor: "pointer",
				marginLeft: 310
			});
			this.louFCPlink2.addListener("click", function(){LT.a.showExternal(this.cityLayout.u2);}, this);
			page1.add(this.louFCPlink2);

			// Page 2
			this.olTa = new qx.ui.form.TextArea("").set({height: 110});
			page2.add(this.olTa);

			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
			btn = new qx.ui.form.Button(L("layout").apply).set({maxWidth: 150, appearance: "button-text-small"});
			btn.addListener("click", this.applyLayout, this);
			cont.add(btn);

			btn = new qx.ui.form.Button(L("layout").remove).set({maxWidth: 150, appearance: "button-text-small"});
			btn.addListener("click", this.removeLayout, this);
			cont.add(btn);
			
			this.errorLabel = new qx.ui.basic.Label("").set({ textColor: "#FF0000", marginLeft: 20, font: "bold"});
			cont.add(this.errorLabel);
			page2.add(cont);
			
			// ----- Export / Import sharestrings
			cont = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

			this.expImpWin = this.createExpImpWindow();
			// ----- Export button
			btn = new qx.ui.form.Button(L("opts")['export']).set({appearance: "button-text-small"});
			btn.addListener("click", function(){
				this.expImpWin.setCaption(L("opts")['export']);
				this.expImpWin.setUserData("id", 2);
				this.expImpWin.getUserData("ta").setValue(qx.lang.Json.stringify(this.cityLayouts));
				this.expImpWin.open();
			}, this);
			cont.add(btn);
			
			// ----- Import button
			btn = new qx.ui.form.Button(L("opts")['import']).set({appearance: "button-text-small"});
			btn.addListener("click", function(){
				this.expImpWin.setCaption(L("opts")['import']);
				this.expImpWin.setUserData("id", 1);
				this.expImpWin.getUserData("ta").setValue("");
				this.expImpWin.open();
			}, this);
			cont.add(btn);
			
			page2.add(cont);

			this.tabView.add(page1);
			this.tabView.add(page2);
			this.win.add(this.tabView, {top: 0, right: 3, bottom: 30, left: 3});
			
			btn = new qx.ui.form.Button("OK").set({width: 75});
			btn.addListener("click", function(){this.tabView.setSelection([this.tabView.getChildren()[0]]); this.win.close()}, this);
			this.win.add(btn, {bottom: 0, right: 20});
			
			LT.a.getRoot().add(this.win, {left:250, top:200});
			this.srvName = webfrontend.data.Server.getInstance().getName();
			this.loadCityLayouts();
		},
		members: {
			cityLayout: null,
			cityLayouts: null,
			olTa: null,
			ssTa1: null,
			ssTa2: null,
			ssTa3: null,
			louFCPlink: null,
			errorLabel: null,
			tabView: null,
			win: null,
			oObjs: null,
			srvName: null,
			open: function() {
				this.win.open();
				this.ssTa1.setValue(this.cityLayout.s);
				this.ssTa2.setValue(this.cityLayout.u);
				this.ssTa3.setValue(this.cityLayout.u2);
				if (this.cityLayouts[this.srvName].hasOwnProperty(webfrontend.data.City.getInstance().getId() + "o"))
					this.olTa.setValue(this.cityLayouts[this.srvName][webfrontend.data.City.getInstance().getId() + "o"]);
				else this.olTa.setValue("");
				this.errorLabel.setValue("");
			},
			loadCityLayouts: function() {
				_str = localStorage.getItem("LT_cityLayouts");
				this.cityLayouts = {};
				this.cityLayouts[this.srvName] = {};
				if (_str) {
					_scl = qx.lang.Json.parse(_str);
					if (_scl.hasOwnProperty(this.srvName))
						this.cityLayouts[this.srvName] = _scl[this.srvName];
				}
			},
			saveCityLayouts: function() {
				_str = localStorage.getItem("LT_cityLayouts");
				if (_str == null) _str = '{"' + this.srvName + '":{}}';
				_scl = qx.lang.Json.parse(_str);
				_scl[this.srvName] = this.cityLayouts[this.srvName];
				_str = qx.lang.Json.stringify(_scl);
				localStorage.setItem("LT_cityLayouts", _str);
			},
			removeObjects: function() {
				if (this.oObjs != null) {
					for (i=0; i<this.oObjs.length; i++) {
						this.oObjs[i].release();
					}
					this.oObjs = null;
				}
			},
			showOverlayLayout: function(ss, or) {
			this.removeObjects();
	try {
				LT.main.getCity();
				c = LT.city;
				cgi = webfrontend.data.City.getInstance();
				if (c == null || c == undefined) {
					window.setTimeout(function(){LT.main.layoutWindow.showOverlayLayout();}, 1000);
					return;
				}
				for (i=0; i<c.length; i++) {
					if (c[i] == null) {
						window.setTimeout(function(){LT.main.layoutWindow.showOverlayLayout();}, 1000);
						return;
					}
				}
				cId = cgi.getId();
				if (LT.main.cityId != cId || qx.lang.Object.isEmpty(LT.a.visMain.selectableEntities) || LT.main.cityId != LT.a.visMain.mapid) {
					window.setTimeout(function(){LT.main.layoutWindow.showOverlayLayout();}, 2000);
					return;
				}
				
				if (this.cityLayouts[this.srvName].hasOwnProperty(cId))
					ss = this.cityLayouts[this.srvName][cId];
				if (ss == null || ss == undefined) {
					cnt = cgi.getText();
					ss = cnt.match(/\[LTS\](.+)\[\/LTS\]/);
					if (ss != null) {
						or = ss[1];
						ss = ss[1].replace(/\[[^\]]+\](\:|\;)?/g, "");
						if (ss.indexOf("map=") != -1) {
							//ss = ss.replace(/http\:\/\/www\.lou\-fcp\.co\.uk\/map\.php\?map=/, "");
							ss = ss.substring(ss.indexOf("=")+1);
							ss = this.convertToSharestring(ss);
						}
					}
				}
				// !this.validateSharestring(ss) || 
				if (ss == undefined || ss == null || LT.a.visMain.mapmode != "c") return;

				if (!this.cityLayouts[this.srvName].hasOwnProperty(cId)) {
					this.cityLayouts[this.srvName][cId] = ss;
					this.cityLayouts[this.srvName][cId + "o"] = or;
					this.saveCityLayouts();
				}

				this.oObjs = new Array();
				/*
				for (i=0; i<ss.length; i++) {
					if (!/\;|\:|\,|\.|T|#|\-|\_|W|Q|F|I/.test(ss.charAt(i))) {
						id = this.self(arguments).ssToId[ss.charAt(i)];
						if (c[i][2] != id)
							this.oObjs.push(new window.louTweak.overlayObject(LT.a.visMain, 163+128*(i%21), 67+80*Math.floor(i/21), id));
					} else if (/\-/.test(ss.charAt(i))) {
						if (c[i][2] != 98 && c[i][2] != -2 && (c[i][2] < 52 || c[i][2] > 60))
							this.oObjs.push(new window.louTweak.overlayObject(LT.a.visMain, 163+128*(i%21), 67+80*Math.floor(i/21), 0));
					} else if (/\_/.test(ss.charAt(i))) {
						if (c[i][2] != 97)
							this.oObjs.push(new window.louTweak.overlayObject(LT.a.visMain, 163+128*(i%21), 67+80*Math.floor(i/21), 0));
					}
				}*/
				for (i=0; i<ss.length; i++) {
					if (/T|#|W|Q|F|I/.test(ss.charAt(i))) continue;
					id = 0;
					if (!/\;|\:|\,|\.|\-|\_/.test(ss.charAt(i))) {
						id = this.self(arguments).ssToId[ss.charAt(i)];
						if (c[i][2] == id) continue;
					} else if (/\;|\:|\,|\./.test(ss.charAt(i))) {
						if (ss.charAt(i) == ";" && /30|903|63|907/.test(c[i][2])) continue;
						else if (ss.charAt(i) == ":" && /28|900|61|904/.test(c[i][2])) continue;
						else if (ss.charAt(i) == "," && /27|902|60|906/.test(c[i][2])) continue;
						else if (ss.charAt(i) == "." && /29|901|62|905/.test(c[i][2])) continue;
						else id = -1;
					} else if (/\-/.test(ss.charAt(i))) {
						if (c[i][2] == 98 || c[i][2] == -2 || (c[i][2] >= 52 && c[i][2] <= 60))
							continue;
					} else if (/\_/.test(ss.charAt(i))) {
						if (c[i][2] == 97)
							continue;
					}
					this.oObjs.push(new window.louTweak.overlayObject(LT.a.visMain, 163+128*(i%21), 67+80*Math.floor(i/21), id));
				}
	} catch(e) {LT.debug(e);}
			},
			generateSharestring: function() {
				try {
					LT.main.getCity();
					this.cityLayout = {"s":"", "u":"", "u2":""};
					waterCity = webfrontend.data.City.getInstance().getOnWater();
					c = LT.city;
					var sharestring = "[ShareString.1.3]" + ((waterCity) ? ";" : ":");
					var url = "http://www.lou-fcp.co.uk/map.php?map=" + ((waterCity) ? "W" : "L");
					for (i=0; i<c.length; i++) {
						sharestring += this.self(arguments).louCityP[this.self(arguments).node[c[i][2]]];
						url += this.self(arguments).louFCityP[this.self(arguments).node[c[i][2]]];
					}
					if (waterCity) url = url.substring(0,317)+url.substring(319,333);
					sharestring += "[/ShareString]";
					this.cityLayout.s = sharestring;
					this.cityLayout.u = url;
					this.cityLayout.u2 = url.replace(/http\:\/\/www\.lou\-fcp\.co\.uk\/map\.php/, "http://city.louopt.com/");
				} catch(e) { LT.debug(e); }
			},
			applyLayout: function() {
				this.errorLabel.setValue("");
				txt = this.olTa.getValue().replace(/\s/g,"");
				o = txt;
				if (txt.indexOf("ShareString") != -1) {
					t = txt.match(/\](\:|\;){1}/)[1];
					txt = txt.replace(/\[[^\]]+\](\:|\;)?/g, "");
					if (txt.length != 441) {
						this.errorLabel.setValue(this.self(arguments).error.hash);
						return;
					}
					if (webfrontend.data.City.getInstance().getOnWater() && t == ":") {
						this.errorLabel.setValue(this.self(arguments).error.type.replace(/stype/,"Land").replace(/ctype/,"Water"));
						return;
					} else if (!webfrontend.data.City.getInstance().getOnWater() && t == ";") {
						this.errorLabel.setValue(this.self(arguments).error.type.replace(/stype/,"Water").replace(/ctype/,"Land"));
						return;
					}
					//if (this.validateSharestring(txt))
					this.saveToCityNotes("a", o);
					//else return;
					this.showOverlayLayout(txt, o);
				} else if (txt.indexOf("map=") != -1) {
					txt = txt.substring(txt.indexOf("=")+1);
					if (txt.length != 294) {
						this.errorLabel.setValue(this.self(arguments).error.hash);
						return;
					}
					if (webfrontend.data.City.getInstance().getOnWater() && txt.charAt(0) == "L") {
						this.errorLabel.setValue(this.self(arguments).error.type.replace(/stype/,"Land").replace(/ctype/,"Water"));
						return;
					} else if (!webfrontend.data.City.getInstance().getOnWater() && txt.charAt(0) == "W") {
						this.errorLabel.setValue(this.self(arguments).error.type.replace(/stype/,"Water").replace(/ctype/,"Land"));
						return;
					}
					txt = this.convertToSharestring(txt);
					//if (this.validateSharestring(txt))
					this.saveToCityNotes("a", o);
					//else return;
					this.showOverlayLayout(txt, o);
				}
			},
			removeLayout: function() {
				cId = webfrontend.data.City.getInstance().getId();
				this.errorLabel.setValue("");
				this.removeObjects();
				delete this.cityLayouts[this.srvName][cId];
				delete this.cityLayouts[this.srvName][cId + "o"];
				this.saveToCityNotes("r", "");
				this.olTa.setValue("");
				this.saveCityLayouts();
			},
			convertToSharestring: function(u) {
				template = this.self(arguments).land;
				t = u.charAt(0);
				if (t == "W") {
					u = u.substring(0,242) + u.substring(244,260) + u.substring(263,278) + u.substring(280);
					template = this.self(arguments).water;
				}
				u = u.substring(1);
				c = -1;
				u = template.replace(/\-|\_/g, function(){ c++; return window.louTweak.layoutWindow.fcpToSs[u[c]]; });
				u = u.substring(0,220) + "T" + u.substring(221);
				if (t == "W") {
					wbp = [331, 332, 351, 354, 372, 376, 394, 416];
					u = u.split("");
					for (i=0; i<wbp.length; i++) {
						if (u[wbp[i]] == "-") u[wbp[i]] = "_";
					}
					u = u.join("");
				}
				return u;
			},
			validateSharestring: function(s) {
				if (s == undefined || s == null) return false;
				error = "";
				c = LT.city;
				for (i=0; i<c.length; i++) {
					if (/\;|\:|\,|\./.test(s.charAt(i))) {
						switch(s.charAt(i)) {
							case ";":
								if (c[i][2] != 30 && c[i][2] != 903 && c[i][2] != 63 && c[i][2] != 907)
									error = "resource";
								break;
							case ":":
								if (c[i][2] != 28 && c[i][2] != 900 && c[i][2] != 61 && c[i][2] != 904)
									error = "resource";
								break;
							case ",":
								if (c[i][2] != 27 && c[i][2] != 902 && c[i][2] != 60 && c[i][2] != 906)
									error = "resource";
								break;
							case ".":
								if (c[i][2] != 29 && c[i][2] != 901 && c[i][2] != 62 && c[i][2] != 905)
									error = "resource";
								break;
						}
					}
					if (c[i][2] == 21 && s.charAt(i) != "X")
						error = "castle";
					if ((/V|R|\_/.test(s.charAt(i)) && !/\b(19|22|97)\b/.test(c[i][2])) || (/\b(19|22|97)\b/.test(c[i][2]) && !/V|R|\_/.test(s.charAt(i)))) {
						error = "water";
						//LT.debug(i + " " + s.charAt(i) + " " + c[i][2]);
					}
				}
				if (s.replace(/[^X]/g,"").length > 1)
					error = "castle";
				if (error != "") {
					this.errorLabel.setValue(this.self(arguments).error[error]);
					return false;
				} else {
					return true;
				}
			},
			createExpImpWindow: function(t) {
				win = new qx.ui.window.Window("");
				win.setLayout(new qx.ui.layout.VBox(10));
				win.set({showMaximize: false, showMinimize: false, allowMaximize: false});
				win.setWidth(450);
				win.setHeight(200);
				LT.a.getRoot().add(win, {left:250, top:200});
				
				ta = new qx.ui.form.TextArea("");
				ta.addListener("click", function(){this.selectAllText();});
				win.add(ta, {height: 70});
				win.setUserData("ta", ta);
				btn = new qx.ui.form.Button("OK").set({maxWidth: 50, alignX: "center"});
				btn.addListener("click", function() {
					id = this.getUserData("id");
					if (id == 1) {
						txt = this.getUserData("ta").getValue();
						try {
							obj = qx.lang.Json.parse(txt);
						} catch(e) { obj = "error"; }
						if (typeof obj == "object" && obj != null) {
							_icl = qx.lang.Json.parse(txt); // imp ss
							if (_icl.hasOwnProperty(LT.main.layoutWindow.srvName)) {
								LT.main.layoutWindow.cityLayouts[LT.main.layoutWindow.srvName] = _icl[LT.main.layoutWindow.srvName];
								LT.main.layoutWindow.saveCityLayouts();
							}
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
			saveToCityNotes: function(c, s) {
				if (LT.options.saveSsCn == false) return;
				cgi = webfrontend.data.City.getInstance();
				cnt = cgi.getText();
				cnss = cnt.match(/\n?\[LTS\].+\[\/LTS\]/);
				if (c == "a") {
					lts = "\n[LTS]" + s + "[/LTS]";
					if (cnss != null) {
						cnt = cnt.replace(cnss[0], lts);
					} else {
						if (cnt.length + lts.length < 1000) cnt = cnt + lts;
						else return;
					}
				} else if (c == "r") {
					if (cnss != null) {
						cnt = cnt.replace(cnss[0], "");
					} else
						return;
				}
				webfrontend.net.CommandManager.getInstance().sendCommand("CityNoteSet", {
					cityid: cgi.getId(),
					reference: cgi.getReference(),
					text: cnt
				}, this, this.fireChangeVer);
				
			},
			fireChangeVer: function() {
				pgi = webfrontend.data.Player.getInstance();
				pgi.fireDataEvent("changeVersion", pgi.getVersion());
			}
		}
	});

});