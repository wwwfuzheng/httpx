
/*
 * GET home page.
 */
var url = require('url'),
    request = require('request'),
    pluginLoader = require('../../lib/pluginLoader'),
    userConfig = require('../../lib/userConfig');

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