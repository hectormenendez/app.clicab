var View = {};

// Modules
var Core = require('sys/core');
var UI   = require('sys/ui');
var Geo  = require('lib/geo');

View.hasLayout  = false;
View.hasAddress = false;
View.textNoHide = false;

View.construct = function(){
	View = this; // update instance.

	View.$window = UI.window({ title:'CliCab'});
	// iOS need to be inside a scroll so the textfields move up.
	View.$window.add((Core.Device.isApple? 'scrollview' : 'view') + '#container');
	// this view will be the one telling us its measurements.
	View.$window.$container.add('view');
	// no need of being so verbose.
	View.$view = View.$window.$container.$view;
	View.$view.addEvent('postlayout', View.onLayout);
}


View.onLayout = function(e){
	// This should only trigger once.
	View.$view.delEvent('postlayout', View.onLayout);
	// Populate dimentions
	View.screen = { width  : null, height : null, x : null, y : null };
	for (var i in View.screen)
		View.screen[i] = Core.Device.px2dp(View.$view.raw.rect[i]);
	// A line measurements, as in "<p>"
	View.screen.line = {};
	View.screen.line.height    = Math.ceil(View.screen.height * 0.1);     // 10%
	View.screen.line.padding   = Math.floor(View.screen.line.height * 0.1); // 1%
	View.screen.line.inner     = Math.abs(View.screen.line.height - (View.screen.line.padding * 2));
	View.screen.line.p75       = {};
	View.screen.line.p75.width = Math.ceil(View.screen.width * 0.75);
	View.screen.line.p75.inner = View.screen.line.p75.width - (View.screen.line.padding * 2);
	View.screen.line.p25       = {};
	View.screen.line.p25.width = Math.ceil(View.screen.width * 0.25);
	View.screen.line.p25.inner = View.screen.line.p25.width - (View.screen.line.padding * 2);
	// Map measurements
	View.screen.map = {};
	View.screen.map.width  = View.screen.width;
	View.screen.map.height = View.screen.height - View.screen.line.height;
	// font calculation
	View.screen.font = {
		fontSize   : Math.ceil(View.screen.line.inner/2) - (View.screen.padding*2) + 'dp',
		fontWeight :'bold'
	}
	// start declaring elements.
	View.layout();
}


