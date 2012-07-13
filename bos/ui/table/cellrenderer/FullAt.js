/**
 * Created with JetBrains WebStorm.
 * User: BJOLLING
 * Date: 13/07/12
 * Time: 14:35
 * To change this template use File | Settings | File Templates.
 */

loader.addFinishHandler(function () {

    GM_log(" - define bos.ui.table.cellrenderer.FullAt");

    qx.Class.define("bos.ui.table.cellrenderer.FullAt", {
        extend:bos.ui.table.cellrenderer.Default,
        construct:function (mode) {
            this.base(arguments);
        },
        members:{
            _mode:0,
            _getContentHtml:function (cellInfo) {
                var value = cellInfo.value;
                if (value === null) {
                    cellInfo.value = "";
                } else if (value instanceof Date) {
                    if (value.getTime() != 0) {
                        cellInfo.value = webfrontend.Util.getDateTimeString(value);
                    } else {
                        cellInfo.value = "now";
                    }
                }
                return qx.bom.String.escape(this._formatValue(cellInfo));
            },
            _getCellStyle:function (cellInfo) {
                var tableModel = cellInfo.table.getTableModel();
                var value = cellInfo.value;
                var color = bos.Const.TABLE_DEFAULT_COLOR;

                var seconds = -1;
                if (value instanceof Date) {
                    if (value.getTime() == 0) {
                        color = bos.Const.RESOURCE_RED;
                    } else {
                        var diff = value - new Date();
                        seconds = Math.floor(diff / 1000);
                        if (seconds >= 3600 * 24) {
                            color = bos.Const.RESOURCE_GREEN;
                        } else if (seconds >= 3600 * 8) {
                            color = bos.Const.TABLE_DEFAULT_COLOR;
                        } else if (seconds > 0) {
                            color = bos.Const.RESOURCE_YELLOW;
                        }
                    }
                } else if (qx.lang.Type.isString(value)) {
                    color = bos.Const.RESOURCE_GREEN;
                }

                var border = bos.Const.TABLE_BORDER;
                var id = tableModel.getValueById("id", cellInfo.row);
                if (id == "Total") {
                    border = bos.Const.TABLE_SUMMARY_ROW_BORDER;
                }

                return "color: " + color + ";" + "border-top:" + border;
            }
        }
    });
});