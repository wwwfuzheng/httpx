/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

var request = require('request'),
    http = require('http'),
    StreamCache = require('stream-cache');

describe('test pipe', function() {
    it('test pipe', function(done) {

        var cache = new StreamCache();

        http.createServer(function (req, resp) {
            request('http://a.tbcdn.cn/apps/alimall/app/tmsediter/base/??jq-app/CSSloading-min.js').pipe(cache);
            cache.pipe(resp);
            done();
        }).listen('3000');
    });
});