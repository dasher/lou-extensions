(function(window, undefined) {

    function tryStartTwitter() {
        GM_log('Try Twitter');
        if (typeof(qx)=="undefined") {
            window.setTimeout(tryStartTwitter, 500);
        } else {
            startTwitter();
        }
    }

    window.setTimeout(tryStartTwitter, 500);

    var startTwitter = function() {

        GM_log('Start Twitter');

        qx.Class.define("twitter.MainWindow",
            {
                extend: qx.ui.window.Window,
                construct: function () {
                    this.base(arguments, "twitter");
                }
            });

        var tw = new twitter.MainWindow();
        tw.show();
    };
})(window);

