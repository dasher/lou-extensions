/**
 * Created with JetBrains WebStorm.
 * User: BJOLLING
 * Date: 20/08/12
 * Time: 21:16
 * Released under the GNU General Public License version 3
 */

loader.addFinishHandler(function () {

    console.log(" - compat.qooxdoo.js");

    // ------------------------------------------------------------------------
    // lang
    // ------------------------------------------------------------------------
    if (typeof qx.util.Json == "undefined")
        qx.util.Json = qx.lang.Json;

});
