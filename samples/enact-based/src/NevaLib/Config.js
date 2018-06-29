import {SettingsKeys, SettingsConsts} from './Settings';

//TODO: Should be dynamically loaded file
const config = {
    'defaultBookmarks' : [
        {url:'https://google.com/', icon:null, title: 'Google'},
        {url:'https://www.w3.org/', icon:null, title: 'W3C'},
        {url:'http://www.bbc.com/news/', icon:null, title: 'BBC'},
        {url:'https://stackoverflow.com/', icon:null, title: 'Stackoverflow'}
    ],
    'defaultSettings' : {
        [SettingsKeys.STARTUP_PAGE_KEY]: SettingsConsts.NEW_TAB_PAGE,
        [SettingsKeys.HOME_PAGE_URL_KEY]: 'https://www.google.com',
        [SettingsKeys.SEARCH_ENGINE_KEY]: 'Google',
        [SettingsKeys.ALWAYS_SHOW_BOOKMARKS_KEY]: false,
        [SettingsKeys.PRIVATE_BROWSING_KEY]: false,
        [SettingsKeys.SITE_FILTERING_KEY]: 'off',
        [SettingsKeys.PIN_NUMBER_KEY]: '0000'
    },
    'restorePrevSessionPolicy':'onlyLastTab', /*onlyLastTab || allTabs*/
    'rendererPerTab':{
        'maxActiveTabs': 1,
        'maxSuspendedTabs': 2
    },
    'memoryManager': {
        'maxSuspendedNormal': 3,
        'maxSuspendedLow': 1,
        'maxSuspendedCritical': 0
    }

}

export default config;
