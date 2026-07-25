const Channel = require("../utils/Channel");

class Cookie{
    static processModes = {
        NEXT: 0,
        NODE: 1
    }
    static processMode = null;

    static exec = null;

    static setProvider(cookieObj, processMode){
        Cookie.exec = cookieObj;
        Cookie.processMode = processMode;
        // console.log('[Setup provider]', cookieObj);
    }

    static async set(id, data, options){
        try {
            if (Cookie.processMode === Cookie.processModes.NEXT) {
                Cookie.exec.set(id, data, options);
                return true;
            } else if (Cookie.processMode === Cookie.processModes.NODE) {
                // Cookie.exec.set(id, data, options);
            }
        }catch (e) {
            Channel.logError("[Cookie error]",e);
        }
        return false;
    }

    static async get(id){
        try {
            if (Cookie.processMode === Cookie.processModes.NEXT) {
                return Cookie.exec.get(id).value;
            }
        }catch (e) {
            Channel.logError("[Cookie error]",e);
        }
        return null;
    }
}

module.exports = Cookie;