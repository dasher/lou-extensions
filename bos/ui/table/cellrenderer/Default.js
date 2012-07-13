/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:26
 */
loader.addFinishHandler(function() {

    GM_log(" - define bos.ui.table.cellrenderer.Default");

    qx.Class.define("bos.ui.table.cellrenderer.Default", {
        extend : qx.ui.table.cellrenderer.Default,

        construct: function(align, color, style, weight){
            this.base(arguments);
            this.__defaultTextAlign = align || "";
            this.__defaultColor = color || bos.Const.TABLE_DEFAULT_COLOR;
            this.__defaultFontStyle = style || "";
            this.__defaultFontWeight = weight || "";

        },
        members: {
            __defaultTextAlign : null,
            __defaultColor : null,
            __defaultFontStyle : null,
            __defaultFontWeight : null,

            _getCellStyle : function(cellInfo) {
                var tableModel = cellInfo.table.getTableModel();

                var style = {
                    "text-align": this.__defaultTextAlign,
                    "color": this.__defaultColor,
                    "font-style": this.__defaultFontStyle,
                    "font-weight": this.__defaultFontWeight,
                    "border-top": bos.Const.TABLE_BORDER
                };

                var id = tableModel.getValueById("id", cellInfo.row);
                if (id == "Total") {
                    style["border-top"] = bos.Const.TABLE_SUMMARY_ROW_BORDER;
                } else if (qx.lang.Type.isNumber(id) && id < 0) {
                    style["border-bottom"] = bos.Const.TABLE_SUMMARY_ROW_BORDER;
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
});