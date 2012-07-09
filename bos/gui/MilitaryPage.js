/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:36
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.MilitaryPage");

    qx.Class.define("bos.gui.MilitaryPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("military"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();
            var columnNames = [ tr("id"), tr("name"), tr("position"), tr("reference")];
            var columnIds = ["id", "name", "position", "reference"];
            for (var i = 1; i <= 19; i++) {
                if (i == 18) continue;
                var unitName = formatUnitType(i, 2);
                columnNames.push(unitName);
                columnIds.push("unit_" + i);
            }
            columnNames.push("TS");
            columnIds.push("ts");

            columnNames.push("Summary (dbl click to select)");
            columnIds.push("summary_military");

            this._tableModel.setColumns(columnNames, columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(1, true);
            this._tableModel.setColumnEditable(23, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(2, 64);

            var res = webfrontend.res.Main.getInstance();

            for (var i = 1; i <= 19; i++) {
                if (i == 18) continue;

                var col = i + 3;
                if (i == 19) {
                    col--;
                }

                columnModel.setColumnWidth(col, 60);
            }

            columnModel.setColumnWidth(20, 50);
            columnModel.setDataCellRenderer(1, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(23, 400);

            this.add(this.table, {flex: 1});
        },
        members: {
            table: null,
            _tableModel: null,
            sbCityType: null,
            sbContinents: null,
            createRowData: function() {
                var rowData = [];

                var cities = webfrontend.data.Player.getInstance().cities;

                var sum = [];
                this._addBlankValuesToRow(sum, this._tableModel);
                sum["id"] = "Total";
                sum["name"] = "Total";
                sum["ts"] = 0;
                sum["summary_defenders_ts"] = 0;

                var server = bos.Server.getInstance();
                for (var cityId in cities) {
                    var c = cities[cityId];

                    if (!this._shouldBeIncluded(c)) {
                        continue;
                    }

                    if (c == null) {
                        continue;
                    }

                    var unknownValue = "";

                    var row = [];
                    this._addBlankValuesToRow(row, this._tableModel);
                    row["id"] = cityId;
                    row["name"] = c.name;
                    row["position"] = c.xPos + ":" + c.yPos;
                    row["reference"] = c.reference;

                    var city = server.cities[cityId];
                    if (city != undefined) {
                        getSummaryWidget()._addDefendersToRow(city, row, sum);
                    }

                    rowData.push(row);
                }

                if (rowData.length > 0) {
                    rowData.push(sum);
                }

                return rowData;
            },
            _shouldBeIncluded: function(city) {
                var selectedCityType = null;
                var sel = this.sbCityType.getSelection();
                if (sel != null && sel.length > 0) {
                    selectedCityType = sel[0].getModel();
                }

                var selectedContinent = this.sbContinents.getSelection()[0].getModel();

                return bos.Utils.shouldCityBeIncluded(city, selectedCityType, selectedContinent);
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                var cityId = rowData["id"];
                if (cityId == "Total") {
                    return;
                }
                switch (event.getColumn()) {
                    case 1:
                        a.setMainView("c", cityId, -1, -1);
                        break;
                    case 2:
                        var cities = webfrontend.data.Player.getInstance().cities;
                        var city = cities[cityId];
                        if (city != null) {
                            var coords = bos.Utils.convertIdToCoordinatesObject(cityId);
                            a.setMainView('r', 0, coords.xPos * a.visMain.getTileWidth(), coords.yPos * a.visMain.getTileHeight());
                        }
                        break;
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbCityType = bos.Utils.createCitiesTypesSelectBox();
                bos.Utils.populateCitiesTypesSelectBox(this.sbCityType);
                this.sbCityType.addListener("changeSelection", this.updateView, this);
                bos.Storage.getInstance().addListener("changeCustomCityTypesVersion", function(event) {
                    bos.Utils.populateCitiesTypesSelectBox(this.sbCityType);
                }, this);
                toolBar.add(this.sbCityType);

                this.sbContinents = bos.Utils.createCitiesContinentsSelectBox();
                this.sbContinents.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbContinents);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    this.updateView();
                }, this);

                return toolBar;
            }
        }
    });
});