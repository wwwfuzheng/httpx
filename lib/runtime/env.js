/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */
var path = require('path');

function getUserHome() {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var config = {
        port: '80',
        cfg: path.join(getUserHome() + '/.mc')
    };

require('dns').lookup(require('os').hostname(), function (err, addr, fam) {
    config['localIp'] = addr;
});

module.exports = config;