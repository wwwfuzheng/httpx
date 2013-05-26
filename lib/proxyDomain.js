/**
 * @fileoverview
 * @author Harry <czy88840616@gmail.com>
 *
 */

var request = require('request'),
    _ = require('underscore'),
    util = require('./util/util');

var proxyDomain = {},
    failMaxTryCount = 3;


function getDomain(){
    request('https://raw.github.com/czy88840616/arrow-ips/master/ips.json', function(error, response, body){
        if (!error && response.statusCode == 200) {
            try {
                proxyDomain = util.merge(proxyDomain, JSON.parse(body));
            } catch(ex) {

            }
        }
    });
}

setTimeout(getDomain, 0);


module.exports = {
    get: function(host){
        return proxyDomain[host];
    },
    set: function(host, ip){
        proxyDomain[host] = ip;
    }
};