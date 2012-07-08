loader.addFinishHandler(function () {
    try {
        console.log('Start testje');

        qx.Class.define("twitter.TestWdw",
            {
                extend:qx.ui.window.Window,
                construct:function () {
                    this.base(arguments, "testje");
                }
            });

        var tw = new twitter.TestWdw();
        tw.show();
    } catch (e) {
        console.log(e);
    }
});