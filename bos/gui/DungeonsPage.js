/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:33
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.gui.DungeonsPage");

    qx.Class.define("bos.gui.DungeonsPage", {
        extend: bos.gui.SummaryPage,
        construct: function() {
            bos.gui.SummaryPage.call(this);
            this.setLabel("Dungeons");
            this.setLayout(new qx.ui.layout.VBox(10));

            this.add(this._createToolBar());

            this._tableModel = new qx.ui.table.model.Simple();

            var columnNames;
            if( locale == "de") {
                columnNames = [ "Id", "Name", "Pos", "Level", "Fortschritt", "Entfernung" ];
            } else {
                columnNames = [ "Id", "Name", "Pos", "Level", "Progress", "Distance" ];
            }

            var columnIds = ["id", "name", "position", "level", "progress", "distance"];

            this._tableModel.setColumns(columnNames, columnIds);

            this._setupSorting(this._tableModel);
            this._tableModel.sortByColumn(5, true);

            this.table = new bos.ui.table.Table(this._tableModel);
            this.table.addListener("cellClick", this._handleCellClick, this);

            var columnModel = this.table.getTableColumnModel();

            var res = webfrontend.res.Main.getInstance();

            columnModel.setColumnVisible(0, false);
            columnModel.setColumnWidth(1, 180);
            columnModel.setColumnWidth(2, 64);
            columnModel.setDataCellRenderer(1, new bos.ui.table.cellrenderer.ClickableLook());
            columnModel.setDataCellRenderer(2, new bos.ui.table.cellrenderer.ClickableLook());

            this.add(this.table, {flex: 1});

        },
        members: {
            sbDungeonTypes: null,
            sbBossTypes: null,
            createRowData: function() {
                var rowData = [];

                if (a.visMain.getMapMode() == "r") {
                    var cities = webfrontend.data.Player.getInstance().cities;
                    var city = webfrontend.data.City.getInstance();
                    var c = cities[city.getId()];

                    var res = webfrontend.res.Main.getInstance();
                    var se = a.visMain.selectableEntities;

                    for (var s in se) {
                        var entity = se[s];
                        if (entity != null && entity instanceof ClientLib.Vis.Region.RegionDungeon) {
                            if (!this._shouldBeIncluded(entity)) {
                                continue;
                            }
                            var row = [];
                            this._addBlankValuesToRow(row, this._tableModel);
                            row["id"] = entity.id;
                            var dungeonType = Math.abs(entity.id);
                            row["name"] = res.dungeons[dungeonType].dn + " (" + entity.get_Level() + ")";
                            row["position"] = entity.get_Coordinates();
                            row["level"] = entity.get_Level();
                            row["progress"] = entity.get_Progress();

                            var diffX = Math.abs(c.xPos - entity.getPosX());
                            var diffY = Math.abs(c.yPos - entity.getPosY());
                            row["distance"] = Math.sqrt(diffX * diffX + diffY * diffY);;
                            rowData.push(row);
                        }
                    }
                }
                return rowData;

            },
            _shouldBeIncluded: function(dungeon) {
                if (dungeon.get_Progress() < 0) {
                    return false;
                }

                var sel = this.sbDungeonTypes.getSelection();
                if (sel == null || sel.length == 0) {
                    return false;
                }
                var dungeonType = Math.abs(dungeon.id);
                var reqType = sel[0].getModel();
                if (reqType != "A") {

                    switch (reqType) {
                        case "M":
                            if (dungeonType != 4 && dungeonType != 8) {
                                return false;
                            }
                            break;
                        case "F":
                            if (dungeonType != 5 && dungeonType != 6) {
                                return false;
                            }
                            break;
                        case "H":
                            if (dungeonType != 3 && dungeonType != 7) {
                                return false;
                            }
                            break;
                        case "S":
                            if (dungeonType != 2 && dungeonType != 12) {
                                return false;
                            }
                            break;
                    }
                }

                var bossType = this.sbBossTypes.getSelection()[0].getModel();
                if (bossType != "A") {
                    if (bossType == "B") {
                        if (dungeonType <= 5) {
                            return false;
                        }
                    } else if (bossType == "D") {
                        if (dungeonType > 5) {
                            return false;
                        }
                    }
                }

                return true;
            },
            _handleCellClick: function(event) {
                var row = event.getRow();
                var rowData = this._tableModel.getRowDataAsMap(row);
                var pos = rowData["position"];
                switch (event.getColumn()) {
                    case 1:
                    case 2:
                        if (pos != null) {
                            var coords = bos.Utils.extractCoordsFromClickableLook(pos);
                            var sepPos = coords.indexOf(":");
                            if (sepPos > 0) {
                                var x = parseInt(coords.substring(0, sepPos), 10);
                                var y = parseInt(coords.substring(sepPos + 1), 10);
                                a.setMainView('r', 0, x * a.visMain.getTileWidth(), y * a.visMain.getTileHeight());
                            }
                        }
                        break;
                }
            },
            _createToolBar: function() {
                var toolBar = new qx.ui.groupbox.GroupBox();
                toolBar.setLayout(new qx.ui.layout.Flow(10, 10));

                this.sbDungeonTypes = this._createDungeonTypesSelectBox();
                this.sbDungeonTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbDungeonTypes);

                this.sbBossTypes = this._createBossTypesSelectBox();
                this.sbBossTypes.addListener("changeSelection", this.updateView, this);
                toolBar.add(this.sbBossTypes);

                var btnUpdateView = new qx.ui.form.Button(tr("refresh"));
                btnUpdateView.setWidth(80);
                toolBar.add(btnUpdateView);
                btnUpdateView.addListener("execute", function(evt) {
                    this.updateView();
                }, this);

                return toolBar;
            },
            _createDungeonTypesSelectBox: function() {
                var dungeonTypes = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });
                dungeonTypes.setToolTipText("Filter by: <b>dungeon type</b>");

                dungeonTypes.add(new qx.ui.form.ListItem(tr("All"), null, "A"));
                dungeonTypes.add(new qx.ui.form.ListItem(tr("Mountain"), null, "M"));
                dungeonTypes.add(new qx.ui.form.ListItem(tr("Forest"), null, "F"));
                dungeonTypes.add(new qx.ui.form.ListItem(tr("Hill"), null, "H"));
                dungeonTypes.add(new qx.ui.form.ListItem(tr("Sea"), null, "S"));

                return dungeonTypes;
            },
            _createBossTypesSelectBox: function() {
                var sb = new qx.ui.form.SelectBox().set({
                    width: 120,
                    height: 28
                });
                sb.setToolTipText("Filter by: <b>boss type</b>");

                sb.add(new qx.ui.form.ListItem(tr("All"), null, "A"));
                sb.add(new qx.ui.form.ListItem(tr("Boss"), null, "B"));
                sb.add(new qx.ui.form.ListItem(tr("Dungeon"), null, "D"));

                return sb;
            }
        }
    });
});