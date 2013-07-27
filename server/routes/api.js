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

        cb(null, {success:true});
    },
    delRule: function(params, cb){
        var guid = params.guid || '',
            rulePool = userCfg.get('rulePool');

        if(guid && rulePool[guid]) {
            delete rulePool[guid];
            userCfg.set('rulePool', rulePool);

            cb(null, {success:true});
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

        cb(null, {success:true});
    },
    addSolution: function(params, cb){
        var guids = JSON.parse(params.guids || '[]'),
            solutionId = params.solutionId;

        var solutions = userCfg.get('solutions');

        if(guids.length && solutionId && solutions[solutionId]) {
            var solution = solutions[solutionId];
            _.each(guids, function(guid){
                solution.rules.push({
                    id: guid,
                    enable:true
                });
            });

            cb(null, {success:true, msg: '成功添加' + guids.length + '条规则'});
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

            cb(null, {success:true});
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

            cb(null, {success:true});
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

            cb(null, {success:true});
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

        cb(null, {success:true, data: {
            title: title,
            guid: solutionId
        }});
    },
    switchSolution: function(params, cb){
        var guid = params.guid || '',
            removeIp = params.removeIp,
            solutions = userCfg.get('solutions');

        if(guid && solutions[guid]) {
            userCfg.set('use', guid);
            cb(null, {success:true});
        } else {
            cb(null, {success:false});
        }
    }
};

exports.route = function(req, res){
    var api = req.params.api;

    var params = req.method == 'GET' ? req.query : req.body;

    params.removeIp = req.connection.remoteAddress;

    API[api](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
};