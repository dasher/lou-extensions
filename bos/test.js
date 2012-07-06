function tryStartTest() {
	console.log('Try test');
	if (qx != undefined) {
        startTest();
	} else {
        window.setTimeout(tryStartTest, 100);
	}
}

window.setTimeout(tryStartTest, 5000);

var startTest = function() {

	console.log('Start test');
	
	qx.Class.define("twitter.TestWdw",
	{
		extend: qx.ui.window.Window,
		construct: function () {
			this.base(arguments, "testje");
		}
	});

	var tw = new twitter.TestWdw();
	tw.show();
};