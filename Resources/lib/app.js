var Core = require('sys/core');

/**
 * Loads a file inside "app" folder, and instantates it.
 *
 * @author   Hector Menendez <etor.mx@gmail.com>
 * @created  2012/AGO/01 03:38
 * @updated  2012/SEP/07 08:15 MVC Capabilities Added.
 * @TODO Move instantiation to SYS.
 */
exports.load = function(){
	// Extract filename from arguments.
	var args = Core.args(arguments);
	if (args.length < 1 || !Core.isString(args[0]))
		return Core.error('lib:app:file');
	var name = args.shift();
	// Get the resources.
	var MVC = Core.load(name, args);
	// Nothing found?
	if (!MVC.file && !MVC.view && MVC.model && !MVC.control)
		return Core.error(name, 'lib:app:load:notfound');
	// a file was found, nothing special is done then.
	else if (MVC.file){
		Core.log(name, 'lib:app:load:file');
		return new MVC.file();
	}
	// so, we have MVC going on, a controller must exist then.
	if (!MVC.control) return Core.error(name, 'lib:app:load:notfound:control');
	// all set, load Model first, then View, then Control.
	var Model = false, View = false;
	if (MVC.model) {
		Core.log(name, 'lib:app:load:model');
		Model = new MVC.model();
	}
	if (MVC.view){
		Core.log(name, 'lib:app:load:view');
		MVC.view.prototype.Model = Model;
		View = new MVC.view();
	}
	Core.log(name, 'lib:app:load:control');
	MVC.control.prototype.Model = Model;
	MVC.control.prototype.View  = View;
	var Control = new MVC.control();
	Core.log(name, 'lib:app:load');
	return Control;
};



exports.__load = function(name){
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