const SearchEngineType = {
    GOOGLE: 'Google',
    YAHOO: 'Yahoo!',
    BING: 'Bing'
};

function getSearchUrl(type, text) {
    switch (type) {
        case SearchEngineType.YAHOO:
            return `https://search.yahoo.com/search?p=${text}&ei=UTF-8`;
        case SearchEngineType.BING:
            return `https://www.bing.com/search?q=${text}`;
        case SearchEngineType.GOOGLE:
        default:
            return `https://www.google.com/search?q=${text}`;
    }
}

const possiblyUrlRegexp = /^(?:\b(?:chrome|http|https|):\/\/[^<>\s]+|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]+)\.)+(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]+)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w))|(?:about:blank)$/;

class SearchService {
    constructor() {
        this.engine = SearchEngineType.GOOGLE;
    }

    possiblyUrl(candidate) {
        return possiblyUrlRegexp.test(candidate);
    }

    getSearchUrl(text) {
        return getSearchUrl(this.engine, text);
    }
}

export default SearchService;
export {SearchService, SearchEngineType};