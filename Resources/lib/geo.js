var Core   = require('sys/core');
var Geo    = require('sys/geo');
var Device = require('sys/device');

exports.config = {
    enabled : Ti.Geolocation.locationServicesEnabled,
}

Ti.Geolocation.accuracy       = Titanium.Geolocation.ACCURACY_BEST;
Ti.Geolocation.distanceFilter = 200;

// Overwrite enabled if device is apple an was not authorized.
if (Device.isApple){
    Ti.Geolocation.purpose = "Enviar taxi a su ubicación.";
    if (Ti.Geolocation.locationServicesAuthorization == Ti.Geolocation.AUTHORIZATION_DENIED)
            exports.config.enabled = false;
}

// extend original system Geo
module.exports = Core.extend(Geo, exports);