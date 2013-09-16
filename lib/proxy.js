/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

var CombinedStream = require('combined-stream'),
    path = require('path'),
    contentType = require('./contentTypeLib'),
    ruleRoute = require('./ruleRoute'),
    Env = require('./runtime/env'),
    url = require('url'),
    comboParser = require('combo-url-parser'),
    async = require('async');

module.exports = {
    done: function(req, res, next){
        //反向代理bugfix
        var hostname = req.headers['x-forwarded-host'] || req.headers['X-Forwarded-For']|| req.headers.host || '',
            user = '127.0.0.1'; //临时处理
//            user = req.connection.remoteAddress || '127.0.0.1';

        if(hostname.indexOf('127.0.0.1') == -1 && hostname.indexOf('localhost') == -1 && hostname.indexOf(Env.localIp) == -1) {
            var paths = req.params.paths,
                fileType = path.extname(paths[0]),
                combinedStream = CombinedStream.create();

            res.setHeader('Content-type', contentType.getContentType(fileType));

            async.forEachSeries(paths, function(p, callback){
                ruleRoute.route({
                    protocol: req.protocol,
                    hostname: hostname,
                    path: p,
                    remoteIp: user
                }, function(err, stream, rule, afterMatchedUri, proxyUri) {
                    if(err) {
                        callback(err);
                    } else {
                        //先忽略combo的输出
                        if(paths.length == 1) {
                            res.setHeader('x-httpx-origin', p);
                            res.setHeader('x-httpx-rule', rule ? rule.pattern: 'none');
                            res.setHeader('x-httpx-replaced', afterMatchedUri);
//                        res.setHeader('x-httpx-proxy', proxyUri);
                        }

                        if(stream) {
                            combinedStream.append(stream);
                            if(contentType.isTextStream(fileType)) {
                                combinedStream.append('\r\n');
                            }
                            callback();
                        } else {
                            callback('404');
                        }
                    }
                });
            }, function(err){
                if(err) {
                    next();
                } else {
                    combinedStream.pipe(res);
                }
            });
        } else {
            next();
        }
    },
    debugUrl: function(uri, cb){
        var paths,
            uriObject =  url.parse(uri),
            debugText = [];
        //combo
        if(uri.indexOf('??') != -1) {
            paths = comboParser(uriObject.path);
        } else {
            paths = [uriObject.path.replace(/\?.*/, '')];
        }

        async.forEachSeries(paths, function(p, callback){
            ruleRoute.route({
                protocol: uriObject.protocol,
                hostname: uriObject.hostname,
                path: p,
                remoteIp: '127.0.0.1'
            }, function(err, stream, rule, afterMatchedUri, proxyUri) {
                if(err) {
                    callback(err);
                } else {
                    debugText.push('--------------**结束**----------------');
                    debugText.push('匹配到的规则为:' + (rule ? rule.title : 'none'));
                    debugText.push('匹配后的URL为：' + afterMatchedUri);
                    callback();
                }
            }, debugText);
        }, function(err){
            if(err) {
                debugText.push('匹配中发生错误，中止匹配');
                cb(debugText);
            } else {
                cb(debugText);
            }
        });

    }
};