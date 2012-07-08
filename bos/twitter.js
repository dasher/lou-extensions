loader.addFinishHandler(function () {

    try{

    GM_log('Start Twitter');

    qx.Class.define("twitter.MainWindow",
        {
            extend:qx.ui.window.Window,
            construct:function () {
                this.base(arguments, "twitter");
            }
        });

    var tw = new twitter.MainWindow();
    tw.show();
    } catch (e) {
        console.log(e);
    }
});

