/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

var CombinedStream = require('combined-stream'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    request = require('request'),
    contentType = require('./contentTypeLib'),
    ruleRoute = require('./ruleRoute'),
    userCfg = require('./userConfig'),
    async = require('async');

module.exports = {
    done: function(req, res, next){
        //反向代理bugfix
        var host = req.headers['x-forwarded-host'] || req.headers['X-Forwarded-For']|| req.headers.host || '',
            user = req.connection.remoteAddress || '127.0.0.1';

        if(host.indexOf('127.0.0.1') == -1 && host.indexOf('localhost') == -1) {
            var paths = req.params.paths,
                fileType = path.extname(paths[0]),
                combinedStream = CombinedStream.create();

            res.setHeader('Content-type', contentType.getContentType(fileType));

            async.forEachSeries(paths, function(p, callback){
                ruleRoute.route({
                    protocol: req.protocol,
                    host: host,
                    path: p,
                    remoteIp: user
                }, function(err, stream, rule, uri) {
                    if(err) {
                        callback(err);
                    } else {
                        res.setHeader('x-httpx-origin', p);
                        res.setHeader('x-httpx-matched', rule?rule.pattern: 'none');
                        res.setHeader('x-httpx-result', uri);

                        combinedStream.append(stream);
                        if(contentType.isTextStream(fileType)) {
                            combinedStream.append('\r\n');
                        }
                        callback();
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
    }
};