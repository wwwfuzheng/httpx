var userCfg = require('../../lib/userConfig'),
    _ = require('underscore');

var API = {
    addRule: function(params, cb){
        var rules = JSON.parse(params.rules || '[]');
        var rulePool = userCfg.get('rulePool');

        _.each(rules, function(rule) {
            if(rule.type == 10) {
                //组合规则
                rulePool[rule.guid] = {
                    title: rule.title,
                    type: rule.type,
                    rule: rule.rule
                };
            } else {
                rulePool[rule.guid] = {
                    title: rule.title,
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
                title: rule.title,
                type: rule.type,
                rule: rule.rule
            };
        } else {
            rulePool[rule.guid] = {
                title: rule.title,
                pattern: rule.pattern,
                target: rule.target,
                type: rule.type
            };
        }

        userCfg.set('rulePool', rulePool);

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

            userCfg.set('solutions', solutions);

            cb(null, {success:true, msg: '成功添加' + guids.length + '条规则'});
        } else {
            cb(null, {success:false, msg: '参数错误，可能是规则为空或者解决方案不存在'});
        }

    }
};

exports.route = function(req, res){
    var api = req.params.api;

    var params = req.method == 'GET' ? req.query : req.body;

    API[api](params, function(err, result) {
        if(err) {
            res.send(err);
        } else {
            res.send(result);
        }
    });
};