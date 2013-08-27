/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

var CombinedStream = require('combined-stream'),
    path = require('path'),
    contentType = require('./contentTypeLib'),
    ruleRoute = require('./ruleRoute'),
    async = require('async');

module.exports = {
    done: function(req, res, next){
        //反向代理bugfix
        var hostname = req.headers['x-forwarded-host'] || req.headers['X-Forwarded-For']|| req.headers.host || '',
            user = '127.0.0.1'; //临时处理
//            user = req.connection.remoteAddress || '127.0.0.1';

        if(hostname.indexOf('127.0.0.1') == -1 && hostname.indexOf('localhost') == -1) {
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