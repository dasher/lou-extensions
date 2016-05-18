/**
 * Created by TriMoon <http://claimid.com/trimoon>
 * Date: 2012/08/29
 * LoU Tweak:
 * 		Author: AmpliDude
 * 		Script: http://userscripts.org/scripts/show/80532
 */
loader.addFinishHandler(function() {
	GM_log("louTweak - defining incomingResourcesLabel");

	qx.Class.define("louTweak.incomingResourcesLabel", {
		extend: qx.core.Object,
		construct: function () {
			m = webfrontend.res.Main.getInstance();
			this.incResCont = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			this.incResContBgr = new qx.ui.basic.Image("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVIAAABFCAMAAAAvr55KAAABX1BMVEVtSytsSiubjXRpRytqSCtbVUdoTz/Bm36jfGOie2OifGOajHSajXSFe2VwZ1VtYlGlfWSYdV6KajJmRCuhk3mYinGYcFl2VSuunoJtU0J3XUqngWe+rY5+c2BdUkN+XkvAmn18ZVLOvJuomX5lVkammH3dyabGtJWvn4PZxqNjXU2gknjFtJSZi3J0UythPiuThWyXclqYc1uUhW2ShGyfeGDl0Kt3VitfPCuac1qcdl1eOyuShGtgPStjQSuhkXeUhm2ohmuAXytVMSt5WCvSv5yThGzEqYmed19vTSt9XCtwTiuXcVrl0ayWcFpyUStdOiuYiXCWcVp7Wiu7nH+wnoJxUCtrSSvBr5CXc1vm0azdyaWZc1uShWyBYSuThG3kz6qVhm6wj3Z8WyuhemJ1VCuadFxuTCvjzanJsJCSczygeWGajHOie2JkQiueeF9XMyuIaDBiPyuVh26XiHAEM5p5AAACG0lEQVR4XuzW1W0FQRiD0b+imWXey8zMzBBO+lfSQ/zoU8InWbIsvN3IfYcgd7TzFuK1q6ECobDa9uR2Dx8fIPQI7zdZ5g/FNxAqHvJLKUc9nYKQ7kVlma2QSZl0NZOxldEwlLHGkjU1EJlZ6ZspEJl9sVspELVscToaiDqOJNCk1EnEgA6fWgY+KZM6Aw1EA0cSaFIaJGJAfymZhhjzWKcgpOO5IWtLxV8gFCtrLZXLZhoEMQAFwXRzqcg2KhUyIFQoRVuxa/6wNCwA0F9Iv2bL3lX+sfEJQI2jr9y95J5dpc4NADor1X3m5PvUnHRBaNI8vcjP6/Var9eb/0a/7NnBbcQwDETRCU+S7IPtRcpIIapEF9L9H4OtIWNggfxXgA4DkYSoOedaFfqu9Tb/DOutdn+kRPrTlxF6KpuM0ELRvozQQnuTEVr4C59Io2SESsWQEcZmHk9ooXRHSqRbyYxeWjIj0i4j9Pz0Xsp4Qgtz4aOnP1IizZIRyj2e8Mi+lEiHjDA2bUNeRJolMx6kTR+P7zwmvozQwtxLUfnvJj5/T7yeYO+lqFR2GaHnE4XP2mR92WCNUB73lAnmfaTivF7TBK/rDP22AydXDIJAAEDniUlO4IXHvuOurdB/O2lijvNlVZohIVpVCWZxns0oCPNuMRB4yuWHgpSceIDWxWq/KIhdRW+wH1u8PyjIHbdjh3G95zOhIM/5XuMPR3QydajAz8UAAAAASUVORK5CYII=");
			this.incResContBgr.setWidth(338);
			this.incResContBgr.setHeight(69);
			this.incResCont.add(this.incResContBgr, {left: 0, top: 0});
			this.incResLab = new qx.ui.basic.Label("Incoming resources").set({font: "bold", textColor: "#ffCC82"});
			this.incResCont.add(this.incResLab, {left: 8, top: 3});
			this.incResLabNext = new qx.ui.basic.Label("Next arrival in:").set({font: "bold", width: 150, textAlign: "right", textColor: "#ffCC82"});
			this.incResCont.add(this.incResLabNext, {left: 180, top: 3});
			this.incResLabTr = new qx.ui.basic.Label("TR:").set({font: "bold", textColor: "#ffCC82"});
			this.incResCont.add(this.incResLabTr, {left: 6, top: 38});
			this.incResLabFs = new qx.ui.basic.Label("FS:").set({font: "bold", textColor: "#ffCC82"});
			this.incResCont.add(this.incResLabFs, {left: 7, top: 50});
			for (i=0; i<4; i++) {
				imgo = m.getFileInfo(m.resources[i+1].i);
				incResImg = new qx.ui.basic.Image(webfrontend.config.Config.getInstance().getUIImagePath(imgo.url));
				incResImg.setHeight(22);
				incResImg.setWidth(20);
				incResImg.setScale(true);
				this.incResCont.add(incResImg, {top: 17, left: 5 + 83*i});
				incResLab = new qx.ui.basic.Label("").set({width: 62, textAlign: "center", font: "bold"});
				this.incResCont.setUserData("incResLab" + (i+1), incResLab);
				this.incResCont.add(incResLab, {top: 21, left: 27 + 82*i});
				incResLab = new qx.ui.basic.Label("").set({width: 62, textAlign: "center", font: "bold"});
				this.incResCont.setUserData("incResLabTot" + (i+1), incResLab);
				this.incResCont.add(incResLab, {top: 38, left: 27 + 82*i});
				incResLab = new qx.ui.basic.Label("").set({width: 62, textAlign: "center", font: "bold"});
				this.incResCont.setUserData("incResLabFree" + (i+1), incResLab);
				this.incResCont.add(incResLab, {top: 50, left: 27 + 82*i});
			}
			
			webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateIncResCont, this);
		},
		members: {
			incResCont: null,
			incResContBgr: null,
			incResLab: null,
			incResLabNext: null,
			incResLabTr: null,
			incResLabFs: null,
			updateIncResCont: function() {
				var c = webfrontend.data.City.getInstance();
				it = c.getTradeIncoming();
				ot = c.getTradeOrders();
				if (LT.options.showIncResCont == 0) {
					this.incResCont.setVisibility("excluded");
					return;
				}
				if (it == null || it == undefined) {
					if (LT.options.showIncResCont == 2) {
						this.incResCont.setVisibility("excluded");
						return;
					}
					this.incResCont.setVisibility("visible");
					it = [];
				}
				this.incResCont.setVisibility("visible");
				var resVal = [0,0,0,0,0,-1]; // 0 - last trader, 1-4 res, 5 - first trader
				for (i=0; i<it.length; i++) {
					for (j=0; j<it[i].resources.length; j++) {
						resVal[it[i].resources[j].type] += it[i].resources[j].count;
					}
					if (it[i].end > resVal[0])
						resVal[0] = it[i].end;
					if (resVal[5] == -1 || it[i].end < resVal[5])
						resVal[5] = it[i].end;
				}

				for (i=1; i<5; i++) {
					freeSpc = 0;
					curVal = c.getResourceCount(i);
					curDel = (c.resources[i] == undefined ? 0 : c.resources[i].delta);
					curMax = c.getResourceMaxStorage(i);
					dateNow = new Date().getTime();
					this.incResCont.getUserData("incResLab" + i).setTextColor("#FFCC82");
					this.incResCont.getUserData("incResLab" + i).setValue(LT.thSep(resVal[i]));
					ft = 0;
					if (i == 4) {
						fc = Math.round(c.getFoodConsumption() * 3600);
						fcs = Math.round(c.getFoodConsumptionSupporter() * 3600);
						ft = c.getResourceGrowPerHour(i) - fc - fcs;
					}
					if (it.length > 0) {
						timeSpan = resVal[0] - st.getServerStep();
						resAtArrival = Math.floor(curVal + ((i == 4) ? ft*timeSpan/3600 : timeSpan * curDel) + resVal[i]);
						
						if (curVal == curMax)
							freeSpc = -resVal[i];
						else
							freeSpc = curMax - resAtArrival;
							
						if (resAtArrival > curMax) resAtArrival = curMax;
					} else {
						resAtArrival = Math.floor(curVal);
						freeSpc = curMax - curVal;
					}
					this.incResCont.getUserData("incResLabTot" + i).setValue(LT.thSep(resAtArrival));
					this.incResCont.getUserData("incResLabFree" + i).setValue(LT.thSep(Math.floor(freeSpc)));
					
					if (freeSpc < 0) {
						clr = LT.options.incResClrs[0];
					} else {
						clr = "#FFCC82";
					}
					this.incResCont.getUserData("incResLabFree" + i).setTextColor(clr);
					
					r = resAtArrival/curMax;
					clr = LT.options.incResClrs[3];
					if (r > 0) {
						if (r >= 1.0) {
							clr = LT.options.incResClrs[0];
						} else if (r >= 0.9) {
							clr = LT.options.incResClrs[1];
						} else if (r >= 0.75) {
							clr = LT.options.incResClrs[2];
						} else {
							clr = LT.options.incResClrs[3];
						}
					}
					this.incResCont.getUserData("incResLabTot" + i).setTextColor(clr);
				}
				
				if (it.length > 0) {
					timeSpan = resVal[5] - st.getServerStep();
					this.incResLabNext.setValue("Next arrival in: " + webfrontend.Util.getTimespanString(timeSpan));
				} else
					this.incResLabNext.setValue("");
			}
		}
	});

});