var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore'),
    userConfig = require('../../lib/userConfig');

module.exports = {
    name: 'abc',
    init: function(callback){
        var abcCfg = require(webUtil.getUserHome() + '/.abc/global.json');

        var plugins = userConfig.get('plugins'),
            pluginCfg = plugins[this.name] || {};

        plugins[this.name] = pluginCfg;
        userConfig.set('plugins', plugins);

        var pathFilter = {};
        if(abcCfg) {
            _.each(abcCfg.history, function(path){
                if(plugins['abc']['importCache'] && plugins['abc']['importCache'].length) {
                    //过滤掉已经添加过的应用
                    if(_.indexOf(plugins['abc']['importCache'], path.name) == -1) {
                        pathFilter[path.name] = path.root;
                    }
                } else {
                    pathFilter[path.name] = path.root;
                }
            });
        }

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
    checkInterval: 30*24*60*60*1000
};