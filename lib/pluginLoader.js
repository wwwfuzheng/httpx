var fs = require('fs'),
    _ = require('underscore'),
    async = require('async');

var plugins = ['abc'], pluginInstance = {};

_.each(plugins, function(pluginName){
    pluginInstance[pluginName] = require('../plugin/' + pluginName + '/index');
});

module.exports = {
    load: function(cb){
        var result = {};

        async.map(_.keys(pluginInstance),function(pluginName, callback){
            if(pluginInstance[pluginName].check()) {
                pluginInstance[pluginName].init(function(data){
                    result[pluginName] = data;
                    callback(null);
                });
            } else {
                callback(null);
            }
        }, function(err, r){
            cb(err, result);
        });
    }
};