var Core = require('sys/core');
var UI   = require('sys/ui');

exports.load = function(name){
	var self = this;
    var app  = Core.load.call(this, Core.args(arguments));
	// Create window and add it an expandable window.
	var $window = UI.window({ title:'CliCab' });
	$window.add('scrollview#scroll');
	$window.$scroll.add('view');
	// Wait until we have main view dimentions available.
	var onLayout = function(e){
		$window.$scroll.$view.delEvent('postlayout', onLayout); // event triggers only once.
		// make dimentions easily available
		var p = ['width','height','x','y'];
		$window.$scroll.$view.screen = {};
		for (var i in p)
			$window.$scroll.$view.screen[p[i]] = $window.$scroll.$view.raw.rect[p[i]];
		// Populate Application prototype
		app.prototype.App     = self;
		app.prototype.$window = $window;
		new app();
		Core.log(name, 'lib:app:load');
	};
	$window.$scroll.$view.addEvent('postlayout', onLayout);
	$window.open();
};