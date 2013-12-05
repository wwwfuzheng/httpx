var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore'),
    path = require('path'),
    userConfig = require('../../lib/userConfig');

var generator = function(p, callback){
    p = path.resolve(p);

    var data, rules = [], directoryPath;

    if(fs.existsSync(p)) {
        if(fs.statSync(p).isDirectory()) {
            directoryPath = p;
            p = path.join(p, 'abc.json');
            if(!fs.existsSync(p)) {
                callback('abc.json不存在');
                return;
            }
        } else {
            directoryPath = path.dirname(p);
        }

        try {
            data = require(p);
        } catch(ex) {
            data = null;
            callback('abc.json格式不规范');
            return;
        }

        if(data && data['_kissy_cake'] && data['_kissy_cake']['styleEngine']) {
            var onlyCss = data['_kissy_cake']['styleEngine'] == 'css',
                projectName = data.name;

            if(onlyCss) {
                rules.push({
                    title: projectName + '-all',
                    pattern: '(/g)?/tb/'+projectName+'/(((\\d+[.]){2}\\d+)|src)/(.*?)(-min)?\\.(js|css|png|jpg|ico|eot|svg|ttf|woff)',
                    target: directoryPath + '/assets/src/$5.$7',
                    type: 1
                });
            } else {
                rules.push({
                    title: projectName + '-css',
                    pattern: '(/g)?/tb/'+projectName+'/(((\\d+[.]){2}\\d+)|src)/(.*?)(-min)?\\.css',
                    target: directoryPath + '/assets/src/$5.css',
                    type: 1
                });

                rules.push({
                    title: projectName + '-other',
                    pattern: '(/g)?/tb/'+projectName+'/(((\\d+[.]){2}\\d+)|src)/(.*?)(-min)?\\.(js|png|jpg|ico|eot|svg|ttf|woff)',
                    target: directoryPath + '/assets/src/$5.css',
                    type: 1
                });
            }
        }
    } else {
        callback('目录不存在');
    }

    return rules;

};


module.exports = {
    generator: generator
};