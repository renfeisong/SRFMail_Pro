var settings = require('../settings');
var cidReg = /cid:([a-zA-Z0-9\-\\\.@_\/\$]+)(['")])/g;

exports.toBoolean = function(val) {
    return (val == true || val == 'true' || (parseInt(val) != 0 && !isNaN(parseInt(val))));
};

exports.safeParseJson = function(val) {
    var data;
    try {
        data = JSON.parse(val);
    } catch(e) {
        return null;
    }
    return data;
};

exports.fetchContent = function(content) {
    return content.replace(cidReg, function(match, p1, p2) {
        return 'http://'+settings.host+':'+settings.listen+'/api/attachments/download?id='+p1+p2
    });
};