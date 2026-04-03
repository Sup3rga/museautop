
class SocketTransfer{
    constructor(socket) {
        this.socket = socket;
    }

    transfer(request, response, execution, elseArgs = []){
        if(request === null && typeof response == 'string'){
            this.socket.emit(response, elseArgs);
        }
        else {
            this.socket.on(request, async (query) => {
                const args = [query, ...elseArgs];
                if (typeof response == 'function') {
                    return response.bind(this.socket, args);
                }
                this.socket.emit(response, await execution.apply(null, args));
            });
        }
        return this;
    }
}

module.exports = SocketTransfer;