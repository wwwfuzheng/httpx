/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var request = require('request'),
    http = require('http'),
    CombinedStream = require('combined-stream');

http.createServer(function (req, resp) {
    var combinedStream = CombinedStream.create();

    combinedStream.append(request('http://a.tbcdn.cn/apps/alimall/app/tmsediter/base/??jq-app/CSSloading-min.js'));
    combinedStream.append('\n');
    combinedStream.append(request('http://a.tbcdn.cn/s/kissy/1.2.0/kissy.js'));

    combinedStream.pipe(resp);
}).listen('3000');