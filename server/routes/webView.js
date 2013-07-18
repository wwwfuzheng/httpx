/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var userConfig = require('../../lib/userConfig');

module.exports = {
    renderDashBoard: function(){
        return {
            ruleList: userConfig.get('rulePool')
        };
    }
};