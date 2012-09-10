var Control = {};
var View    = {};
var Model   = {};

var Core = require('sys/core');

Control.origin         = true;
Control.hasLocation    = false;
Control.regionTimer    = null;
Control.regionLast     = null;
Control.regionCurr     = null;
Control.keyboardFocus  = null;
Control.keyboardBlur   = null;



Control.construct = function(){
	Control = this;
	View    = Control.View;
	Model   = Control.Model;
	// This will trigger the view to open.
	View.$window.open();
	// Wait until layout has been propagated.
	var interval = setInterval(function(){
		if (!View.hasLayout) return false;
		clearInterval(interval);
		Control.ready();
	},100);
}



Control.ready = function(){

	// Block application if no internet is available
	Ti.Network.addEventListener('change', function(e){
		Core.log(e, 'main:control:ready:network:Change');
		View.dimmerNetwork(e.online);
	});
	View.dimmerNetwork(Ti.Network.online);

	// Add events to buttons.
	View.$view.$titlebar.$location.addEvent('click', Control.onLocation);

	View.$view.$toolbar.$address.addEvent('click', function(){
		Core.log(!View.hasAddress, 'main:view:addressToggle');
		View.hasAddress? View.addressHide() : View.addressShow();
	});

	View.$view.$addressUpdate.addEvent('click', Control.onUpdate);

	View.$view.$address.$line1.$street.$textfield.addEvent('focus', Control.onFocus);
	View.$view.$address.$line1.$number.$textfield.addEvent('focus', Control.onFocus);
	View.$view.$address.$line2.$indoor.$textfield.addEvent('focus', Control.onFocus);
	View.$view.$address.$line2.$nbhood.$textfield.addEvent('focus', Control.onFocus);

	View.$view.$address.$line1.$street.$textfield.addEvent('blur', Control.onBlur);
	View.$view.$address.$line1.$number.$textfield.addEvent('blur', Control.onBlur);
	View.$view.$address.$line2.$indoor.$textfield.addEvent('blur', Control.onBlur);
	View.$view.$address.$line2.$nbhood.$textfield.addEvent('blur', Control.onBlur);

	View.$view.$toolbar.$taxi.addEvent('click', Control.onTaxi);
	View.$view.$titlebar.$cancel.addEvent('click', Control.onCancel);
	Control.onLocation();
}



Control.onLocation = function(e){
	// Block application if no Localization is available.
	View.dimmerGeo(Ti.Geolocation.locationServicesEnabled);
	if (Core.Device.isApple)
		View.dimmerGeo(Ti.Geolocation.locationServicesAuthorization === Ti.Geolocation.AUTHORIZATION_AUTHORIZED)
	Ti.Geolocation.getCurrentPosition(function(e){
		Core.log(e, 'main:control:getlocation:geolocation');
		if (!e.success) return View.dimmerGeo(false);
		View.dimmerGeo(true);
		// if this is the first time, set up region changed to handle location.
		if (!Control.hasLocation){
			Control.hasLocation = true;
			View.pointer(true);
			View.$view.$map.addEvent('regionChanged', Control.onRegionChanged);
		}
		View.setRegion(e.coords.latitude, e.coords.longitude);
	});
}



Control.onRegionChanged = function(e){
	var self = this;
	// iOS triggers event after panning finishes, so we call directly
	if (Core.Device.isApple)
		return Model.googleByCoords(e.latitude, e.longitude, View.addressUpdate);
	// use an interval to detect when the user has stopped panning.
	if (!Control.regionTimer){
		Control.regionTimer = setInterval(function(){
            // If different, the map's moving, keep looping.
            if (Control.regionLast !== Control.regionCurr)
                return (Control.regionLast = Control.regionCurr);
            // No movement detected, stop loop, callback time!
            clearInterval(Control.regionTimer);
            Control.regionTimer = null;
            Model.googleByCoords(e.latitude, e.longitude, View.addressUpdate);
        }, 500);
	}
	Control.regionCurr = {
        latitude       : e.latitude,
        longitude      : e.longitude,
        latitudeDelta  : e.latitudeDelta,
        longitudeDelta : e.longitudeDelta
    }
}



Control.onFocus = function(e){
	Core.log(e.source, 'main:view:textFocus');
	if (Core.Device.isAndroid) return false;
	View.$window.$container.raw.scrollingEnabled = true;
	Control.keyboardFocus = Ti.App.keyboardVisible;
}



Control.onBlur = function(e){
	Core.log(e.source, 'main:view:textBlur');
	// iOS needs this set as a timer because it needs to scroll the window back
	if (Core.Device.isAndroid) return;
	setTimeout(function(){
		if (Control.keyboardFocus && Control.keyboardBlur) return;
		View.$window.$container.raw.scrollTo(0,0);
		View.$window.$container.raw.scrollingEnabled = false;
	}, 50);
	Control.keyboardBlur = Ti.App.keyboardVisible;
}



