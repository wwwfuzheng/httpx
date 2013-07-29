/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var userCfg = require('./userConfig'),
    _ = require('underscore'),
    url = require('url'),
    fs = require('fs'),
    request = require('request');

var ruleType = {
    regexp: 0,
    local: 1,
    url: 2,
    combo: 10
};

module.exports = {
    route: function(urlData, callback){
        var solutions = userCfg.get('solutions'),
            use = userCfg.get('use')[urlData.remoteIp],
            rulePool = userCfg.get('rulePool'),
            settings = userCfg.get('settings'),
            matchRule,
            uri = urlData.path;

        solutions[use] &&  _.each(solutions[use].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    //组合规则
                    _.each(ruleDetail.groups, function(id){
                        var subRuleDetail = rulePool[id];
                        pattern = new RegExp(subRuleDetail.pattern, 'g');
                        if(pattern.test(uri)) {
                            uri = uri.replace(pattern, subRuleDetail.target);
                            if(!matchRule || (matchRule && matchRule.type !== ruleType['local'])) {
                                matchRule = subRuleDetail;
                            }
                        }
                    });
                } else {
                    pattern = new RegExp(ruleDetail.pattern, 'g');
                    if(pattern.test(uri)) {
                        uri = uri.replace(pattern, ruleDetail.target);
                        matchRule = ruleDetail;
                    }
                }
            }
        });

        solutions['GLOBAL'] && _.each(solutions['GLOBAL'].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    _.each(ruleDetail.groups, function(id){
                        var subRuleDetail = rulePool[id];
                        pattern = new RegExp(subRuleDetail.pattern, 'g');
                        if(pattern.test(uri)) {
                            uri = uri.replace(pattern, subRuleDetail.target);
                            if(!matchRule || (matchRule && matchRule.type !== ruleType['local'])) {
                                matchRule = subRuleDetail;
                            }
                        }
                    });
                } else {
                    pattern = new RegExp(ruleDetail.pattern, 'g');
                    if(pattern.test(uri)) {
                        uri = uri.replace(pattern, ruleDetail.target);
                        matchRule = ruleDetail;
                    }
                }
            }
        });

        if(matchRule && matchRule.type === ruleType['local']) {
            callback(null, fs.existsSync(uri) ? fs.createReadStream(uri) : '', matchRule);
        } else if (matchRule && matchRule.type === ruleType['url']) {
            var proxySetting = settings.proxyMode[settings.useProxyMode];
            if(_.isString(proxySetting)) {
                var urlObj = url.parse(uri, true);
                urlObj.protocol = urlData.protocol;
                urlObj.query['domain'] = urlObj.hostname;
                urlObj.query['port'] = urlObj.port;
                urlObj.host = proxySetting;

                callback(null, request(url.format(urlObj)), matchRule);
            }
        } else {
            var proxySetting = settings.proxyMode[settings.useProxyMode];
            if(_.isString(proxySetting)) {
                var urlObj = url.parse(uri, true);
                urlObj.protocol = urlData.protocol;
                urlObj.query['domain'] = urlData.host;
                urlObj.query['port'] = urlObj.port || '80';
                urlObj.host = proxySetting;

                callback(null, request(url.format(urlObj)), matchRule);
            }
        }
    }
};