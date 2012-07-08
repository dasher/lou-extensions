/**
 * @see            http://userscripts.org/topics/41177
 * @copyright      2009, 2010 James Campos
 * @license        cc-by-3.0; http://creativecommons.org/licenses/by/3.0/
 */

(function (window, undefined) {

    console.log(" - loading greasemonkey.light");

    if (typeof GM_deleteValue == 'undefined') {

        GM_addStyle = function (css) {
            var style = document.createElement('style');
            style.textContent = css;
            document.getElementsByTagName('head')[0].appendChild(style);
        };

        GM_deleteValue = function (name) {
            localStorage.removeItem(name);
        };

        GM_getValue = function (name, defaultValue) {
            var value = localStorage.getItem(name);
            if (!value)
                return defaultValue;
            var type = value[0];
            value = value.substring(1);
            switch (type) {
                case 'b':
                    return value == 'true';
                case 'n':
                    return Number(value);
                default:
                    return value;
            }
        };

        GM_log = function (message) {
            console.log(message);
        };

        GM_setValue = function (name, value) {
            value = (typeof value)[0] + value;
            localStorage.setItem(name, value);
        };
    }
})(window);