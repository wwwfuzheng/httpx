/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var userConfig = require('../../lib/userConfig'),
    webUtil = require('../../lib/util/util'),
    ctx = require('../../lib/runtime/context'),
    _ = require('underscore');

module.exports = {
    renderGuest: function(remoteIp){
        return {
            solutions: userConfig.get('solutions'),
            use: userConfig.get('use')[remoteIp]
        };
    },
    renderDashBoard: function(){
        var ruleList = JSON.parse(JSON.stringify(userConfig.get('rulePool')));

        _.each(ruleList, function(rule){
            rule.simpleTitle = webUtil.subString(rule.title || '', 16, true);
        });

        return {
            ruleList: ruleList,
            solutions: userConfig.get('solutions'),
            ruleNum: _.keys(ruleList).length,
            use: userConfig.get('use')['127.0.0.1'],
            settings: userConfig.get('settings'),
            context: {
                from: ctx.get('from')
            }
        };
    }
};