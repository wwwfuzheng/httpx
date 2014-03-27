/**
 * @fileoverview 配置
 * @author Harry <czy88840616@gmail.com>
 *
*/
var nconf = require('nconf'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    _ = require('underscore')
    webUtil = require('./util/util');

module.exports = {
    init:function(argv, callback){
        nconf.env()
            .file({ file: argv.cfg });

        // first init
        if(!fs.existsSync(argv.cfg)) {
            var rulePool = {}, solutions = {};
            var kissyGuid = webUtil.newGuid(),
                localGuid = webUtil.newGuid(),
                customSolutionGuid = webUtil.newGuid();

            rulePool[kissyGuid] = {
                "title":"kissy去min",
                "pattern":"(kissy|seed)-min\\.js",
                "target":"$1.js",
                "type":0
            };

            rulePool[localGuid] = {
                "title":"本地路径替换",
                "pattern":"/apps/tradeface",
                "target":"D:/project/tradeface/assets",
                "type":1
            };

            nconf.set('rulePool', rulePool);

            solutions["GLOBAL"] = {
                "title":"全局场景",
                "rules":[
                    {
                        id: kissyGuid,
                        enable:true
                    }
                ]
            };

            solutions[customSolutionGuid] = {
                "title":"自定义场景一",
                "rules":[
                    {
                        id: localGuid,
                        enable:false
                    }
                ]
            };

            nconf.set('solutions', solutions);
            nconf.set('plugins', {});
            nconf.set('use', {
                '127.0.0.1': customSolutionGuid
            });

            var settings = {
                lastCheckTime: new Date().getTime(),
                proxyMode: {
                    url: 'proxy.taobao.net',
                    map:{}
                },
                useProxyMode: 'url',
                needHelp: true,
                dailyFirst: false,
                dailyIp: "10.235.136.37",
                dailyHost: 'g.assets.daily.taobao.net'
            };

            nconf.set('settings', settings);

            try {
                mkdirp.sync(path.dirname(argv.cfg));

                nconf.save(function(err){
                    if(err) {
                        callback && callback(err);
                    }
                });
            } catch (ex) {
                callback && callback(ex);
            }
        } else {
            //update
            var hasModified = false;
            if(!nconf.get('plugins')) {
                nconf.set('plugins', {});
                hasModified = true;
            }

            if(hasModified) {
                nconf.save(function(err){
                    if(err) {
                        callback && callback(err);
                    }
                });
            }
        }
    },
    get: function(key){
        return nconf.get(key);
    },
    set: function(key, value){
        nconf.set(key, value);
    },
    save: function(callback){
        nconf.save(function(err){
            if(err) {
                callback && callback(err);
            }else {
                callback && callback();
            }
        });
    },
    check: function(){
        //自检
        var rulePool = this.get('rulePool'),
            solutions = this.get('solutions');

        //检查规则被删除，而场景里还被依赖
        _.each(solutions, function(solution){
            if(solution.rules.length) {
                var waitForDel = [];
                _.each(solution.rules, function(rule){
                    if(!rulePool[rule.id]) {
                        waitForDel.push(rule);
                    }
                });

                if(waitForDel.length) {
                    solution.rules = _.difference(solution.rules, waitForDel);
                }
            }
        });

        this.save();

    }
};