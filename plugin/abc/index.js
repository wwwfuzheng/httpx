var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore'),
    userConfig = require('../../lib/userConfig');

module.exports = {
    name: 'abc',
    init: function(callback){
        var abcCfg = require(webUtil.getUserHome() + '/.abc/global.json');

        var pathFilter = {};
        if(abcCfg) {
            _.each(abcCfg.history, function(path){
                pathFilter[path.name] = path.root;
            });
        }

        var plugins = userConfig.get('plugins'),
            pluginCfg = plugins[this.name] || {};

        pluginCfg['lastCheckTime'] = new Date().getTime();
        plugins[this.name] = pluginCfg;
        userConfig.set('plugins', plugins);

        var returnText = '<span>ABC中有新增应用 <a href="#" data-json=\''+JSON.stringify(pathFilter)+'\'>查看</a></span>';
        callback(returnText);
    },
    check: function(){
        var plugins = userConfig.get('plugins'),
            pluginCfg = plugins[this.name];

        if(fs.existsSync(webUtil.getUserHome() + '/.abc')) {
            if(pluginCfg && pluginCfg['lastCheckTime']) {
                return (new Date().getTime() - pluginCfg['lastCheckTime']) >= this.checkInterval;
            }
            return true;
        }

        return false;
    },
    checkInterval: 10*1000
};