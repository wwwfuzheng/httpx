/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var userConfig = require('../../lib/userConfig'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore');

module.exports = {
    renderDashBoard: function(){
        var ruleList = userConfig.get('rulePool');

        _.each(ruleList, function(rule){
            rule.simpleTitle = webUtil.subString(rule.title, 16, true);
        });

        return {
            ruleList: ruleList,
            solutions: userConfig.get('solutions')
        };
    }
};