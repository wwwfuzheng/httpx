﻿/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var express = require('express')
    , http = require('http')
    , path = require('path')
    , argv = require('optimist').argv
    , cons = require('consolidate')
    , _ = require('underscore')
    , url = require('url')
    , fs = require('fs')
    , request = require('request')
    , iconv = require('iconv-lite')
    , colors = require('colors')
    , Env = require('../lib/env')
    , proxy = require('../lib/proxy')
    , route = require('./routes/index')
    , userCfg = require('../lib/userConfig')
    , Api = require('./routes/api')
    , WebView = require('./routes/webView')
    , contentType = require('../lib/contentTypeLib');

var app = express();

app.configure(function () {
    app.set('port', argv.port || Env.port);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.engine('html', cons.jazz);
    app.use(express.favicon());
//    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.get('(*??*|*.(' + contentType.contentTypeKeys('|') + '))', route.prepare, proxy.done);

app.get('/', function(req, res){
    res.render('dashboard', WebView.renderDashBoard());
});

app.post('/api/:api', Api.route);

http.createServer(app).listen(app.get('port'), function () {
    userCfg.init({
        cfg:argv.cfg || Env.cfg
    });

    console.log('Status:', 'Success'.bold.green);
    console.log("Listen Port： " + app.get('port').toString().cyan);
    console.log("Help：" + "(sudo) vm help".cyan);
    console.log('请使用 '+ 'Control+C'.bold +  ' 来关闭控制台，配置页:http://127.0.0.1' + (app.get('port').toString() === '80' ? '' : ':' + app.get('port')));

}).on('error', function(err){
    console.log('Status:', 'Fail'.bold.red);
    console.log('Error:', err.message.toString().bold.red, '可能是端口被占用或者权限不足');
    console.log('请使用 '+ 'Control+C'.bold +  ' 来关闭控制台');
});
