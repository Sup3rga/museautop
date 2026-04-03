
export default class Events{

    static events = {};

    static emit(ev,args){
        if(ev in Events.events){
            for(var i in Events.events[ev]){
                if(!Events.events[ev][i].source || Events.events[ev][i].source.mounted) {
                    Events.events[ev][i].callback(args);
                }
            }
        }
        return Events;
    }

    static off(ev){
        if(ev in Events.events){
            Events.events[ev] = [];
        }
        return Events;
    }

    static on(ev, callback, source= null){
        if(!(ev in Events.events)){
            Events.events[ev] = [];
        }
        Events.events[ev].push({
            source,
            callback
        });
        return Events;
    }
}