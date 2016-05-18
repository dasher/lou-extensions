/**
 * Created with JetBrains WebStorm.
 * User: BJOLLING
 * Date: 20/08/12
 * Time: 21:15
 * Released under the GNU General Public License version 3
 */

loader.addFinishHandler(function () {

    console.log(" - compat.lou.js");

    // ------------------------------------------------------------------------
    // Alliance
    // ------------------------------------------------------------------------
    if( typeof webfrontend.gui.AllianceInfoWindow == "undefined")
        webfrontend.gui.AllianceInfoWindow = webfrontend.gui.Alliance.Info.MainWindow;

    // ------------------------------------------------------------------------
    // ui
    // ------------------------------------------------------------------------
    if (typeof webfrontend.gui.CellRendererHtmlCustom == "undefined")
        webfrontend.gui.CellRendererHtmlCustom = webfrontend.ui.CellRendererHtmlCustom;
	
    if (typeof webfrontend.gui.CustomTable == "undefined")
        webfrontend.gui.CustomTable = webfrontend.ui.CustomTable;

    if (typeof webfrontend.gui.MessageBox == "undefined")
        webfrontend.gui.MessageBox = webfrontend.ui.MessageBox;

    if (typeof webfrontend.gui.RowRendererCustom == "undefined")
        webfrontend.gui.RowRendererCustom = webfrontend.ui.RowRendererCustom;

    if (typeof webfrontend.gui.SpinnerInt == "undefined")
        webfrontend.gui.SpinnerInt = webfrontend.ui.SpinnerInt;
});