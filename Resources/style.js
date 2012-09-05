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

Style.view.class('toolbar', {
	zIndex          : 99,
	backgroundColor : '#666'
});

Style.view.class('address',{
	zIndex          : 1,
	layout          : 'vertical',
	height          : '100%',
	backgroundColor : 'green'
});

Style.view.class('addressLine', {
	backgroundColor : 'pink'
});

Style.view.class('addressLineLeft', {
	width:'50%',
	layout: 'vertical',
	left:0,
	backgroundColor:'orange'
});

Style.view.class('addressLineRight', {
	width:'50%',
	layout: 'vertical',
	right:0,
	backgroundColor:'cyan'
});

Style.view.class('button', {
	color           : '#fff',
	backgroundColor : 'black',
	borderRadius    : 4
});

Style.view.class('dimmer', {
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

Style.label.class('button', {
	color : '#fff',
	width : 'auto',
});

Style.label.class('addressLabel', {
	color     : '#EEE',
	width     : '90%',
	textAlign : Titanium.UI.TEXT_ALIGNMENT_LEFT,
});

Style.label.class('dimmer', {
	textAlign: 'center',
	color: '#333',
	font:{
		fontSize: 20,
		fontWeight: 'bold'
	}
});

//////////////////////////////

Style.textfield = add({});

Style.textfield.class('addressField', {
	width       : '95%',
	height      : Core.Device.px2dp(Core.Device.isApple? 30 : 35)  + 'dp',
	borderStyle : Core.Device.isApple? Ti.UI.INPUT_BORDERSTYLE_ROUNDED : undefined,
	font:{
		fontSize:12,
		fontWeight:'bold'
	}
});


// this is required so the object is available
// (maybe sys/style should do it automatically)
module.exports = require('sys/style').clean(Style);