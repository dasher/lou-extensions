/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 0:20
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.gui.SummaryPage");

    qx.Class.define("bos.gui.SummaryPage", {
        extend: qx.ui.tabview.Page,
        construct: function() {
            qx.ui.tabview.Page.call(this);
        },
        members: {
            _table: null,
            _tableModel: null,
            _addBlankValuesToRow: function(row, tableModel) {
                //it seems that case insensitive doesnt handle well null values so it's safer to populate row with empty values
                for (var col = 0; col < tableModel.getColumnCount(); col++) {
                    row[tableModel.getColumnId(col)] = "";
                }
            },
            updateView: function() {
                if (!this.isSeeable()) {
                    //console.log("Some view is hidden, nothing to update");
                    return;
                }

                if (this._tableModel == null) {
                    return;
                }
                var prevSortColumnIndex = this._tableModel.getSortColumnIndex();
                var isSortAscending = this._tableModel.isSortAscending();
                this._tableModel.setDataAsMapArray(this.createRowData(), false);
                if (prevSortColumnIndex >= 0) {
                    this._tableModel.sortByColumn(prevSortColumnIndex, isSortAscending);
                }
            },
            _setupSorting: function(tableModel) {
                tableModel.setCaseSensitiveSorting(false);

                var compare = {
                    ascending  : bos.gui.SummaryWidget._defaultSortComparatorInsensitiveAscending,
                    descending : bos.gui.SummaryWidget._defaultSortComparatorInsensitiveDescending
                };

                for (var col = 0; col < tableModel.getColumnCount(); col++) {
                    tableModel.setSortMethods(col, compare);
                }
            }
        }
    });
});