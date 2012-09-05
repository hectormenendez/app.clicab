var Core   = require('sys/core');
var UI     = require('sys/ui');
var Geo    = require('lib/geo');
var Net    = require('sys/net');

exports.construct = function(){

	var Main = this;

	/**
	 * TODO: Enable multiple element adding.
	 */

	var version = parseFloat(Core.Device.version);

	// Disables user input when no internet is detected.
	this.$window.add('view.dimmer#dimmer', {
	}).add('label.dimmer', { text: 'Internet no disponible.' });

	var $view = this.$window.$scroll.$view;

	this.screen          = $view.screen;
	this.screen.dpHeight = Core.Device.px2dp(this.screen.height);
	this.screen.dpWidth  = Core.Device.px2dp(this.screen.width);

	var lineHeight = Core.Device.px2dp(40);
	var linePad    = Core.Device.px2dp(4);
	var padHeight  = Math.abs(lineHeight - (linePad * 2));

	var mapHeight = Core.Device.isAndroid && version <3 ?
			this.screen.dpHeight + lineHeight
		:
			this.screen.dpHeight - (lineHeight * 2);

	// create Map, and center it on Mexico City.
	$view.add('map', {
        height    : this.screen.dpHeight + 'dp',
        region    : Geo.region({
            zoom      : 10,
            latitude  : 19.41419130854365,
            longitude : -99.13094738056566,
            width     : this.screen.dpWidth,
            height    : this.screen.dpHeight
        })
	});

	// Location getter button.
	$view.add('view#location', {
		class  : 'button',
		zIndex : 0,
		width  : Math.ceil(lineHeight/2) + 'dp',
		height : Math.ceil(lineHeight/2) + 'dp',
		top    : linePad + 'dp',
		left   : linePad + 'dp'
	})

	// Location pointer
	$view.add('image#pointer',{
		zIndex : 1,
        width   : 30,
        height  : 34,
        top     : Core.Device.px2dp((this.screen.height / 2) - 38),
        left    : Core.Device.px2dp((this.screen.width / 2) - 15),
        image   : '/media/images/point.png',
        hires   : Ti.Platform.displayCaps.density == 'high'? true : undefined,
        visible : false
	});

	//////////////////////////////////////////////////////////////////// Toolbar

	$view.add('view#selector',{
		zIndex:9999,
		visible : false
	}).add('view', {
		backgroundColor:'red',
		width: '80%',
		height: '33%',
		top   :'25%',
		borderRadius: '5dp',
	});

	$view.add('view#toolbar',{
		class  : 'toolbar',
		height : lineHeight + 'dp',
		top    : (this.screen.dpHeight - lineHeight) + 'dp'
	});

		$view.$toolbar.add('view#taxi',{
			class  : 'button',
			width  : '90 dp',
			top    : linePad   + 'dp',
			height : padHeight + 'dp',
		})
			.add('label', {
				class : 'button',
				text  : ' ¡ Taxi ! ',
			});

		$view.$toolbar.add('view#settings',{
			class  : 'button',
			left   : linePad   + 'dp',
			top    : linePad   + 'dp',
			width  : padHeight + 'dp',
			height : padHeight + 'dp'
		})
			.add('label',{
				class :'button',
				text  : 'S'
			});

		$view.$toolbar.add('view#address',{
			class  : 'button',
			right  : linePad   + 'dp',
			top    : linePad   + 'dp',
			width  : padHeight + 'dp',
			height : padHeight + 'dp'
		})
			.add('label',{
				class :'button',
				text  : 'A'
			});

	//////////////////////////////////////////////////////////////////// Address

	$view.add('view#address',{
		class : 'address',
		top   : mapHeight + lineHeight + 'dp'
	});

		$view.$address.add('view#line1',{
			class  : 'addressLine',
			height : lineHeight + 'dp'
		});

			$view.$address.$line1.add('view#street', {
				left : 0,
				backgroundColor:'red',
				height : lineHeight + 'dp',
				width : '75%'
			})
				.add('textfield', {
					class     : 'addressField',
					hintText  : 'Calle',
					top       : linePad + 'dp',
					height    : Core.Device.isApple ?  padHeight + 'dp' : undefined
				});

			$view.$address.$line1.add('view#number', {
				right : 0,
				backgroundColor : 'magenta',
				height : lineHeight + 'dp',
				width : '25%'
			})
				.add('textfield', {
					class    : 'addressField',
					hintText : 'Número',
					top      : linePad + 'dp',
					height   : Core.Device.isApple ?  padHeight + 'dp' : undefined
				});

		$view.$address.add('view#line2', {
			class  : 'addressLine',
			height : lineHeight + 'dp'
		});

			$view.$address.$line2.add('view#indoor',{
				left : 0,
				backgroundColor:'brown',
				height : lineHeight + 'dp',
				width : '25%'
			})
				.add('textfield', {
					class    : 'addressField',
					hintText : 'Interior',
					top      : linePad + 'dp',
					height   : Core.Device.isApple ?  padHeight + 'dp' : undefined
				});

			$view.$address.$line2.add('view#hood',{
				right : 0,
				backgroundColor: 'cyan',
				height : lineHeight + 'dp',
				width : '75%'
			})
				.add('textfield', {
					class    : 'addressField',
					hintText : 'Colonia',
					top      : linePad + 'dp',
					height   : Core.Device.isApple ?  padHeight + 'dp' : undefined
				});


	//////////////////////////////////////////////////////////////////// Network

    Ti.Network.addEventListener('change', function(e){
 		Core.log(e, 'Network:Change');
		Main.$window.$dimmer.raw.visible = e.online? false : true;
    });
 	if (!Ti.Network.online) Main.$window.$dimmer.raw.visible = true;

	////////////////////////////////////////////////////////////////// Geolocate

	Main.regionLast  = null;
    Main.regionCurr  = null;
    Main.regionTimer = null;
    Main.regionEvent = null;


	var onAddressShow = function(eShow){
		if ($view.$address.UP) return false;
		$view.$address.raw.animate({ top: (mapHeight - lineHeight) +  'dp' });
		$view.$address.UP = true;
	};

	var onAddressHide = function(eHide){
		if (!$view.$address.UP) return false;
		$view.$address.raw.animate({ top: mapHeight + lineHeight + 'dp' });
		$view.$address.UP = false;
	};

	var onAddressUpdate = function(){
		// Get all values from textfields and obtain an address.
		var urlBase   = 'http://maps.google.com/maps/api/geocode/json?sensor=false&region=mx&language=es&components=locality:Ciudad de Mexico|';
		var component = '';

		if ($view.$address.$line1.$street.$textfield.raw.value)
			component += 'route:' + $view.$address.$line1.$street.$textfield.raw.value  + '|';
		if ($view.$address.$line1.$number.$textfield.raw.value )
			component += 'street_number:' + $view.$address.$line1.$street.$textfield.raw.value + '|';
		if ($view.$address.$line2.$hood.$textfield.raw.value)
			component += 'neighborhood:' + $view.$address.$line2.$hood.$textfield.raw.value;
		Net.xhr({
            type : 'GET',
            url  :  urlBase + component,
            success : function(response){
            	response = JSON.parse(response);
            	if (response.status != 'OK' || !response.results) return alert('ERROR');
            	response = response.results;
            	var result = [];
            	for (var i in response)
            		result.push({
            			title    : response[i].formatted_address,
            			location : response[i].geometry.location,
            			font:{ fontSize:14 }
            		});
				onMultipleAddresses(result);
            },
            error : function(response){
            	alert(response);
            }
        });

	};

	var onSelectorClick = function(eSel){
		if ($view.$selector.$view.$table)
			$view.$selector.$view.raw.remove($view.$selector.$view.$table);
		$view.$selector.$view.$table = undefined;
		$view.$selector.raw.visible = false;
		if (!eSel || !eSel.row) return;

		$view.$map.raw.setLocation(Geo.region({
			zoom     : 16,
			latitude : eSel.row.location.lat,
			longitude: eSel.row.location.lng,
			width    : Main.screen.width,
			height   : Main.screen.height
		}));
	}

	var onMultipleAddresses = function(addr){
		$view.$selector.raw.visible = true;
		$view.$selector.$view.$table = Titanium.UI.createTableView({
			width: '95%',
			height: '95%',
			data:addr,
		});
		$view.$selector.$view.add($view.$selector.$view.$table);
	}

    var onAfterRegionChanged = function(e){
        var urlBase = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=true&language=es&latlng=';
        Net.xhr({
            type : 'GET',
            url  :  urlBase + e.latitude + ',' + e.longitude,
            success:function(response){
                var address = {}
                JSON.parse(response).results[0].address_components.forEach(function(value, i){
                    var val = Core.isDefined(value.long_name)? value.long_name : value.short_name;
                    address[value.types[0]] = val;
                });
                //	alert(JSON.stringify(address));
                onAddressShow();
				$view.$address.$line1.$street.$textfield.raw.value = address.route;
				$view.$address.$line1.$number.$textfield.raw.value = address.street_number || '';
				$view.$address.$line2.$indoor.$textfield.raw.value = '';
				$view.$address.$line2.$hood.$textfield.raw.value   = address.neighborhood;
            },
            error:function(response){
                alert('Hubo un error obteniendo la ubicación, ¿intentar nuevamente?');
            }
        });
    }

    var onRegionChanged = function(e) {
        var rc = this;
        // Apple triggers event after panning finishes, so we call directly
        if (Core.Device.isApple) return onAfterRegionChanged.call(rc, e);
        // use an interval to detect when the user has stopped panning.
        if (!Main.regionTimer){
            Main.regionTimer = setInterval(function(){
                // If different, the map's moving, keep looping.
                if (Main.regionLast !== Main.regionCurr)
                    return (Main.regionLast = Main.regionCurr);
                // No movement detected, stop loop, callback time!
                clearInterval(Main.regionTimer);
                Main.regionTimer = null;
                onAfterRegionChanged.call(rc, e);
            }, 500);
        }
        Main.regionCurr = {
            latitude       : e.latitude,
            longitude      : e.longitude,
            latitudeDelta  : e.latitudeDelta,
            longitudeDelta : e.longitudeDelta
        }
    }

    if (!Ti.Geolocation.getLocationServicesEnabled()) return alert('GPS deshabilitado');
    var onLocation = function(){
		Ti.Geolocation.getCurrentPosition(function(eGeo){
			if (!eGeo.success) return alert('GPS deshabilitado');
			// This should only run once.
			if (!Core.isDefined(Main.hasGeo)){
				Main.hasGeo = true;
				$view.$pointer.raw.visible = true;
				// Enable listener for region changed.
				$view.$map.addEvent('regionChanged', onRegionChanged);
			}
			$view.$map.raw.setLocation(Geo.region({
				zoom     : 16,
				latitude : eGeo.coords.latitude,
				longitude: eGeo.coords.longitude,
				width    : Main.screen.width,
				height   : Main.screen.height
			}));
		});
    }


	$view.$location.addEvent('click', onLocation);

	var kbFocus, kbBlur, noHide;

	var onBlur = function(eBlur){
		Core.log(eBlur, 'onBlur');
		// scroll only when really hiding the keyboard.
		setTimeout(function(){
			if (noHide) return (noHide = false);
			Main.$window.$scroll.raw.scrollTo(0,0);
			Main.$window.$scroll.raw.scrollingEnabled = false;

			onAddressUpdate();
		}, 50);
		kbBlur = Ti.App.keyboardVisible;
	};

	var onFocus = function(eFocus){
		Core.log(eFocus, 'onFocus');
		noHide = kbFocus && kbBlur;
		Main.$window.$scroll.raw.scrollingEnabled = true;
		kbFocus = Ti.App.keyboardVisible;
	}

	$view.$selector.addEvent('click', onSelectorClick);

	$view.$toolbar.$address.addEvent('click', function(e){
		$view.$address.UP ? onAddressHide() : onAddressShow();
	});

	$view.$address.$line1.$street.$textfield.addEvent('focus', onFocus);
	$view.$address.$line1.$number.$textfield.addEvent('focus', onFocus);
	$view.$address.$line2.$indoor.$textfield.addEvent('focus', onFocus);
	$view.$address.$line2.$hood.$textfield.addEvent('focus'  , onFocus);

	$view.$address.$line1.$street.$textfield.addEvent('blur', onBlur);
	$view.$address.$line1.$number.$textfield.addEvent('blur', onBlur);
	$view.$address.$line2.$indoor.$textfield.addEvent('blur', onBlur);
	$view.$address.$line2.$hood.$textfield.addEvent('blur', onBlur);

	return onLocation();
}

