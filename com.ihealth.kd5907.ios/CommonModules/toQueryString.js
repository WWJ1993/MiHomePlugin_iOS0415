function toQueryString(obj) {
    return obj ? Object.keys(obj).sort().map(function (key) {
        var val = obj[key];
        if (Array.isArray(val)) {
            return val.sort().map(function (val2) {
                return encodeURI(key) + '=' + encodeURI(val2);
            }).join('&');
        }

        return encodeURI(key) + '=' + encodeURI(val);
    }).join('&') : '';
}

module.exports = toQueryString;