
/*
 * GET home page.
 */
var comboParser = require('combo-url-parser'),
    url = require('url'),
    request = require('request');

exports.prepare = function(req, res, next){
    var paths,
        p =  url.parse(req.url);
    //combo
    if(req.url.indexOf('??') != -1) {
        paths = comboParser(p.path);
    } else {
        paths = [p.path.replace(/\/\//g, '/').replace(/\?.*/, '')];
    }

    req.params['paths'] = paths;

    next();
};