Control.onUpdate = function(e){
	// Fetch results from google.
	Model.googleByAddress({
		route         : View.$view.$address.$line1.$street.$textfield.raw.value,
		street_number : View.$view.$address.$line1.$number.$textfield.raw.value,
		neighborhood  : View.$view.$address.$line2.$nbhood.$textfield.raw.value
	}, function(results){
		if (results.length == 1) return Model.googleByCoords(
			results[0].location.lat,
			results[0].location.lng,
			View.addressUpdate
		);
		for (var i in results) results[i].font = { fontSize:13 }
		// Multiple results (The Hacky way)
		View.addressHide();
		View.$view.$selector.raw.visible = true;
		View.$view.$selector.$view.rawTable = Ti.UI.createTableView({
			width  : '95%',
			height : '92.5%',
			data   : results
		});
		View.$view.$selector.$view.add(View.$view.$selector.$view.rawTable);
		View.$view.$selector.$view.rawTable.addEventListener('click', function(e){
			View.$view.$selector.$view.raw.remove(View.$view.$selector.$view.rawTable);
			View.$view.$selector.$view.rawTable = undefined;
			View.$view.$selector.raw.visible = false;
			if (!e || !e.row) return;
			Model.googleByCoords(
				e.row.location.lat,
				e.row.location.lng,
				View.addressUpdate
			);
		});
	});
}




Control.onTaxi = function(e){
	// Verify all required fields are present
	var req = [
		View.$view.$address.$line1.$street.$textfield.raw,
		View.$view.$address.$line1.$number.$textfield.raw,
		View.$view.$address.$line2.$nbhood.$textfield.raw
	]
	var interior = View.$view.$address.$line2.$indoor.$textfield.raw;
	var i;
	for (i in req){
		if (!req[i].value) return Ti.UI.createAlertDialog({
			message : 'El campo "' + req[i].hintText + '" es requerido.',
			title   : 'Oops!',
			ok      : 'Okay'
		}).show();
	}

	var address = req[0].value + ' ' + req[1].value   +
		(interior.value? 'Int. ' + interior.value + ', ': ', ') +
		'Colonia ' + req[2].value;

	var dialog = Ti.UI.createAlertDialog({
		title       : 'Confirma tu ' + (Control.origin? 'origen' : 'destino') + '.',
		message     : address,
		cancel      : 1,
		buttonNames : ['Confirmar', 'Modificar']
	});

	dialog.addEventListener('click', function(e){
		if (e.index === e.source.cancel) return false;
		var map = View.$view.$map.raw.region;
		var cur = Control.origin? 'org' : 'dest';
		Model.Data['address_' + cur] = address;
		Model.Data['lat_'     + cur] = map.latitude;
		Model.Data['lon_'     + cur] = map.longitude;
		// Show new UI
		View.$view.$titlebar.$titleOrigin.raw.visible  = false;
		View.$view.$titlebar.$titleDestiny.raw.visible = true;
		View.$view.$titlebar.$cancel.raw.visible       = true;
		// Clean values
		for(i in req) req[i].value = '';
		interior.value = '';
		// Next step, please.
		if (Control.origin) return (Control.origin = false);
		var nombres = [
			{},
			{name:'Héctor', surname:'Menéndez'},
			{name:'Álvaro', surname:'Lizama'},
			{name:'José'  , surname:'Castro'},
			{name:'Andreu', surname:'Tobella'}
		];
		var user = nombres[Math.floor(Math.random() * nombres.length)+1];
		Model.Data.name    = user.name;
		Model.Data.surname = user.surname;
		alert('Asumiendo usuario :' + Core.stringify(user));
		Model.taxi(function(response){
			alert('¡Taxi Solicitado!');
			Core.log(response);
			Control.onCancel();
		});
	})

	dialog.show();
}

Control.onCancel = function(e){
	// Restore UI
	View.$view.$titlebar.$titleOrigin.raw.visible  = true;
	View.$view.$titlebar.$titleDestiny.raw.visible = false;
	View.$view.$titlebar.$cancel.raw.visible       = false;
	Model.Data.name         = null;
	Model.Data.surname      = null;
	Model.Data.address_org  = null;
	Model.Data.lat_org      = null;
	Model.Data.lon_org      = null;
	Model.Data.address_dest = null;
	Model.Data.lat_dest     = null;
	Model.Data.lon_dest     = null;
	Control.origin = true;
	var val = [
		View.$view.$address.$line1.$street.$textfield.raw,
		View.$view.$address.$line1.$number.$textfield.raw,
		View.$view.$address.$line2.$nbhood.$textfield.raw,
		View.$view.$address.$line2.$indoor.$textfield.raw
	]
	for(i in val) val[i].value = '';
	Core.log('onCancel');
}


module.exports = Control;