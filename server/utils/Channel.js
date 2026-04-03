const code = require('./ResponseCode');

class Channel {

    static message(options={}){
        let message = typeof options == 'string' ? options : null
        let response = {
            error: true,
            code: code.ERROR,
            message: message,
            data: []
        };
        if(typeof options == 'object') {
            for (let i in options) {
                if (i in response) {
                    response[i] = options[i];
                }
            }
        }
        return response;
    }

    static logError(e){
        console.log('[Error]',e);
        return Channel;
    }
}

module.exports = Channel;