var fs = require('fs'),
    webUtil = require('../../lib/util/util');

module.exports = {
    init: function(){

    },
    hasInstall: function(callback){
        fs.exists(webUtil.getUserHome() + '.abc', function(exists){
            callback(exists);
        });
    }
};