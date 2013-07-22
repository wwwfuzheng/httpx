/**
 * @fileoverview 配置
 * @author Harry <czy88840616@gmail.com>
 *
*/
var nconf = require('nconf'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
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
                "pattern":"kissy-min",
                "target":"kissy",
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
                "title":"全局方案",
                "rules":[
                    {
                        id: kissyGuid,
                        enable:false
                    }
                ]
            };

            solutions[customSolutionGuid] = {
                "title":"自定义方案一",
                "rules":[
                    {
                        id: localGuid,
                        enable:false
                    }
                ]
            };

            nconf.set('solutions', solutions);
            nconf.set('use', customSolutionGuid);

            try {
                mkdirp.sync(path.dirname(argv.cfg));

                nconf.save(function(err){
                    if(err) {
                        callback(err);
                    }
                });
            } catch (ex) {
                callback(ex);
            }
        } else {
            //update
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
                callback(err);
            }else {
                callback();
            }
        });
    }
};