class SocketRequestHandler {
    constructor(srcUrl = "", emitUrl = "", handler = null, uuid = null) {
        this.srcUrl =srcUrl;
        this.emitUrl =emitUrl;
        this.handler = handler;
        this.uuid = uuid;
    }

    async execute(args){
        if(this.handler){
            return await this.handler.apply(this, args);
        }
        return null
    }
}
class SocketTransfer{

    static broadcast = {
        All: 1,
        Other: 2
    }
    constructor(socket) {
        this.socket = socket;
    }

    transfer(request, response, execution, elseArgs = [], broadcast = false){
        if(request === null && typeof response == 'string'){
            this.socket.emit(response, elseArgs);
        }
        else {
            request = Array.isArray(request) ? request : [request];
            let result;
            for(let _request of request) {
                this.socket.on(_request, async (query) => {
                    const args = [query, ...elseArgs];
                    if (typeof response == 'function') {
                        return response.bind(this.socket, args);
                    }
                    result = await new SocketRequestHandler(_request, response, execution, this.socket.data?.visitoruid).execute(args);
                    if (typeof broadcast == "object") {
                        if (typeof broadcast.room == "string") {
                            const room = broadcast.keyMode ? query[broadcast.room] : broadcast.room;
                            if (!this.socket.rooms.has(room)) {
                                this.socket.join(room);
                            }
                            if (_request !== response || broadcast.emit === SocketTransfer.broadcast.All){
                                // console.log('[Diffusion]', response, room);
                                this.socket.to(room).emit(response, result);
                            }
                            this.socket.emit(response, result);
                        }
                    } else if (broadcast === true) this.socket.broadcast.emit(response, result);
                    else this.socket.emit(response, result);
                });
            }
        }
        return this;
    }
}

module.exports = SocketTransfer;