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
                    name: rule.title,
                    type: rule.type,
                    rule: rule.rule
                };
            } else {
                rulePool[rule.guid] = {
                    name: rule.title,
                    pattern: rule.pattern,
                    target: rule.target,
                    type: rule.type
                };
            }
        });

        userCfg.set('rulePool', rulePool);

        cb(null, {success:true});
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