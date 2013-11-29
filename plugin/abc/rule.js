var fs = require('fs'),
    webUtil = require('../../lib/util/util'),
    _ = require('underscore'),
    path = require('path'),
    userConfig = require('../../lib/userConfig');

var generator = function(p, appname){
    p = path.resolve(p);

    var data;

    if(fs.existsSync(p)) {
        if(fs.statSync(p).isDirectory()) {

        } else {
            try {
                data = require(p);
            } catch(ex) {
                data = null;
            }

            if(data && data['_kissy_cake'] && data['_kissy_cake']['styleEngine']) {
                var onlyCss = data['_kissy_cake']['styleEngine'] == 'css',
                    projectName = data.name;

                if(onlyCss) {

                }

            }
        }
    }


};


module.exports = {
    generator: generator
};