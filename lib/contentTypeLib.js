/**
 * @fileoverview
 * @author zhangting <zhangting@taobao.com>
 *
 */
var _ = require('underscore');

var contentType = {
    'htm': 'text/html',
    'html': 'text/html',
    'txt': 'text/plain',
    'js':'application/x-javascript',
    'css':'text/css',
    'swf':'application/x-shockwave-flash',
    'png': 'image/png',
    'gif': 'image/gif',
    'jpg': 'image/jpeg',
    'ico': 'image/x-icon',
    'less': 'text/css',
    'scss': 'text/css',
    'woff': 'application/x-font-woff',
    'ttf': 'application/octet-stream',
    'otf': 'application/octet-stream',
    'svg': 'Content-Type: image/svg+xml',
    'eot': 'application/vnd.ms-fontobject',
    'jpeg': 'image/jpeg',
    'jpe': 'image/jpeg',
    'bmp': 'image/x-ms-bmp'
};

module.exports = {
    contentTypeKeys: function(split){
        return _.keys(contentType).join(split || '|');
    },
    getContentType: function(suffix){
        return contentType[
            /^\./.test(suffix) ? suffix.replace(/\./, '') : suffix] || 'text/plain';
    },
    isTextStream: function(suffix){
        return /txt|js|css|less|sass/.test(suffix);
    }
};