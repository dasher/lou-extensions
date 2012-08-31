/**
 * Created by TriMoon <http://claimid.com/trimoon>
 * Date: 2012/08/29
 * LoU Tweak:
 * 		Author: AmpliDude
 * 		Script: http://userscripts.org/scripts/show/80532
 */
loader.addFinishHandler(function() {
	GM_log("louTweak - defining queueTimesLabel");

	qx.Class.define("louTweak.queueTimesLabel", {
		extend: qx.core.Object,
		construct: function () {
			this.queueTimeCont = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
			this.queueTimeContBgr = new qx.ui.basic.Image("data:image/png;base64,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");
			this.queueTimeContBgr.setWidth(280);
			this.queueTimeContBgr.setHeight(50);
			this.queueTimeCont.add(this.queueTimeContBgr, {left: 0, top: 0});
			gr = new qx.ui.layout.Grid(3, 4);
			gr.setColumnMaxWidth(0, 20);
			gr.setColumnMinWidth(1, 200);
			gr.setColumnMaxWidth(2, 40);
			this.queueTimeGrid = new qx.ui.container.Composite(gr);
			this.queueTimeCont.add(this.queueTimeGrid, {left: 8, top: 8});
			this.queueTimeGrid.add(new qx.ui.basic.Label("BQ:").set({textColor: "text-gold", font: "bold"}), {column:0, row:0});
			this.queueTimeGrid.add(new qx.ui.basic.Label("UQ:").set({textColor: "text-gold", font: "bold"}), {column:0, row:1});
			this.buildQueueTimeLabel = new qx.ui.basic.Label("").set({textColor: "text-gold", font: "bold"});
			this.buildQueueSlotsLabel = new qx.ui.basic.Label("").set({textColor: "text-gold", font: "bold"});
			this.unitQueueTimeLabel = new qx.ui.basic.Label("").set({textColor: "text-gold", font: "bold"});
			this.unitQueueSlotsLabel = new qx.ui.basic.Label("").set({textColor: "text-gold", font: "bold"});
			this.queueTimeGrid.add(this.buildQueueTimeLabel, {column:1, row:0});
			this.queueTimeGrid.add(this.buildQueueSlotsLabel, {column:2, row:0});
			this.queueTimeGrid.add(this.unitQueueTimeLabel, {column:1, row:1});
			this.queueTimeGrid.add(this.unitQueueSlotsLabel, {column:2, row:1});
			
			webfrontend.base.Timer.getInstance().addListener("uiTick", this.updateQueueTimes, this);
		},
		members: {
			queueTimeCont: null,
			queueTimeContBgr: null,
			queueTimeGrid: null,
			buildQueueTimeLabel: null,
			buildQueueSlotsLabel: null,
			unitQueueTimeLabel: null,
			unitQueueSlotsLabel: null,
			updateQueueTimes: function() {
				if (LT.options.showQueueTimes)
					this.queueTimeCont.setVisibility("visible");
				else
					this.queueTimeCont.setVisibility("excluded");
				
				if (typeof LT.a.selectorBar.isMapSelectorBarAnchorToLeft != 'undefined') {
					if (LT.a.selectorBar.isMapSelectorBarAnchorToLeft()) {
						if (LT.a.selectorBar.contNavigationRose.isVisible())
							this.queueTimeCont.setLayoutProperties({left: 690, top: 65});
						else
							this.queueTimeCont.setLayoutProperties({left: 405, top: 135});
					} else {
						this.queueTimeCont.setLayoutProperties({left: 405, top: 65});
					}
				}

				p = webfrontend.data.Player.getInstance();
				b = webfrontend.data.City.getInstance().buildQueue;
				u = webfrontend.data.City.getInstance().unitQueue;
				st = webfrontend.data.ServerTime.getInstance();
				if (b != null) {
					timeSpan = b[b.length-1].end - st.getServerStep();
					endTime = webfrontend.Util.getDateTimeString(st.getStepTime(b[b.length-1].end));
					if (timeSpan < 0)
						this.buildQueueTimeLabel.setValue("0:00");
					else
						this.buildQueueTimeLabel.setValue(endTime + " (" + webfrontend.Util.getTimespanString(timeSpan) + ")");
					this.buildQueueSlotsLabel.setValue(b.length + " / " + p.getMaxBuildQueueSize());
				} else {
					this.buildQueueTimeLabel.setValue("0:00");
					this.buildQueueSlotsLabel.setValue("0" + " / " + p.getMaxBuildQueueSize());
				}
				if (u != null) {
					timeSpan = u[u.length-1].end - st.getServerStep();
					endTime = webfrontend.Util.getDateTimeString(st.getStepTime(u[u.length-1].end));
					if (timeSpan < 0)
						this.unitQueueTimeLabel.setValue("0:00");
					else
						this.unitQueueTimeLabel.setValue(endTime + " (" + webfrontend.Util.getTimespanString(timeSpan) + ")");
					this.unitQueueSlotsLabel.setValue(u.length + " / " + p.getMaxUnitQueueSize());
				} else {
					this.unitQueueTimeLabel.setValue("0:00");
					this.unitQueueSlotsLabel.setValue("0" + " / " + p.getMaxUnitQueueSize());
				}
			}
		}
	});

});