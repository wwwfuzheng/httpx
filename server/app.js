/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path')
    , render = require('../lib/render')
    , userCfg = require('../lib/config/userConfig')
    , snapCfg = require('../lib/config/snapConfig')
    , argv = require('optimist').argv
    , util = require('../lib/util/util')
    , cons = require('consolidate')
    , _ = require('underscore')
    , url = require('url')
    , fs = require('fs')
    , comboParser = require('combo-url-parser')
    , request = require('request')
    , iconv = require('iconv-lite')
    , colors = require('colors')
    , Env = require('../lib/env')
    , async = require('async');

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

var processUrl = function(uri, domain,  callback){
    var rules = userCfg.get('rules'),
        proxyDomain = userCfg.get('proxyDomain'),
        isMatch = false,
        matchRule;

    _.each(rules, function(rule){
        if(!isMatch && rule.enable) {
            var pattern = new RegExp(rule.pattern, 'g');
            if(pattern.test(uri)) {
                uri = uri.replace(pattern, rule.target);
                matchRule = rule;
                isMatch = true;
            }
        }
    });

    if(!isMatch) {
        if(!proxyDomain[domain]) {
            console.log('[' + 'WARN'.yellow + '] 请配置一条域名转换以避免死循环, domain=%s',domain.cyan);
        }
        //没匹配到的，必须要过滤域名为ip
        uri = proxyDomain[domain] + uri;
    } else if(!util.isLocalFile(uri)) {
        if(!proxyDomain[domain]) {
            console.log('[' + 'WARN'.yellow + '] 请配置一条域名转换以避免死循环, domain=%s',domain.cyan);
        }
        uri = proxyDomain[domain] + uri;
    }

    if(_.isUndefined(proxyDomain[domain])) {
        uri = uri.replace('undefined', '127.0.0.1');
    }

    callback(uri, matchRule);
};

var contentType = {
    '.js':'application/x-javascript;',
    '.css':'text/css;',
    '.swf':'application/x-shockwave-flash;',
    '.png': 'image/png;',
    '.gif': 'image/gif;',
    '.jpg': 'image/jpeg;',
    '.ico': 'image/x-icon;',
    '.less': 'text/css;',
    '.scss': 'text/css;'
};

app.get('(*??*|*.(css|js|ico|png|jpg|swf|less|gif|woff|scss))', function(req, res, next){
    //反向代理bugfix
    var host = req.headers['x-forwarded-host'] || req.headers['X-Forwarded-For']|| req.headers.host || '',
        debug = userCfg.get('debug');

    if(host.indexOf('127.0.0.1') == -1 && host.indexOf('localhost') == -1
        && (/\.(css|js|ico|png|jpg|swf|less|gif|woff|scss)/.test(req.url) || req.url.indexOf("??") != -1)) {
        var paths;
        //combo
        if(req.url.indexOf('??') != -1) {
            var p =  url.parse(req.url);
            paths = comboParser(p.path);
        } else {
            paths = [req.url];
        }

        res.setHeader('Content-type', contentType[path.extname(paths[0].replace(/\?.*/, ''))]);

        async.forEachSeries(paths, function(p, callback){
            processUrl(p, host, function(uri, rule){
                if(util.isLocalFile(uri, debug)) {
                    uri = uri.replace(/\?.*/, '');

                    if(fs.existsSync(uri)) {
                        var stream = fs.createReadStream(uri);
                        res.write('/*url: ['+uri+'], matched pattern: [' + rule.pattern.replace(/\//g, ' /') + ']*/\r\n');
                        stream.pipe(res, { end: false });
                        stream.on('end', callback);
                        stream.on('error', callback);
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-type', 'text/html');
                        res.write('<h1>这个文件真的不存在，404了哦</h1>查找的文件是：' +
                            uri +
                            '<hr>Powered by Vmarket');
                        res.end();
                    }
                } else {
                    request.get({
                        url:  'http://' + uri,
                        encoding: null
                    }, function (error, response, body) {
                        if(error) {
                            res.write(error.toString() + ', uri=http://' + uri);
                        }

                        if(!response) {
                            console.log('connect fail: ' + uri);
                        } else if(response.statusCode == 200) {
                            res.write(body);
                        } else if(response.statusCode == 404) {
                            res.statusCode = 404;
//                            res.setHeader('Content-type', 'text/html');
                            error && console.log(error);
                            res.write('<h1>这个文件真的不存在，404了哦</h1>给你看看错误信息<div><textarea style="width:600px;height:400px">' +
                                (error ? error.toString(): body) +
                                '</textarea></div><hr>Powered by Vmarket');
                        }
                        callback(error);
                    });
                }
            });
        }, function(err){
            res.end();
        });
    } else {
        next();
    }
});

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function () {
    userCfg.init({
        cfg:argv.cfg || Env.cfg
    });

    snapCfg.init({
        cfg:argv.snapCfg || Env.snapCfg
    });
    console.log('Status:', 'Success'.bold.green);
    console.log("Listen Port： " + app.get('port').toString().cyan);
    console.log("Help：" + "(sudo) vm help".cyan);
    console.log('请使用 '+ 'Control+C'.bold +  ' 来关闭控制台，配置页:http://127.0.0.1' + (app.get('port').toString() === '80' ? '' : ':' + app.get('port')));

    if(userCfg.get('open')) {
        setTimeout(function () {
            util.startWeb('http://127.0.0.1:' + app.get('port'));
        }, 300);
    }
}).on('error', function(err){
    console.log('Status:', 'Fail'.bold.red);
    console.log('Error:', err.message.toString().bold.red, '可能是端口被占用或者权限不足');
    console.log('请使用 '+ 'Control+C'.bold +  ' 来关闭控制台');
});
