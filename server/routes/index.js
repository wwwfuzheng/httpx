
/*
 * GET home page.
 */
var path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    userCfg = require('../../lib/userConfig'),
    request = require('request');

exports.index = function(req, res){
  res.render('index', {});
};