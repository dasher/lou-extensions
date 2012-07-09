/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:27
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.ui.table.cellrenderer.HumanTime");

    qx.Class.define("bos.ui.table.cellrenderer.HumanTime", {
        extend: bos.ui.table.cellrenderer.Default,
        construct: function(mode){
            this.base(arguments);
            this._mode = mode || 0;
        }, members: {
            _mode: 0,
            _getContentHtml: function(cellInfo) {
                var value = cellInfo.value;
                if (value === null) {
                    cellInfo.value = "";
                } else if (value instanceof Date) {
                    var diff = new Date() - value;
                    cellInfo.value = human_time(Math.floor(diff / 1000));
                } else if (qx.lang.Type.isNumber(cellInfo.value)) {
                    cellInfo.value = human_time(cellInfo.value);
                }
                return qx.bom.String.escape(this._formatValue(cellInfo));
            },
            _getCellStyle : function(cellInfo) {
                var tableModel = cellInfo.table.getTableModel();
                var value = cellInfo.value;
                var color = bos.Const.TABLE_DEFAULT_COLOR;

                var seconds = -1;
                if (value instanceof Date) {
                    var diff = new Date() - value;
                    seconds = Math.floor(diff / 1000);
                } else if (qx.lang.Type.isNumber(value)) {
                    seconds = (value);
                } else if (qx.lang.Type.isString(value)) {
                    color = bos.Const.RESOURCE_GREEN;
                }

                if (seconds >= 0) {
                    if (this._mode == 1) {
                        //food
                        if (seconds >= 3600 * 24 * 2) {
                            color = bos.Const.RESOURCE_GREEN;
                        } else if (seconds >= 3600 * 24) {
                            color = bos.Const.TABLE_DEFAULT_COLOR;
                        } else if (seconds > 3600 * 12) {
                            color = bos.Const.RESOURCE_YELLOW;
                        } else {
                            color = bos.Const.RESOURCE_RED;
                        }
                    } else if (this._mode == 0) {
                        //build queue, unit queue
                        if (seconds >= 3600 * 24) {
                            color = bos.Const.RESOURCE_GREEN;
                        } else if (seconds >= 3600 * 8) {
                            color = bos.Const.TABLE_DEFAULT_COLOR;
                        } else if (seconds > 0) {
                            color = bos.Const.RESOURCE_YELLOW;
                        } else if (seconds <= 0) {
                            color = bos.Const.RESOURCE_RED;
                        }
                    } else if (this._mode == 2) {
                        //last visited
                        if (seconds >= 3600 * 24 * 3) {
                            color = bos.Const.RESOURCE_RED;
                        } else if (seconds >= 3600 * 24) {
                            color = bos.Const.RESOURCE_YELLOW;
                        } else if (seconds > 3600 * 8) {
                            color = bos.Const.TABLE_DEFAULT_COLOR;
                        } else {
                            color = bos.Const.RESOURCE_GREEN;
                        }
                    }
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