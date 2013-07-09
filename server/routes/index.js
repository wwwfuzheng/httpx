
/*
 * GET home page.
 */
var comboParser = require('combo-url-parser'),
    url = require('url'),
    request = require('request');

exports.prepare = function(req, res, next){
    var paths;
    //combo
    if(req.url.indexOf('??') != -1) {
        var p =  url.parse(req.url);
        paths = comboParser(p.path);
    } else {
        paths = [req.url.replace(/\?.*/, '')];
    }

    req.params['paths'] = paths;

    next();
};