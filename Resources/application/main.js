var Config = require('config');
var Device = require('sys/device');
var Geo    = require('lib/geo');
var Net    = require('sys/net');

exports.construct = function(){

    var self = this;

    self.$window = Ti.UI.createWindow({
        title           : 'CliCab',
        backgroundColor : '#FFCC00',
        // Android only
        navBarHidden    : true,
        exitOnClose     : true,
    });

    self.$window.add(self.$window.$view = Ti.UI.createView());

    /**
     * Fired just after the view is placed on the window,
     * so we can grab its measurements.
     */
    var onLayout = function(e){

        self.$window.$view.removeEventListener('postlayout', onLayout);

        var w = self.$window.$view.rect.width;
        var h = self.$window.$view.rect.height;

        self.$window.$view.add(self.$window.$view.$locate = Ti.UI.createButton({
            title   : 'L',
            zIndex  : 99,
            width   : 30,
            height  : 30,
            top     : 3,
            left    : 3
        }));

        // place a pointer icon right in the middle of the view
        self.$window.$view.add(self.$window.$view.$pointer = Ti.UI.createImageView({
            zIndex  : 99,
            width   : 30,
            height  : 34,
            top     : (h / 2) - 38,
            left    : (w / 2) - 15,
            image   : '/media/images/point.png',
            visible : false
        }));

        // center mexico city
        self.$window.$view.add(self.$window.$view.$map = Ti.Map.createView({
            zIndex    : 0,
            top       : 0,
            height    : h - 30,
            mapType   : Ti.Map.STANDARD_TYPE,
            region    : Geo.region({
                zoom      : 10,
                latitude  : 19.41419130854365,
                longitude : -99.13094738056566,
                width     : w,
                height    : h
            }),
            animate      : true,
            regionFit    : true,
            userLocation : false
        }));

        self.$window.$view.add(self.$window.$view.$bar = Ti.UI.createView({
            zIndex :1,
            top    : h - 30,
            height : 30,
            backgroundColor:'#333'
        }));

        self.$window.$view.add(self.$window.$view.$cab = Ti.UI.createView({
            zIndex:2,
            top: h - 37,
            width: 'auto',
            height: 40,
            borderWidth:3,
            borderColor:'#333',
            borderRadius:3,
            backgroundColor: '#666'
        }));

        self.$window.$view.$cab.add(self.$window.$view.$cab.$label = Ti.UI.createLabel({
            text  :' ¡ Taxi ! ',
            width : 100,
            color : '#DDD'
        }));

        ///////////////////////////////////////////////////////////////   EVENTS

        self.regionLast  = null;
        self.regionCurr  = null;
        self.regionTimer = null;
        self.regionEvent = null;

        var onAfterRegionChanged = function(e){
            var urlBase = 'http://maps.google.com/maps/api/geocode/json?sensor=false&language=es&address=';
            Net.xhr({
                type : 'GET',
                url  :  urlBase + e.latitude + ',' + e.longitude,
                success:function(response){
                    var address = {}
                    JSON.parse(response).results[0].address_components.forEach(function(value, i){
                        var val = self.Core.isDefined(value.long_name)? value.long_name : value.short_name;
                        address[value.types[0]] = val;
                    });
                    alert(JSON.stringify(address));
                },
                error:function(response){
                    alert('Hubo un error obteniendo la ubicación, ¿intentar nuevamente?');
                }
            });
        }

        var onRegionChanged = function(e) {
            var rc = this;
            // Apple triggers event after panning finishes, so we call directly
            if (Device.isApple) return onAfterRegionChanged.call(rc, e);
            // use an interval to detect when the user has stopped panning.
            if (!self.regionTimer){
                self.regionTimer = setInterval(function(){
                    // If different, the map's moving, keep looping.
                    if (self.regionLast !== self.regionCurr)
                        return (self.regionLast = self.regionCurr);
                    // No movement detected, stop loop, callback time!
                    clearInterval(self.regionTimer);
                    self.regionTimer = null;
                    onAfterRegionChanged.call(rc, e);
                }, 500);
            }
            self.regionCurr = {
                latitude       : e.latitude,
                longitude      : e.longitude,
                latitudeDelta  : e.latitudeDelta,
                longitudeDelta : e.longitudeDelta
            }
        }

        var onLocation = function(){
            // get location NOW!!
            Ti.Geolocation.getCurrentPosition(function(ePos){
                if (!self.regionEvent){
                    self.regionEvent = true;
                    self.$window.$view.$pointer.visible = true;
                    self.$window.$view.$map.addEventListener('regionChanged', onRegionChanged);
                }
                // if we get here, it means the gps is enabled, so allow the location event to fire
                self.$window.$view.$map.setLocation(Geo.region({
                    zoom      : 16,
                    latitude  : ePos.coords.latitude,
                    longitude : ePos.coords.longitude,
                    width     : w,
                    height    : h
                }));
            });
        }

        self.$window.$view.$locate.addEventListener('click', function(){
            onLocation();
        });


        // if we have location services enabled, zoom in!!!
        if (!Geo.config.enabled) return alert('GPS deshabilitado');
        return onLocation();
    }

    self.$window.$view.addEventListener('postlayout', onLayout);
    self.$window.open();
};


var translateErrorCode = function(code) {
    if (!code) return false;
    switch (code) {
        case Ti.Geolocation.ERROR_LOCATION_UNKNOWN:
            return "Location unknown";
        case Ti.Geolocation.ERROR_DENIED:
            return "Access denied";
        case Ti.Geolocation.ERROR_NETWORK:
            return "Network error";
        case Ti.Geolocation.ERROR_HEADING_FAILURE:
            return "Failure to detect heading";
        case Ti.Geolocation.ERROR_REGION_MONITORING_DENIED:
            return "Region monitoring access denied";
        case Ti.Geolocation.ERROR_REGION_MONITORING_FAILURE:
            return "Region monitoring access failure";
        case Ti.Geolocation.ERROR_REGION_MONITORING_DELAYED:
            return "Region monitoring setup delayed";
    }
};
