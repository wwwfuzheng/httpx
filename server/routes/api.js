var userCfg = require('../../lib/userConfig'),
    webUtil = require('../../lib/util/util'),
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
            rulePool = userCfg.get('rulePool');

        if(guid && rulePool[guid]) {
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
    addSolution: function(params, cb){
        var guids = JSON.parse(params.guids || '[]'),
            solutionId = params.solutionId;

        var solutions = userCfg.get('solutions');

        if(guids.length && solutionId && solutions[solutionId]) {
            var solution = solutions[solutionId],
                successCount = 0,
                duplicateCount = 0,
                successGuids = [];
            _.each(guids, function(guid){
                var exist = _.some(solution.rules, function(rule){
                    return rule.id === guid;
                });
                if(exist) {
                    duplicateCount++;
                } else {
                    solution.rules.push({
                        id: guid,
                        enable:true
                    });
                    successGuids.push(guid);
                    successCount++;
                }
            });

            userCfg.set('solutions', solutions);

            userCfg.save(function(err){
                if(err) {
                    cb(null, {success:false});
                } else {
                    cb(null, {success:true, msg: '成功添加' + successCount + '条规则，有' + duplicateCount + '条重复规则被忽略', data: {
                        guids: successGuids
                    }});
                }
            });
        } else {
            cb(null, {success:false, msg: '参数错误，可能是规则为空或者解决方案不存在'});
        }
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
    addSolutionTitle: function(params, cb){
        var title = webUtil.trim(params.title) || '',
            solutionId = webUtil.newGuid(),
            solutions = userCfg.get('solutions');

        solutions[solutionId] = {
            title: title,
            rules: []
        };

        userCfg.set('solutions', solutions);

        userCfg.save(function(err){
            if(err) {
                cb(null, {success:false});
            } else {
                cb(null, {success:true, data: {
                    title: title,
                    guid: solutionId
                }});
            }
        });
    },
    switchSolution: function(params, cb){
        var guid = params.guid || '',
            remoteIp = params.remoteIp,
            solutions = userCfg.get('solutions'),
            use = userCfg.get('use');

        if(guid && solutions[guid]) {
            use[remoteIp] = guid;
            userCfg.set('use', use);
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
    delSolution: function(params, cb){
        var solutionId = params.solutionId || '',
            remoteIp = params.remoteIp,
            solutions = userCfg.get('solutions'),
            use = userCfg.get('use');

        if(solutionId && solutions[solutionId]) {
            var firstSolution = _.find(solutions, function(solution, id){
                return id != 'GLOBAL' && id != solutionId;
            });

            use[remoteIp] = firstSolution || '';
            delete solutions[solutionId];
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
    }
};

exports.route = function(req, res){
    var api = req.params.api;

    var params = req.method == 'GET' ? req.query : req.body;

    params.remoteIp = req.connection.remoteAddress;

    API[api](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
};