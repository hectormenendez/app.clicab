var Model = {};

var Core = require('sys/core');
var Net  = require('sys/net')

Model.construct = function(){}


Model.Data = {
	uid          : Ti.Platform.id,
	name         : null,
	surname      : null,
	address_org  : null,
	lat_org      : null,
	lon_org      : null,
	address_dest : null,
	lat_dest     : null,
	lon_dest     : null,
	device       : Core.Device.isApple? 3 : 2
};

Model.googleByCoords = function(latitude, longitude, callback){
    var urlBase = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=true&language=es&latlng=';
    Net.xhr({
        type    : 'GET',
        url     :  urlBase + latitude + ',' + longitude,
        success : function(response){
	        var address = {}
	        JSON.parse(response).results[0].address_components.forEach(function(value, i){
	            var val = Core.isDefined(value.long_name)? value.long_name : value.short_name;
	            address[value.types[0]] = val;
	        });
	        address.longitude = longitude;
	        address.latitude  = latitude;
	        callback(address);
        },
        error   : function(response){
            alert('Hubo un error obteniendo la ubicación, ¿intentar nuevamente?');
        }
    });
}

Model.googleByAddress = function(address, callback){
	// Get all values from textfields and obtain an address.
	var urlBase   = 'http://maps.google.com/maps/api/geocode/json?sensor=false&region=mx&language=es&components=locality:Ciudad de Mexico|';
	var component = '';
	if (address.route)         component += 'route:'         + address.route         + '|';
	if (address.street_number) component += 'street_number:' + address.street_number + '|';
	if (address.neighborhood)  component += 'neighborhood:'  + address.neighborhood;
	Net.xhr({
        type : 'GET',
        url  :  urlBase + component,
        success : function(response){
        	response = JSON.parse(response);
        	if (response.status != 'OK' || !response.results) return alert('ERROR');
        	response = response.results;
        	var result = [];
        	for (var i in response) result.push({
    			title    : response[i].formatted_address,
    			location : response[i].geometry.location,
    		});
			callback(result);
        },
        error : function(response){
        	alert(response);
        }
    });
}


Model.taxi = function(callback){
	var data = '';
	for (var i in Model.Data) data += i + '=' + Model.Data[i] + '&';
	data = data.slice(0,-1);
	Net.xhr({
		type    : 'POST',
		data    : data,
		url     : 'http://clicab.com/api/user/request/service/',
		success : function(response){
			callback(response);
		},
		error: function(response){
			error(response);
		}
	})

}


module.exports = Model;
