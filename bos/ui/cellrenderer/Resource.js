/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:31
 */
(function (window, undefined) {
    qx.Class.define("bos.ui.table.cellrenderer.Resource", {
        extend : qx.ui.table.cellrenderer.Default,

        construct: function(align, color, style, weight, maxColumn, freeColumn, warningLevel, errorLevel){
            this.base(arguments);
            this.__defaultTextAlign = align || "";
            this.__defaultColor = color || bos.Const.RESOURCE_GREEN;
            this.__defaultFontStyle = style || "";
            this.__defaultFontWeight = weight || "";
            this._maxColumn = maxColumn;
            this._freeColumn = freeColumn;
            this._warningLevel = warningLevel;
            this._errorLevel = errorLevel;
        },
        members: {
            __defaultTextAlign : null,
            __defaultColor : null,
            __defaultFontStyle : null,
            __defaultFontWeight : null,
            _maxColumn: null,
            _freeColumn: null,
            _warningLevel: null,
            _errorLevel: null,

            _getCellStyle : function(cellInfo) {
                var tableModel = cellInfo.table.getTableModel();

                var style = {
                    "text-align": this.__defaultTextAlign,
                    "color": this.__defaultColor,
                    "font-style": this.__defaultFontStyle,
                    "font-weight": this.__defaultFontWeight,
                    "border-top": bos.Const.TABLE_BORDER
                };

                var maxValue = tableModel.getValueById(this._maxColumn, cellInfo.row);
                var freeValue = tableModel.getValueById(this._freeColumn, cellInfo.row);

                if (freeValue != null && maxValue != null && maxValue > 0) {
                    if (freeValue <= 0) {
                        style["color"] = bos.Const.RESOURCE_RED;
                    } else {
                        var mod = freeValue / maxValue;
                        if (mod < 0.2) {
                            style["color"] = bos.Const.RESOURCE_YELLOW;
                        }
                    }
                }

                var id = tableModel.getValueById("id", cellInfo.row);
                if (id == "Total") {
                    style["border-top"] = bos.Const.TABLE_SUMMARY_ROW_BORDER;
                }

                var styleString = [];
                for(var key in style) {
                    if (style[key]) {
                        styleString.push(key, ":", style[key], ";");
                    }
                }
                return styleString.join("");
            }
        }
    });
})(window);