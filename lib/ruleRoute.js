/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var userCfg = require('./userConfig'),
    proxyDomain = require('./proxyDomain'),
    _ = require('underscore'),
    url = require('url'),
    fs = require('fs');

var ruleType = {
    regexp: 0,
    local: 1,
    url: 2,
    combo: 10
};

module.exports = {
    route: function(host, p, callback){
        var solutions = userCfg.get('solutions'),
            use = userCfg.get('use'),
            rulePool = userCfg.get('rulePool'),
            matchRule,
            uri = p;

        _.each(solutions[use].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    _.each(ruleDetail.groups, function(id){
                        if(!matchRule) {
                            var subRuleDetail = rulePool[id];
                            pattern = new RegExp(subRuleDetail.pattern, 'g');
                            if(pattern.test(uri)) {
                                uri = uri.replace(pattern, subRuleDetail.target);
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

        _.each(solutions['GLOBAL'].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    _.each(ruleDetail.groups, function(id){
                        if(!matchRule) {
                            var subRuleDetail = rulePool[id];
                            pattern = new RegExp(subRuleDetail.pattern, 'g');
                            if(pattern.test(uri)) {
                                uri = uri.replace(pattern, subRuleDetail.target);
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
            callback(null, fs.createReadStream(uri), matchRule);
        } else if (matchRule && matchRule.type === ruleType['url']) {
            uri = 'http://' + uri;
            host = url.parse(uri);
            uri = uri.replace(host, proxyDomain.get(host));
            callback(null, request(uri), matchRule);
        } else {
            uri = 'http://' + proxyDomain.get(host) + uri;
            callback(null, request(uri));
        }
    }
};