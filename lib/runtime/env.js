/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var path = require('path'),
    webUtil = require('../util/util');

var config = {
        port: '80',
        cfg: path.join(webUtil.getUserHome() + '/.mc')
    };

require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
    config['localIp'] = addr;
});

module.exports = config;