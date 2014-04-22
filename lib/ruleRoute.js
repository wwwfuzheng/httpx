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
    request = require('request'),
    iconv = require('iconv-lite'),
    Transform = require('stream').Transform,
	util = require('util');
	
var ruleType = {
    regexp: 0,
    local: 1,
    url: 2,
    combo: 10
};

util.inherits(IconvStream, Transform);
function IconvStream(coding, cfg){
	Transform.call(this, cfg);
	this.coding = coding
}
IconvStream.prototype._transform = function(chunk, encoding, callback) {
	if(this.coding){
		chunk = iconv.encode(iconv.decode(chunk, 'utf8'), this.coding); 
	}
	callback(null, chunk);
};

module.exports = {
    route: function(urlData, callback, debug){
        var solutions = userCfg.get('solutions'),
            use = userCfg.get('use')[urlData.remoteIp],
            rulePool = userCfg.get('rulePool'),
            settings = userCfg.get('settings'),
            matchRule,
            uri = urlData.path;

        if(debug) {
            debug.push('开始调试:');
            solutions[use] && debug.push('当前有使用的自定义场景 [' + solutions[use].title + ']');
        }

        solutions[use] &&  _.each(solutions[use].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    debug && debug.push('   当前为组合规则 [' +ruleDetail.title +']');
                    //如果是组合规则，取第一条规则作为主规则来匹配，如果没匹配到，则跳出
                    _.each(ruleDetail.groups, function(id, idx){
                        //第一个规则没匹配上就不会在去匹配了,underscore没break
                        if(matchRule || idx == 0) {
                            var subRuleDetail = rulePool[id];
                            pattern = new RegExp(subRuleDetail.pattern, 'g');

                            debug && debug.push('       匹配第'+(idx+1)+'个子规则 [' +subRuleDetail.title +']=>' + pattern.test(uri));

                            if(pattern.test(uri)) {
                                uri = uri.replace(pattern, subRuleDetail.target);
                                if(!matchRule || (matchRule && matchRule.type !== ruleType['local'])) {
                                    matchRule = subRuleDetail;
                                }
                            }
                        }
                    });
                    if(debug) {
                        debug.push('    结束匹配组合规则');
                        debug.push('--');
                    }
                } else {
                    pattern = new RegExp(ruleDetail.pattern, 'g');
                    debug && debug.push('   当前为普通规则 [' +ruleDetail.title +']=>' + pattern.test(uri));

                    if(pattern.test(uri)) {
                        uri = uri.replace(pattern, ruleDetail.target);
                        matchRule = ruleDetail;
                    }
                }
            }
        });

        if(debug) {
            use != -1 && solutions['GLOBAL'] && debug.push('开始匹配全局场景');
        }

        use != -1 && solutions['GLOBAL'] && _.each(solutions['GLOBAL'].rules, function(rule){
            if(!matchRule && rule.enable) {
                var ruleDetail = rulePool[rule.id],
                    pattern;

                if(ruleDetail.groups) {
                    debug && debug.push('   当前为组合规则 [' +ruleDetail.title +']');
                    _.each(ruleDetail.groups, function(id, idx){
                        if(matchRule || idx == 0) {
                            var subRuleDetail = rulePool[id];
                            pattern = new RegExp(subRuleDetail.pattern, 'g');

                            debug && debug.push('       匹配第'+(idx+1)+'个子规则 [' +subRuleDetail.title +']=>' + pattern.test(uri));

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
                    debug && debug.push('   当前为普通规则 [' +ruleDetail.title +']=>' + pattern.test(uri));

                    if(pattern.test(uri)) {
                        uri = uri.replace(pattern, ruleDetail.target);
                        matchRule = ruleDetail;
                    }
                }
            }
        });

		var localPath = path.resolve(uri);
        if(matchRule && matchRule.type === ruleType['local'] && fs.existsSync(localPath) && fs.statSync(localPath).isFile()) {
        	// 本地代理并且本地有文件
            if(debug) {
                callback(null, null,  matchRule, localPath, localPath);
            } else {
            	var fileStream = fs.createReadStream(localPath),
            		iconvStream = new IconvStream(settings.charset === 'default' ? null : settings.charset);
				fileStream.pipe(iconvStream);
                callback(null, iconvStream, matchRule, localPath, localPath);
            }
        } else {
        	// 1、本地代理，但是本地没有文件
        	// 2、非本地代理
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
                
                // 本地代理但是本地找不到文件时走线上或日常，需要重置 pathname
                if(matchRule && matchRule.type === ruleType['local']){
               		urlObj.pathname = urlData.path;
                }
                
                if(settings.dailyFirst){
                	urlObj.host = settings.dailyIp;
                }
                
                var lastProxyUri = url.format(urlObj),
                	assetsStream;
                	
                if(settings.dailyFirst){
                	assetsStream = request(lastProxyUri, {headers: {host: settings.dailyHost}});
                }else{
                	assetsStream = request(lastProxyUri);
                }

                if(debug) {
                    callback(null, null,  matchRule, uri, lastProxyUri);
                } else {
                    callback(null, assetsStream, matchRule, uri, lastProxyUri);
                }
            }
        }
    }
};