
// Adds protocol prefix to url if it hasn't it
// Exception: url starts with '/' - than that is file path
function getUrlWithPrefix(url) {
    if (!url.startsWith('/')) {
        let hasProtocol = url.indexOf('://') >= 0;
        if (!hasProtocol) {
            return 'http://' + url;
        }
    }

    return url;
}

export default getUrlWithPrefix;