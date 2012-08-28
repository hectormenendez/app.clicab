/**
 *           ___            __
 *     _____/ (_)________ _/ /_
 *    / ___/ / / ___/ __ `/ __ \
 *   / /__/ / / /__/ /_/ / /_/ /
 *   \___/_/_/\___/\__,_/_.___/
 */
(function(){

    var Core   = require('sys/core');

    // make sure we have valid devices.
    // if (parseFloat(Ti.version) < 2.2)
    //    return Core.error('app:version');

    var Device = require('sys/device');
    var Config = require('config');
    var Geo    = require('lib/geo');


    if (!Device.isSupported)
        return Core.error('app:support');

    // load main, from application folder.
    require('lib/app').load('main');

})();
