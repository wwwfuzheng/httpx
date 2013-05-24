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
    contentType = require('./contentTypeLib');

module.exports = {
    done: function(req, res, next){
        //反向代理bugfix
        var host = req.headers['x-forwarded-host'] || req.headers['X-Forwarded-For']|| req.headers.host || '';
//            debug = userCfg.get('debug');

        if(host.indexOf('127.0.0.1') == -1 && host.indexOf('localhost') == -1) {
            var paths = req.params.paths,
                combinedStream = CombinedStream.create();

            res.setHeader('Content-type', contentType.getContentType(path.extname(paths[0])));

            _.each(paths, function(uri){
                combinedStream.append(fs.createReadStream(uri));
                combinedStream.append('\n');
                combinedStream.append(request('http://' + uri));
            });

            combinedStream.pipe(res);
        } else {
            next();
        }
    }
};