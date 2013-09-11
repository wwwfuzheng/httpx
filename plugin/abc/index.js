var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore');

module.exports = {
    init: function(callback){
        var abcCfg = require(webUtil.getUserHome() + '/.abc/global.json');

        var pathFilter = {};
        if(abcCfg) {
            _.each(abcCfg.history, function(path){
                pathFilter[path.name] = path.root;
            });
        }

        var returnText = '<span>ABC中有新增应用 <a href="#" data-json="'+JSON.stringify(pathFilter)+'">查看</a></span>'
        callback(returnText);
    },
    check: function(){
        return fs.existsSync(webUtil.getUserHome() + '/.abc');
    }
};