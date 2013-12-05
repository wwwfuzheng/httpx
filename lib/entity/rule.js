var userCfg = require('../../lib/userConfig'),
    webUtil = require('../../lib/util/util'),
    proxy = require('../../lib/proxy'),
    url = require('url'),
    request = require('request'),
    _ = require('underscore');

var API = {
    addRule: function(params, cb){
        var rules = JSON.parse(params.rules || '[]');
        var rulePool = userCfg.get('rulePool');

        _.each(rules, function(rule) {
            if(rule.type == 10) {
                //组合规则
                rulePool[rule.guid] = {
                    title: webUtil.trim(rule.title),
                    type: rule.type,
                    groups: rule.groups
                };
            } else {
                rulePool[rule.guid] = {
                    title: webUtil.trim(rule.title),
                    pattern: rule.pattern,
                    target: rule.target,
                    type: rule.type
                };
            }
        });

        userCfg.set('rulePool', rulePool);
        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false});
            } else {
                cb(null, {success:true});
            }
        });
    },
    delRule: function(params, cb){
        var guid = params.guid || '',
            rulePool = userCfg.get('rulePool'),
            solutions = userCfg.get('solutions');

        if(guid && rulePool[guid]) {
            //依赖的场景里的副本都删除
            _.each(solutions, function(solution){
                if(solution.rules.length) {
                    var waitForDel = [];
                    _.each(solution.rules, function(rule){
                        if(rule.id == guid) {
                            waitForDel.push(rule);
                        }
                    });

                    if(waitForDel.length) {
                        solution.rules = _.difference(solution.rules, waitForDel);
                    }
                }
            });

            userCfg.set('solutions', solutions);

            delete rulePool[guid];
            userCfg.set('rulePool', rulePool);

            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false});
                } else {
                    cb(null, {success:true});
                }
            });
        } else {
            cb(null, {success:false});
        }
    },
    editRule: function(params, cb){
        var rule = JSON.parse(params.rule || '{}');
        var rulePool = userCfg.get('rulePool');

        if(rule.type == 10) {
            //组合规则
            rulePool[rule.guid] = {
                title: webUtil.trim(rule.title),
                type: rule.type,
                groups: rule.groups
            };
        } else {
            rulePool[rule.guid] = {
                title: webUtil.trim(rule.title),
                pattern: rule.pattern,
                target: rule.target,
                type: rule.type
            };
        }
        userCfg.set('rulePool', rulePool);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false});
            } else {
                cb(null, {success:true});
            }
        });
    },
    removeRule: function(params, cb){
        var guid = params.guid || '',
            solutionId = params.solutionId || '';

        var solutions = userCfg.get('solutions');

        if(guid && solutionId && solutions[solutionId]) {
            var rules = [];
            _.each(solutions[solutionId].rules, function(rule){
                if(rule.id !== guid) {
                    rules.push(rule);
                }
            });

            solutions[solutionId].rules = rules;

            userCfg.set('solutions', solutions);

            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false});
                } else {
                    cb(null, {success:true});
                }
            });
        } else {
            cb(null, {success:false});
        }
    },
    enableRule: function(params, cb){
        var guid = params.guid || '',
            solutionId = params.solutionId || '',
            enable = params.enable === 'true' || false;

        var solutions = userCfg.get('solutions');

        if(guid && solutionId && solutions[solutionId]) {
            _.each(solutions[solutionId].rules, function(rule){
                if(rule.id === guid) {
                    rule.enable = enable;
                }
            });

            userCfg.set('solutions', solutions);

            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false});
                } else {
                    cb(null, {success:true});
                }
            });
        } else {
            cb(null, {success:false});
        }
    },
    sortRule: function(params, cb){
        var rules = JSON.parse(params.rules || '[]'),
            solutionId = params.solutionId || '';

        var solutions = userCfg.get('solutions'),
            rulePool = userCfg.get('rulePool');

        if(solutionId && solutions[solutionId]) {
            var filterRules = [];

            _.each(rules, function(id){
                if(rulePool[id]) {
                    _.each(solutions[solutionId].rules, function(rule){
                        if(rule.id === id) {
                            filterRules.push(rule);
                        }
                    });
                }
            });

            solutions[solutionId].rules = filterRules;

            userCfg.set('solutions', solutions);

            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false});
                } else {
                    cb(null, {success:true});
                }
            });
        } else {
            cb(null, {success:false});
        }
    },
    getComboRules: function(params, cb){
        var guid = params.guid || '',
            rulePool = userCfg.get('rulePool'),
            comboRule = rulePool[guid];

        if(guid && comboRule) {
            var rules = {};
            _.each(comboRule.groups, function(ruleId){
                if(rulePool[ruleId]) {
                    rules[ruleId] = rulePool[ruleId];
                }
            });

            cb(null, {success:true, data: {
                rules: rules,
                comboRule: comboRule
            }});
        } else {
            cb(null, {success:false});
        }
    },
    setHelpStatus: function(params, cb){
        var settings = userCfg.get('settings');
        if(settings.needHelp) {
            settings.needHelp = false;
            userCfg.set('settings', settings);

            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false});
                } else {
                    cb(null, {success:true});
                }
            });
        } else {
            cb(null, {success:true});
        }
    },
    debugUrl: function(params, cb){
        var url = params.url;

        proxy.debugUrl(url, function(text){
            cb(null, {success:true, msg: text});
        })
    }
};