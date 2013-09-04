/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var userCfg = require('./userConfig'),
    _ = require('underscore'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
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
                    //如果是组合规则，取第一条规则作为主规则来匹配，如果没匹配到，则跳出
                    _.each(ruleDetail.groups, function(id, idx){
                        //第一个规则没匹配上就不会在去匹配了,underscore没break
                        if(matchRule || idx == 0) {
                            var subRuleDetail = rulePool[id];
                            pattern = new RegExp(subRuleDetail.pattern, 'g');

                            if(pattern.test(uri)) {
                                uri = uri.replace(pattern, subRuleDetail.target);
                                if(!matchRule || (matchRule && matchRule.type !== ruleType['local'])) {
                                    matchRule = subRuleDetail;
                                }
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

        use != -1 && solutions['GLOBAL'] && _.each(solutions['GLOBAL'].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    _.each(ruleDetail.groups, function(id, ifx){
                        if(matchRule || idx == 0) {
                            var subRuleDetail = rulePool[id];
                            pattern = new RegExp(subRuleDetail.pattern, 'g');

                            if(pattern.test(uri)) {
                                uri = uri.replace(pattern, subRuleDetail.target);
                                if(!matchRule || (matchRule && matchRule.type !== ruleType['local'])) {
                                    matchRule = subRuleDetail;
                                }
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
            var localPath = path.resolve(uri);
            callback(null, (fs.existsSync(localPath) && fs.statSync(localPath).isFile() ) ? fs.createReadStream(localPath) : '', matchRule, localPath, localPath);
        } else {
            //非本地路径剩下的只有url类型了，不管是匹配到还是没匹配到
            var proxySetting = settings.proxyMode[settings.useProxyMode];

            if(_.isString(proxySetting)) {
                var urlObj = url.parse(uri, true);
                urlObj.protocol = urlData.protocol;
                if (matchRule && matchRule.type === ruleType['url']) {
                    urlObj.query['domain'] = urlObj.hostname;
                } else {
                    urlObj.query['domain'] = urlData.hostname;
                }
                urlObj.query['port'] = urlObj.port || '80';
                urlObj.host = proxySetting;

                var lastProxyUri = url.format(urlObj);
                callback(null, request(lastProxyUri), matchRule, uri, lastProxyUri);
            }
        }
    }
};