/**
 * Created by JetBrains WebStorm.
 * User: BJOLLING
 * Date: 8/07/12
 * Time: 1:30
 */
loader.addFinishHandler(function() {

    GM_log(" - loading bos.ui.table.cellrenderer.ClickableLook");

    qx.Class.define("bos.ui.table.cellrenderer.ClickableLook", {
        extend: bos.ui.table.cellrenderer.Default,
        members: {
            _getContentHtml: function(cellInfo) {
                var value = cellInfo.value;
                if (value === null) {
                    cellInfo.value = "";
                } else {
                    cellInfo.value = this.clickableLook(cellInfo.value);
                }
                return this._formatValue(cellInfo);
            },
            clickableLook: function(s) {
                //return "<div style=\"cursor: pointer; color: rgb(45, 83, 149);\">" + s + "</div>";
                return bos.Utils.makeClickable(s, "#81adff");
            }/*, // overridden
             _getCellClass : function(cellInfo) {
             return "qooxdoo-table-cell";
             }*/
        }
    });
});