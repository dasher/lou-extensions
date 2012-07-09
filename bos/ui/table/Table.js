/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:21
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.ui.table.Table");

    qx.Class.define("bos.ui.table.Table", {
        extend: qx.ui.table.Table,
        construct: function(tableModel, custom) {
            //this.base(arguments);
            qx.ui.table.Table.call(this, tableModel, custom);
            this._setupTableLookAndFeel();
        },
        members:  {
            _setupTableLookAndFeel: function() {
                this.setStatusBarVisible(false)
                var focusedRowBGColor = "#555555";
                var rowBGColor = "#373930";
                this.setDataRowRenderer(new webfrontend.gui.RowRendererCustom(this, focusedRowBGColor, focusedRowBGColor, rowBGColor, rowBGColor, rowBGColor, rowBGColor, rowBGColor, rowBGColor, rowBGColor));
                this.setHeaderCellHeight(22);
                var tcm = this.getTableColumnModel();

                debugger;

                for (var col = 0; col < tcm.getOverallColumnCount(); col++) {
                    tcm.setDataCellRenderer(col, new bos.ui.table.cellrenderer.Default());
                }

            },
            applyTableSettings: function(settings, tableName) {
                if (settings == null) {
                    return;
                }
                var tcm = this.getTableColumnModel();
                var tm = this.getTableModel();

                if (tcm.getOverallColumnCount() != settings.columns.length) {
                    if(locale == "de"){
                        bos.Utils.handleError("Die gespeicherten Werte sind für eine Tabelle mit " + settings.columns.length + "Spalten, diese Tabelle hat jedoch " + tcm.getOverallColumnCount() );
                    } else {
                        bos.Utils.handleError("Saved settings are for table with " + settings.columns.length + " but table has " + tcm.getOverallColumnCount() + " columns. Please save your '" + tableName + "' table layout again");
                    }
                    return;
                }

                var colOrder = [];
                for (var col = 0; col < tcm.getOverallColumnCount(); col++) {
                    var c = settings.columns[col];
                    tcm.setColumnVisible(col, c.visible);
                    tcm.setColumnWidth(col, c.width);

                    colOrder.push(c.columnAt);
                }
                tcm.setColumnsOrder(colOrder);

                if (settings.sortColumnIndex >= 0 && settings.sortColumnIndex < tcm.getOverallColumnCount()) {
                    tm.sortByColumn(settings.sortColumnIndex, settings.sortAscending);
                }

            },
            saveTableSettings: function(tableName) {
                var tcm = this.getTableColumnModel();
                var tm = this.getTableModel();

                var settings = {
                    sortColumnIndex: tm.getSortColumnIndex(),
                    sortAscending: tm.isSortAscending(),
                    columns: []
                };
                for (var col = 0; col < tcm.getOverallColumnCount(); col++) {

                    var c = {
                        visible: tcm.isColumnVisible(col),
                        width: tcm.getColumnWidth(col),
                        columnAt: tcm.getOverallColumnAtX(col)
                    };
                    settings.columns.push(c);
                }

                bos.Storage.getInstance().setTableSettings(settings, tableName);

            },
            createCsvString: function() {
                var tableModel = this.getTableModel();
                var sb = new qx.util.StringBuilder(2048);
                var sep = "\t";
                for (var col = 0; col < tableModel.getColumnCount(); col++) {
                    if (col > 0) {
                        sb.add(sep);
                    }
                    sb.add(tableModel.getColumnName(col));
                }
                sb.add("\n");

                var labels = new qx.data.Array(["position", "targetPosition", "attackerPosition"]);

                for (var row = 0; row < tableModel.getRowCount(); row++) {
                    var rowData = tableModel.getRowData(row);
                    for (var col = 0; col < tableModel.getColumnCount(); col++) {
                        if (col > 0) {
                            sb.add(sep);
                        }
                        var s = bos.Utils.extractCoordsFromClickableLook(rowData[col]);
                        if (labels.indexOf(tableModel.getColumnId(col)) >= 0) {
                            s = "'" + s;
                        }
                        sb.add('"', s, '"');
                    }
                    sb.add("\n");
                }
                return sb.get();
            },
            exportToCsv: function() {
                var csv = this.createCsvString();
                bos.Utils.displayLongText(csv);
            }
        }
    });
});