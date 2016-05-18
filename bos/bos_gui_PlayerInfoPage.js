/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:29
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.PlayerInfoPage");

    qx.Class.define("bos.gui.PlayerInfoPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);

            this.setLabel(tr("player"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["id", "type", "name", "continent", "position", "score"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(2, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);

            columnModel.setColumnWidth(2, 120);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(4, 64);
            columnModel.setDataCellRenderer(4, new bos.ui.table.cellrenderer.ClickableLook());

            columnModel.setColumnWidth(5, 64);

            this.add(this.table, { flex : 1 });

        },
        members: {
            cbLand: null,
            cbWater: null,
            cbCities: null,
            cbCastles: null,
            cbPalaces: null,
            minScoreInput: null,
            playerInfo: null,

            createRowData: function() {
                var rowData = [];

                if (this.playerInfo == null) {
                    return rowData;
                }

                var minScore = parseInt(this.minScoreInput.getValue());

                for (var i = 0; i < this.playerInfo.c.length; i++) {
                    var city = this.playerInfo.c[i];

                    if (city.s == 0 && !this.cbCities.getValue()) {
                        continue;
                    }
                    if (city.s == 1 && !this.cbCastles.getValue()) {
                        continue;
                    }
                    if (city.s == 2 && !this.cbPalaces.getValue()) {
                        continue;
                    }
                    if (city.w == 1) {
                        if (!this.cbWater.getValue()) {
                            continue;
                        }
                    } else {
                        if (!this.cbLand.getValue()) {
                            continue;
                        }
                    }

                    if (city.p < minScore) {
                        continue;
                    }

                    var row = [];

                    row["id"] = city.i;

                    var type = (city.w == 1) ? tr("water") : tr("land");
                    type += " ";
                    switch (city.s) {
                        case 0:
                            type += tr("city");
                            break;
                        case 1:
                            type += tr("castle");
                            break;
                        case 2:
                            type += tr("palace");
                            break;
                    }
                    row["type"] = type;
                    row["name"] = city.n;
                    row["continent"] = webfrontend.data.Server.getInstance().getContinentFromCoords(city.x, city.y);
                    row["position"] = city.x + ":" + city.y;
                    row["score"] = city.p;

                    rowData.push(row);
                }

                return rowData;
            },
            _handleCellClick: function(event) {

                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);

                var pos = rowData["position"];
                if (pos != null) {
                    var coords = bos.Utils.extractCoordsFromClickableLook(pos);
                    var sepPos = coords.indexOf(":");
                    if (sepPos > 0) {
                        var x = parseInt(coords.substring(0, sepPos), 10);
                        var y = parseInt(coords.substring(sepPos + 1), 10);
                        this._louApp.setMainView('r', 0, x * this._louApp.visMain.getTileWidth(), y * this._louApp.visMain.getTileHeight());
                    }
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.playerName = new qx.ui.form.TextField("");
                this.playerName.setToolTipText(tr("player name"));
                this.playerName.setWidth(120);

                this._louApp.setElementModalInput(this.playerName);
                toolBar.add(this.playerName);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    var name = this.playerName.getValue();
                    bos.net.CommandManager.getInstance().sendCommand("GetPublicPlayerInfoByName", {
                        name: name
                    }, this, this.parsePublicPlayerInfo, name);
                }, this);

                var btnCsvExport = new qx.ui.form.Button(tr("btnCsvExport"));
                btnCsvExport.setWidth(100);
                toolBar.add(btnCsvExport);
                btnCsvExport.addListener("execute", function(evt) {
                    this.table.exportToCsv();
                }, this);

                var btnTxtExport = new qx.ui.form.Button(tr("btnTxtExport"));
                btnTxtExport.setWidth(100);
                toolBar.add(btnTxtExport);
                btnTxtExport.addListener("execute", function(evt) {
                    this._exportToTxt();
                }, this);

                this.minScoreInput = new webfrontend.gui.SpinnerInt(0, 0, 10000000);
                this.minScoreInput.setToolTipText(tr("minScoreInput_toolTip"));
                this.minScoreInput.setWidth(60);
                this.minScoreInput.addListener("changeValue", this.updateView, this);
                toolBar.add(this.minScoreInput);

                this.cbLand = new qx.ui.form.CheckBox(tr("land"));
                this.cbLand.setValue(true);
                this.cbLand.addListener("execute", this.updateView, this);
                toolBar.add(this.cbLand);

                this.cbWater = new qx.ui.form.CheckBox(tr("water"));
                this.cbWater.setValue(true);
                this.cbWater.addListener("execute", this.updateView, this);
                toolBar.add(this.cbWater);

                this.cbCities = new qx.ui.form.CheckBox(tr("cities"));
                this.cbCities.setValue(true);
                this.cbCities.addListener("execute", this.updateView, this);
                toolBar.add(this.cbCities);

                this.cbCastles = new qx.ui.form.CheckBox(tr("castles"));
                this.cbCastles.setValue(true);
                this.cbCastles.addListener("execute", this.updateView, this);
                toolBar.add(this.cbCastles);

                this.cbPalaces = new qx.ui.form.CheckBox(tr("palaces"));
                this.cbPalaces.setValue(true);
                this.cbPalaces.addListener("execute", this.updateView, this);
                toolBar.add(this.cbPalaces);

                return toolBar;
            },
            _exportToTxt: function() {
                var sb = new qx.util.StringBuilder(2048);
                var sep = " - ";
                var rows = this.createRowData();
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    sb.add(row["continent"], " ", row["position"], sep);
                    sb.add(row["type"], sep, row["name"], sep);
                    sb.add("\n");
                }
                bos.Utils.displayLongText(sb.get());
            },
            parsePublicPlayerInfo: function(isOk, result, name) {
                if (isOk == false || result == null) {
                    alert("Not found " + name);
                    return;
                }

                this.playerInfo = result;
                this.updateView();
            }
        }
    });
});