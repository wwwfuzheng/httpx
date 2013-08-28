/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var webUtil = require('../util/util');

var innerContext = {};

module.exports = {
    init: function(cfg){
        innerContext = webUtil.merge(innerContext, cfg);
    },
    get: function(key){
        return innerContext[key];
    },
    set: function(key, value){
        innerContext[key] = value;
    }
};