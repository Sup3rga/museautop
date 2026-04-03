const Data = require('./Data');

class SocketableData extends Data{
    constructor() {
        super();
        this.sockets = [];
    }

    attachSocket(socket){
        if(this.sockets.indexOf(socket) < 0) {
            this.sockets.push(socket);
        }
        return this;
    }

    unlinkSocket(socket){
        this.sockets.filter((target)=>{
            if(target != socket)
                return false;
        });
    }

    send(destination, data){
        for(let socket of this.sockets){
            socket.emit(destination, data);
        }
    }
}

module.exports = SocketableData;