var Core = require('sys/core');


exports.load = function(){
    var app = Core.load.call(this, Core.args(arguments));
    // make every local element available to app.
    app.prototype.App  = this;
    app.prototype.Core = Core;
    app = new app();
    Core.log(app.prototype, 'lib:app:load');
    return app;
};
