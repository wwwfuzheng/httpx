/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */

var request = require('request'),
    http = require('http');

describe('test pipe', function() {
    it('test pipe', function(done) {
        request('https://gist.github.com/czy88840616/5610198/raw/6520b959366e987ed919540ebbc94a9ba06784be/store.json', function(err, res, body){
            console.log(body);
            done();
        });
    });
});