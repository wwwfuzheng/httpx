var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore'),
    userConfig = require('../../lib/userConfig');

var generator = function(path, appname){
    if(fs.existsSync(path)) {

    }
    var stat = fs.statSync(path);

};


module.exports = {
    generator: generator
};