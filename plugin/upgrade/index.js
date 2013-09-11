var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore'),
    request = require('request');

module.exports = {
    init: function(callback){
        var pjson = require('../../package.json').version;
        request.get('http://registry.npmjs.org/httpx', function (error, response, body) {
            var r;
            try {
                r = JSON.parse(body);
            } catch(ex) {

            }

            if(r && pjson.version != r['dist-tags'].latest) {
                var returnText = '<span>当前有应用更新 <a target="_blank" href="https://github.com/czy88840616/httpx/blob/master/CHANGELOG.md#'+pjson.replace(/\./g, '')+'">查看</a></span>'
                callback(returnText);
            } else {
                callback();
            }
        });
    },
    check: function(){
        return fs.existsSync(webUtil.getUserHome() + '/.abc');
    }
};