View.layout = function(){

	// Disables user input when no internet is detected.
	View.$window.add('view.dimmer#dimmer').add('label.dimmer#label');

	// create Map, and center it on Mexico City.
	View.$view.add('map', {
        height    : this.screen.map.height + 'dp',
        region    : Geo.region({
            zoom      : 10,
            latitude  : 19.41419130854365,
            longitude : -99.13094738056566,
            width     : this.screen.width,
            height    : this.screen.height
        })
	});

	View.$view.add('view#titlebar', {
		top    : 0,
		zIndex : 0,
		height : Math.ceil(View.screen.line.height/2) + (View.screen.line.padding*2) + 'dp',
		backgroundColor : 'rgba(255,255,255,' + (Core.Device.isAndroid? '204' : '0.8') + ')'
	})

		View.$view.$titlebar.add('view#location',{
			'class'   : 'button',
			left    : View.screen.line.padding + 'dp',
			width   : Math.ceil(View.screen.line.height/2) + 'dp',
			height  : Math.ceil(View.screen.line.height/2) + 'dp',
			padding : View.screen.line.padding + 'dp',
			backgroundColor: 'blue'
		})

		View.$view.$titlebar.add('view#cancel', {
			'class'   : 'button',
			left    : (View.screen.line.padding*2) + Math.ceil(View.screen.line.height/2) + 'dp',
			height  : Math.ceil(View.screen.line.height/2) + 'dp',
			width   : Core.Device.px2dp(60) + 'dp',
			padding : View.screen.line.padding + 'dp',
			backgroundColor : 'red',
			visible : false,
		})
			.add('label', {
				text  : ' Cancelar ',
				color : '#FFF'
			});

		View.$view.$titlebar.add('label#titleOrigin',{
			right : View.screen.line.padding,
			text  : 'Selecciona tu origen',
			color : '#333',
			font  : View.screen.font
		});

		View.$view.$titlebar.add('label#titleDestiny',{
			right : View.screen.line.padding,
			text  : 'Selecciona tu destino',
			color : '#333',
			visible : false,
			font  : View.screen.font
		});


	// Location pointer
	View.$view.add('image#pointer',{
		zIndex  : 1,
        width   : Core.Device.px2dp(30) + 'dp',
        height  : Core.Device.px2dp(34) + 'dp',
        top     : Math.ceil(View.screen.map.height / 2) - 38  + 'dp',
        left    : Math.ceil(View.screen.map.width  / 2) - 15  + 'dp',
        image   : '/media/images/point.png',
        hires   : Ti.Platform.displayCaps.density == 'high'? true : undefined,
        visible : false
	});

	//////////////////////////////////////////////////////////////////// Toolbar

	View.$view.add('view#selector',{
		zIndex  : 9999,
		visible : false
	}).add('view', {
		width           : '80%',
		height          : '33%',
		top             : '25%',
		borderRadius    : View.screen.line.padding + 'dp',
		backgroundColor : 'red'
	});

	View.$view.add('view#toolbar',{
		'class'  : 'toolbar',
		height : View.screen.line.height + 'dp',
		top    : (View.screen.height - View.screen.line.height) + 'dp'
	});

		View.$view.$toolbar.add('view#taxi',{
			'class'  : 'button',
			width  : '90dp',
			top    : View.screen.line.padding + 'dp',
			height : View.screen.line.inner   + 'dp'
		})
			.add('label', {
				'class' : 'button',
				font  : View.screen.font,
				text  : ' ¡ Taxi ! '
			});

		View.$view.$toolbar.add('view#settings',{
			'class'  : 'button',
			left   : View.screen.line.padding + 'dp',
			top    : View.screen.line.padding + 'dp',
			width  : View.screen.line.inner   + 'dp',
			height : View.screen.line.inner   + 'dp'
		})
			.add('label',{
				'class' :'button',
				font  : View.screen.font,
				text  : 'S'
			});

		View.$view.$toolbar.add('view#address',{
			'class'  : 'button',
			right  : View.screen.line.padding + 'dp',
			top    : View.screen.line.padding + 'dp',
			width  : View.screen.line.inner   + 'dp',
			height : View.screen.line.inner   + 'dp'
		})
			.add('label',{
				'class' :'button',
				font  : View.screen.font,
				text  : 'A'
			});

	//////////////////////////////////////////////////////////////////// Address

	View.$view.add('view#addressUpdate',{
		'class'   : 'button',
		top     : View.screen.height + 'dp',
		right   : View.screen.line.padding + 'dp',
		width   : Math.ceil(View.screen.line.height / 2) + 'dp',
		height  : Math.ceil(View.screen.line.height / 2) + 'dp',
		visible : false,
		backgroundColor: 'green'
	});

	View.$view.add('view#address',{
		'class'           : 'address',
		top             : View.screen.map.height + 'dp',
		backgroundColor : 'rgba(0,0,0,' + (Core.Device.isAndroid? '204' : '0.8') + ')'
	});

		View.$view.$address.add('view#line1',{
			top    : View.screen.line.padding,
			'class'  : 'addressLine',
			height : View.screen.line.height + 'dp'
		});

			View.$view.$address.$line1.add('view#street', {
				left  : 0,
				width : View.screen.line.p75.width + 'dp'
			})
				.add('textfield', {
					'class'    : 'addressField',
					hintText : 'Calle',
					font     : View.screen.font,
					padding  : View.screen.line.padding   + 'dp',
					height   : View.screen.line.inner     + 'dp',
					width    : View.screen.line.p75.inner + 'dp'
				});

			View.$view.$address.$line1.add('view#number', {
				right : 0,
				width : View.screen.line.p25.width + 'dp'
			})
				.add('textfield', {
					'class'    : 'addressField',
					hintText : 'Número',
					font     : View.screen.font,
					padding  : View.screen.line.padding   + 'dp',
					height   : View.screen.line.inner     + 'dp',
					width    : View.screen.line.p25.inner + 'dp'
				});

		View.$view.$address.add('view#line2', {
			'class'  : 'addressLine',
			height : View.screen.line.height + 'dp'
		});

			View.$view.$address.$line2.add('view#indoor',{
				left  : 0,
				width : View.screen.line.p25.width + 'dp'
			})
				.add('textfield', {
					'class'    : 'addressField',
					hintText : 'Interior',
					font     : View.screen.font,
					padding  : View.screen.line.padding   + 'dp',
					height   : View.screen.line.inner     + 'dp',
					width    : View.screen.line.p25.inner + 'dp'
				});

			View.$view.$address.$line2.add('view#nbhood',{
				right : 0,
				width : View.screen.line.p75.width + 'dp'
			})
				.add('textfield', {
					'class'    : 'addressField',
					hintText : 'Colonia',
					font     : View.screen.font,
					padding  : View.screen.line.padding   + 'dp',
					height   : View.screen.line.inner     + 'dp',
					width    : View.screen.line.p75.inner + 'dp'
				});

	View.hasLayout = true;
}


View.dimmerNetwork = function(state){
	View.$window.$dimmer.$label.raw.text = "Internet no disponible";
	View.$window.$dimmer.raw.visible = state? false : true;
}

// TODO Android is not changing the visible property for dimmer more than once.
View.dimmerGeo = function(state){
	// QUICKFIX
	if (Core.Device.isAndroid && !state) return alert('Localización no disponible');
	else if (Core.Device.isAndroid) return;
	View.$window.$dimmer.$label.raw.text = "Localización no disponible";
	View.$window.$dimmer.raw.visible = state? false : true;
}

View.pointer = function(state){
	View.$view.$pointer.raw.visible = state? true : false;
}


View.setRegion = function(latitude, longitude){
	View.$view.$map.raw.setLocation(Geo.region({
		zoom     : 16,
		latitude : latitude,
		longitude: longitude,
		width    : View.screen.width,
		height   : View.screen.height
	}));
}

View.addressUpdate = function(address){
	View.$view.$address.$line1.$street.$textfield.raw.value = address.route;
	View.$view.$address.$line1.$number.$textfield.raw.value = address.street_number || '';
	View.$view.$address.$line2.$indoor.$textfield.raw.value = '';
	View.$view.$address.$line2.$nbhood.$textfield.raw.value = address.neighborhood;
	View.setRegion(address.latitude, address.longitude);
	View.addressShow();
}


View.addressShow = function(){
	if (View.hasAddress) return false;
	View.$view.$address.raw.animate({
		top : View.screen.map.height - (View.screen.line.height*2) - (View.screen.line.padding*2) + 'dp'
	}, function(){
		View.$view.$addressUpdate.raw.top = View.screen.map.height - (View.screen.line.height*2.5) - (View.screen.line.padding*3) + 'dp'
		View.$view.$addressUpdate.raw.visible = true;
	});
	View.hasAddress = true;
}

View.addressHide = function(){
	if (!View.hasAddress) return false;
	View.$view.$addressUpdate.raw.visible = false;
	View.$view.$addressUpdate.raw.top = View.screen.height+ 'dp';
	View.$view.$address.raw.animate({
		top : View.screen.map.height + 'dp'
	});
	View.hasAddress = false;
}

module.exports = View;
