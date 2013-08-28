/**
 * @fileoverview
 * @author Harry Chen <zhangting@taobao.com>
 *
 */

var cp = require('child_process'),
    path = require('path'),
    Env = require('./runtime/env'),
    _ = require('underscore'),
    util = require('./util/util');

module.exports = {

    web: function (bin, callback) {
        var env = bin.argv;
        env = util.merge(Env, env, ['cfg', 'port', 'from']);

        var p = [];
        _.each(env, function(value, idx){
            p.push('--'+idx);
            p.push(value);
        });

        var child = cp.fork(path.resolve(__dirname, '../server/app.js'), p, {
            env :util.merge( {
                'NODE_ENV': 'production'
                // 'NODE_ENV': 'development'
            }, process.env)
        });
    },
    help: function(){
        util.startWeb("https://github.com/czy88840616/httpx/wiki");
    },
    version: function(){
        console.log(require('../package.json').version);
    }
};