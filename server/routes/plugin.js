
/*
 * GET home page.
 */
var url = require('url'),
    request = require('request'),
    pluginLoader = require('../../lib/pluginLoader'),
    userConfig = require('../../lib/userConfig'),
    _ = require('underscore');

var Plugin = {
    loadPlugin: function(params, cb){
        pluginLoader.load(function(err, result){
            if(err) {
                cb(null, {success:false});
            } else {
                cb(null, {success:true, data: result});
            }
        });
    },
    updateCheckTime: function(params, cb){
        var pluginName = params.name;

        var plugins = userConfig.get('plugins');
        if(!plugins[pluginName]) {
            plugins[pluginName] = {};
        }

        plugins[pluginName]['lastCheckTime'] = new Date().getTime();
        userConfig.set('plugins', plugins);
        userConfig.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    importAbcPath: function(params, cb){
        var importApp = JSON.parse(params.importApp);

        var plugins = userConfig.get('plugins');
        if(!plugins['abc']) {
            plugins['abc'] = {};
            plugins['abc']['importCache'] = [];
        }

        plugins['abc']['lastCheckTime'] = new Date().getTime();
        plugins['abc']['importCache'] = _.union(plugins['abc']['importCache'], _.keys(importApp));
        userConfig.set('plugins', plugins);

        //TODO abc规则生成

        userConfig.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    cancelAbcImport: function(params, cb){
        var plugins = userConfig.get('plugins');
        if(!plugins['abc']) {
            plugins['abc'] = {};
        }

        plugins['abc']['lastCheckTime'] = new Date().getTime();
        userConfig.set('plugins', plugins);

        userConfig.save(function(err){
            if(err) {
                cb(null, {success:false,msg:err});
            } else {
                cb(null, {success:true});
            }
        });
    },
    importOneAbcPath: function(params, cb){
        var path = params.path;


    }
};

exports.route = function(req, res){
    var api = req.params.api;

    var params = req.method == 'GET' ? req.query : req.body;

    params.remoteIp = req.connection.remoteAddress;

    Plugin[api](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
};