/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:38
 */
(function (window, undefined) {
    qx.Class.define("bos.gui.ExtraSummaryWidget", {
        type: "singleton",
        extend: qx.ui.window.Window,
        construct: function() {
            qx.ui.window.Window.call(this);
            this.setLayout(new qx.ui.layout.Dock());

            var maxWidth = qx.bom.Viewport.getWidth(window);
            var maxHeight = qx.bom.Viewport.getHeight(window);

            pos = {
                left: 400,
                top: 150,
                width: 600,
                height: 500
            }

            this.set({
                width: pos.width,
                minWidth: 200,
                maxWidth: parseInt(maxWidth * 0.9),
                height: pos.height,
                minHeight: 200,
                maxHeight: parseInt(qx.bom.Viewport.getWidth(window) * 0.9),
                allowMaximize: false,
                allowMinimize: false,
                showMaximize: false,
                showMinimize: false,
                showStatusbar: false,
                showClose: false,
                caption: tr("extra summary"),
                resizeSensitivity: 7,
                contentPadding: 0,
                zIndex: 100000 - 1
            });

            this.moveTo(pos.left, pos.top);

            this.tabView = new qx.ui.tabview.TabView().set({
                contentPadding: 5
            });
            this.tabView.setAppearance("tabview");

            this.playerInfoTab = new bos.gui.PlayerInfoPage();
            this.tabView.add(this.playerInfoTab);

            this.allianceInfoTab = new bos.gui.AllianceInfoPage();
            this.tabView.add(this.allianceInfoTab);

            this.myAllianceTab = new bos.gui.MyAlliancePage();
            this.tabView.add(this.myAllianceTab);

            this.intelligenceTab = new bos.gui.IntelligencePage();
            this.tabView.add(this.intelligenceTab);

            this.tabView.addListener("changeSelection", this.onChangeTab, this);
            this.add(this.tabView);

            webfrontend.gui.Util.formatWinClose(this);

        },
        members: {
            tabView: null,
            playerInfoTab: null,
            allianceInfoTab: null,
            myAllianceTab: null,
            intelligenceTab: null,
            onChangeTab: function() {
                this.updateView();
            },
            updateView: function() {
                if (this.tabView.isSelected(this.playerInfoTab)) {
                    this.playerInfoTab.updateView();
                } else if (this.tabView.isSelected(this.allianceInfoTab)) {
                    this.allianceInfoTab.updateView();
                } else if (this.tabView.isSelected(this.myAllianceTab)) {
                    this.myAllianceTab.updateView();
                } else if (this.tabView.isSelected(this.intelligenceTab)) {
                    this.intelligenceTab.updateView();
                }
            },
            switchToIntelligenceTab: function() {
                this.tabView.setSelection([this.intelligenceTab]);
            }
        }
    });
})(window);