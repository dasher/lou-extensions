/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:29
 */
(function (window, undefined) {
    qx.Class.define("bos.gui.AllianceInfoPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("alliance"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["id", "rank", "name", "score", "cities"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            //this._tableModel.sortByColumn(2, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);

            columnModel.setColumnWidth(1, 64);

            columnModel.setColumnWidth(2, 120);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(4, 64);

            this.add(this.table, { flex : 1 });

        },
        members: {
            allianceInfo: null,
            playerInfo: null,
            createRowData: function() {

                var rowData = [];

                //{"c":353,"i":102497,"n":"Danzie","p":3402087,"r":11}

                if (this.allianceInfo == null || this.playerInfo == null) {
                    return rowData;
                }

                for (var i = 0; i < this.playerInfo.length; i++) {
                    var item = this.playerInfo[i];

                    var row = [];

                    row["id"] = item.i;
                    row["rank"] = item.r;
                    row["name"] = item.n;
                    row["score"] = item.p;
                    row["cities"] = item.c;

                    rowData.push(row);
                }

                return rowData;
            },
            _handleCellClick: function(event) {

                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                var name = rowData["name"];
                if (name != null) {
                    a.showInfoPage(a.getPlayerInfoPage(), {
                        name: name
                    });
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.allianceName = new qx.ui.form.TextField("");
                this.allianceName.setToolTipText(tr("alliance name"));
                this.allianceName.setWidth(120);
                a.setElementModalInput(this.allianceName);
                toolBar.add(this.allianceName);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    this.playerInfo = null;
                    this.allianceInfo = null;
                    var name = this.allianceName.getValue();
                    bos.net.CommandManager.getInstance().sendCommand("GetPublicAllianceInfoByNameOrAbbreviation", {
                        name: name
                    }, this, this.parsePublicAllianceInfoByNameOrAbbreviation, name);
                }, this);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

                return toolBar;
            },
            parsePublicAllianceInfoByNameOrAbbreviation: function(isOk, result, name) {
                if (isOk == false || result == null) {
                    alert("Not found " + name);
                    return;
                }

                this.allianceInfo = result;

                bos.net.CommandManager.getInstance().sendCommand("GetPublicAllianceMemberList", {
                    id: result.i
                }, this, this.parsePublicAllianceMemberList, name);
            },
            parsePublicAllianceMemberList: function(isOk, result, name) {
                if (isOk == false || result == null) {
                    alert("Not found (2)" + name);
                    return;
                }

                this.playerInfo = result;
                this.updateView();
            }
        }
    });
})(window);