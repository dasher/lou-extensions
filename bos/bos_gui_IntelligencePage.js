/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:27
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.IntelligencePage");

    qx.Class.define("bos.gui.IntelligencePage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel(tr("intelligence"));
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnIds = ["cityId", "name", "position", "isLandlocked", "hasCastle", "owner", "description", "lastModified", "modifiedBy", "edit", "delete"];

            this._tableModel.setColumns(bos.Utils.translateArray(columnIds), columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(3, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(1, 100);
            columnModel.setColumnWidth(2, 64);
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setColumnWidth(3, 64);
            columnModel.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());
            columnModel.setColumnWidth(4, 64);
            columnModel.setDataCellRenderer(4, new qx.ui.table.cellrenderer.Boolean());
            columnModel.setColumnWidth(5, 100);
            columnModel.setColumnWidth(6, 160);
            columnModel.setColumnVisible(7, false);
            columnModel.setColumnVisible(8, false);
            columnModel.setColumnWidth(9, 64);
            columnModel.setDataCellRenderer(9, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setColumnWidth(10, 64);
            columnModel.setDataCellRenderer(10, new bos.ui.table.cellrenderer.ClickableLook());

            this.add(this.table, { flex : 1 });

            bos.Storage.getInstance().addListener("changeIntelligenceVersion", this.updateWholeView, this);
            this.updateWholeView();

        }, members: {
            _optionsWidget: null,
            sbLandOrWater: null,
            sbOwnerName: null,
            sbCityType: null,
            sbContinent: null,
            _sbContinentAsList: "_",
            _sbOwnerNameAsList: "_",
            createRowData: function() {
                var rowData = [];

                var sel;

                var landOrWater = "";
                sel = this.sbLandOrWater.getSelection();
                if (sel != null && sel.length > 0) {
                    landOrWater = sel[0].getModel();
                }

                var cityType = "";
                sel = this.sbCityType.getSelection();
                if (sel != null && sel.length > 0) {
                    cityType = sel[0].getModel();
                }

                var continent = -1;
                sel = this.sbContinent.getSelection();
                if (sel != null && sel.length > 0) {
                    continent = parseInt(sel[0].getModel(), 10);
                }

                var ownerName = "";
                sel = this.sbOwnerName.getSelection();
                if (sel != null && sel.length > 0) {
                    ownerName = sel[0].getModel();
                }

                var storage = bos.Storage.getInstance();
                var intelligence = storage.getIntelligence();

                var dateFormat = new qx.util.format.DateFormat("yyyy.MM.dd HH:mm");

                for (var i = 0; i < intelligence.length; i++) {
                    var item = intelligence[i];

                    if (landOrWater == "L" && !item.isLandlocked) {
                        continue;
                    } else if (landOrWater == "W" && item.isLandlocked) {
                        continue;
                    }

                    if (cityType == "C" && !item.hasCastle) {
                        continue;
                    } else if (cityType == "T" && item.hasCastle) {
                        continue;
                    }

                    var pos = bos.Utils.convertIdToCoordinatesObject(item.cityId);
                    if (continent != -1 && continent != pos.cont) {
                        continue;
                    }

                    if (ownerName != "" && ownerName != item.owner) {
                        continue;
                    }

                    var row = [];
                    row["cityId"] = item.cityId;
                    row["name"] = item.name;
                    row["position"] = bos.Utils.convertIdToCoodrinates(item.cityId);
                    row["isLandlocked"] = item.isLandlocked;
                    row["owner"] = item.owner;
                    row["description"] = item.description;
                    row["hasCastle"] = item.hasCastle;
                    row["lastModified"] = item.lastModified;
                    row["modifiedBy"] = item.modifiedBy;
                    row["edit"] = this._createActionButton(tr("edit"));
                    row["delete"] = this._createActionButton(tr("delete"));

                    rowData.push(row);
                }

                return rowData;
            },
            _handleCellClick: function(event) {

                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);

                var cityId = parseInt(rowData["cityId"], 10);

                switch (event.getColumn()) {
                    case 0:
                    case 1:
                    case 2:
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
                        break;
                    case 5:
                        this._louApp.showInfoPage(this._louApp.getPlayerInfoPage(), {
                            name: rowData["owner"]
                        });
                        break;
                    case 9:
                        var widget = this._getOptionsWidget();
                        widget.prepareView(cityId);
                        widget.open();
                        break;
                    case 10:

                        if (confirm(tr("are you sure?"))) {
                            var storage = bos.Storage.getInstance();
                            storage.removeIntelligence(cityId);
                        }
                        break;
                }

            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbOwnerName = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });
                this.sbOwnerName.setToolTipText(tr("filter by: owner name"));
                this.sbOwnerName.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbOwnerName);

                this.sbCityType = new qx.ui.form.SelectBox().set({
                    width: 60,
                    height: 28
                });
                this.sbCityType.setToolTipText(tr("filter by: city type"));
                this.sbCityType.add(new qx.ui.form.ListItem(tr("any"), null, ""));
                this.sbCityType.add(new qx.ui.form.ListItem(tr("castle"), null, "C"));
                this.sbCityType.add(new qx.ui.form.ListItem(tr("city"), null, "T"));
                this.sbCityType.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbCityType);

                this.sbLandOrWater = new qx.ui.form.SelectBox().set({
                    width: 60,
                    height: 28
                });
                this.sbLandOrWater.setToolTipText(tr("filter by: land or water"));
                this.sbLandOrWater.add(new qx.ui.form.ListItem(tr("any"), null, ""));
                this.sbLandOrWater.add(new qx.ui.form.ListItem(tr("land"), null, "L"));
                this.sbLandOrWater.add(new qx.ui.form.ListItem(tr("water"), null, "W"));
                this.sbLandOrWater.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbLandOrWater);

                this.sbContinent = new qx.ui.form.SelectBox().set({
                    width: 60,
                    height: 28
                });
                this.sbContinent.setToolTipText(tr("filter by: continent"));
                this.sbContinent.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbContinent);

                var btnAddIntel = new qx.ui.form.Button(tr("btnAddIntel"));
                btnAddIntel.setToolTipText(tr("btnAddIntel_toolTip"));
                btnAddIntel.setWidth(100);
                btnAddIntel.addListener("execute", this.addIntel, this);
                toolBar.add(btnAddIntel);

                var btnExportSettings = new qx.ui.form.Button(tr("btnExportSettings"));
                btnExportSettings.setToolTipText(tr("btnExportSettings_toolTip"));
                btnExportSettings.setWidth(120);
                btnExportSettings.addListener("execute", this.exportSettings, this);
                toolBar.add(btnExportSettings);

                var btnImportSettings = new qx.ui.form.Button(tr("btnImportSettings"));
                btnImportSettings.setToolTipText(tr("btnImportSettings_toolTip"));
                btnImportSettings.setWidth(120);
                btnImportSettings.addListener("execute", this.importSettings, this);
                toolBar.add(btnImportSettings);

                return toolBar;
            },
            _createActionButton: function(caption, color) {
                var format = "<div style=\"background-image:url(%1);color:%3;cursor:pointer;margin-left:-6px;margin-right:-6px;margin-bottom:-3px;font-size:11px;height:19px\" align=\"center\">%2</div>";
                if (color == undefined) {
                    color = "#f3d298";
                }
                return qx.lang.String.format(format, [this.buttonActiveUrl, caption, color]);
            },
            addIntel: function() {
                var widget = this._getOptionsWidget();
                widget.prepareView(-1);
                widget.open();
            },
            _getOptionsWidget: function() {
                if (this._optionsWidget == null) {
                    this._optionsWidget = new bos.gui.IntelligenceOptionsWidget();
                }
                return this._optionsWidget;
            },
            exportSettings: function() {
                var storage = bos.Storage.getInstance();
                var intel = storage.getIntelligence();

                var json = qx.util.Json.stringify(intel);
                bos.Utils.displayLongText(json);
            },
            importSettings: function() {
                bos.Utils.inputLongText(function (json) {
                    var storage = bos.Storage.getInstance();
                    storage.mergeIntelligence(json);
                });
            },
            _populateContinentsSelectBox: function(sb, list) {
                list.sort();
                var newValues = list.join(",");
                if (newValues == this._sbContinentAsList) {
                    return;
                }
                this._sbContinentAsList = newValues;

                var previouslySelected = -1;
                var sel = sb.getSelection();
                if (sel != null && sel.length > 0) {
                    previouslySelected = sel[0].getModel();
                }

                sb.removeListener("changeSelection", this.updateView, this);

                sb.removeAll();
                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, -1));
                for (var i = 0; i < list.length; i++) {
                    var cont = list[i];
                    sb.add(new qx.ui.form.ListItem(sprintf("C%02d", cont), null, cont));
                }

                sb.addListener("changeSelection", this.updateView, this);

                if (previouslySelected != -1) {
                    sb.setModelSelection([previouslySelected]);
                }
            },
            _populateOwnersSelectBox: function(sb, list) {
                list.sort();
                var newValues = list.join(",");
                if (newValues == this._sbOwnerNameAsList) {
                    return;
                }
                this._sbOwnerNameAsList = newValues;

                var previouslySelected = -1;
                var sel = sb.getSelection();
                if (sel != null && sel.length > 0) {
                    previouslySelected = sel[0].getModel();
                }

                sb.removeListener("changeSelection", this.updateView, this);

                sb.removeAll();
                sb.add(new qx.ui.form.ListItem(this.tr("tnf:all"), null, ""));
                for (var i = 0; i < list.length; i++) {
                    var name = list[i];
                    sb.add(new qx.ui.form.ListItem(name, null, name));
                }

                sb.addListener("changeSelection", this.updateView, this);

                if (previouslySelected != -1) {
                    sb.setModelSelection([previouslySelected]);
                }
            },
            updateWholeView: function() {

                var storage = bos.Storage.getInstance();
                var intelligence = storage.getIntelligence();

                var continents = new Array();
                var addedContinents = new Object();
                var owners = new Array();
                var addedOwners = new Object();

                for (var i = 0; i < intelligence.length; i++) {
                    var item = intelligence[i];

                    var pos = bos.Utils.convertIdToCoordinatesObject(item.cityId);
                    if (addedContinents[pos.cont] == undefined) {
                        addedContinents[pos.cont] = true;
                        continents.push(pos.cont);
                    }

                    if (addedOwners[item.owner] == undefined) {
                        addedOwners[item.owner] = true;
                        owners.push(item.owner);
                    }
                }

                this._populateContinentsSelectBox(this.sbContinent, continents);
                this._populateOwnersSelectBox(this.sbOwnerName, owners);

                this.updateView();
            }
        }
    });
});