/**
 * @author Hector Menendez
 */
var Core  = require('sys/core');
var add   = require('sys/style').add;

var Style = {};

////////////////////

Style.window = add({
	zIndex          : 0,
	backgroundColor : '#FFCC00',
    // Android Only
    navBarHidden    : true,
    exitOnClose     : true
});

Style.scrollview = add({
	scrolltype : 'vertical',
	scrollEnabled : false
});

////////////////////

Style.view = add({
	zIndex : 0
});

Style.view.Class('toolbar', {
	zIndex          : 99,
	backgroundColor : '#666'
});

Style.view.Class('address',{
	zIndex          : 1,
	layout          : 'vertical',
	height          : '100%',
	backgroundColor : 'green'
});

Style.view.Class('addressLine', {});

Style.view.Class('button', {
	color           : '#fff',
	backgroundColor : 'black',
	borderRadius    : 4
});

Style.view.Class('dimmer', {
	zIndex: 9999,
	opacity: .9,
	visible:false,
	backgroundColor:'#FC0'
});

////////////////////

Style.map = add({
	zIndex       : 0,
	top          : 0,
	mapType      : Ti.Map.STANDARD_TYPE,
    animate      : true,
    regionFit    : true,
    userLocation : false
});

//////////////////////////////



//////////////////////////////

Style.label = add({
	font:{
		fontSize:12,
		fontWeight:'bold'
	}
});

Style.label.Class('button', {
	color : '#fff',
	width : 'auto',
});

Style.label.Class('addressLabel', {
	color     : '#EEE',
	width     : '90%',
	textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
});

Style.label.Class('dimmer', {
	textAlign: 'center',
	color: '#333',
	font:{
		fontSize: 20,
		fontWeight: 'bold'
	}
});

//////////////////////////////

Style.textfield = add({});

Style.textfield.Class('addressField', {
	width           : '95%',
	backgroundColor : Core.Device.isApple? undefined : '#FFF',
	borderStyle     : Core.Device.isApple? Ti.UI.INPUT_BORDERSTYLE_ROUNDED : undefined
});


// this is required so the object is available
// (maybe sys/style should do it automatically)
module.exports = require('sys/style').clean(Style);