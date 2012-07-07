/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:25
 */
(function (window, undefined) {
    qx.Class.define("bos.gui.MyAlliancePage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("my alliance"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["id", "rank", "status", "name", "title", "score", "cities", "role", "lastLogin"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(3, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);

            columnModel.setColumnWidth(1, 64);
            columnModel.setColumnWidth(2, 64);

            columnModel.setColumnWidth(3, 120);
            columnModel.setDataCellRenderer(3, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(4, 64);
            columnModel.setColumnWidth(5, 100);
            columnModel.setColumnWidth(6, 64);

            columnModel.setColumnWidth(7, 100);
            columnModel.setColumnWidth(8, 120);

            //var dateRenderer = new qx.ui.table.cellrenderer.Date();
            //dateRenderer.setDateFormat(qx.util.format.DateFormat.getDateTimeInstance());
            //columnModel.setDataCellRenderer(8, dateRenderer);

            this.add(this.table, { flex : 1 });

        }, members: {
            allianceInfo: null,
            createRowData: function() {
                var rowData = [];

                if (this.allianceInfo == null) {
                    return rowData;
                }

                var roles = webfrontend.data.Alliance.getInstance().getRoles();

                var statuses = [tr("offline"), tr("online"), tr("afk"), tr("hidden")];

                var dateFormat = new qx.util.format.DateFormat("yyyy.MM.dd HH:mm");

                var titles = webfrontend.res.Main.getInstance().playerTitles;

                for (var i = 0; i < this.allianceInfo.length; i++) {
                    var item = this.allianceInfo[i];

                    //{"c":494,"i":247863,"l":"01\/08\/2011 13:43:16","n":"Urthadar","o":3,"os":0,"p":4756785,"r":312856,"ra":5,"t":10},

                    var row = [];
                    row["id"] = item.i;
                    row["rank"] = item.ra;
                    row["status"] = statuses.hasOwnProperty(item.o) ? statuses[item.o] : item.o;
                    row["name"] = item.n;
                    row["title"] = titles[item.t].dn;
                    row["score"] = item.p;
                    row["cities"] = item.c;
                    row["role"] = roles != null ? roles[item.r].Name : item.r;
                    //row["lastLogin"] = qx.util.format.DateFormat.getDateTimeInstance("short").format(new Date(item.l));
                    row["lastLogin"] = dateFormat.format(new Date(item.l));

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

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    bos.net.CommandManager.getInstance().sendCommand("AllianceGetMemberInfos", {}, this, this.parseAllianceInfo);
                }, this);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

                return toolBar;
            },
            parseAllianceInfo: function(isOk, result) {
                if (isOk == false || result == null) {
                    alert("Not found");
                    return;
                }

                this.allianceInfo = result;
                this.updateView();
            }
        }
    });
})(window);