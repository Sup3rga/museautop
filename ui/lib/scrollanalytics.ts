import {RefObject} from "react";

export class ScrollAnalytics{
    percentTarget : number;
    timingTarget : number;
    ref: RefObject<null> = {current:null};
    _startTime : number;
    _ready : boolean = false;
    _percent : number = 0;
    _visible : boolean = true;
    _duration : number = 0;
    // @ts-expect-error this for good
    private callback : ()=>void;
    constructor(minPercent : number = -1, minTiming : number = -1, ref? : RefObject<null>) {
        this.percentTarget = minPercent;
        this.timingTarget = minTiming;
        this._startTime = new Date().getMilliseconds();
        if(ref) this.ref = ref;
    }

    private measure(){
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        let pos = {x: -1, y:-1, height: 0, width: 0};
        if(this.ref?.current){
            // @ts-expect-error this for good
            const rect = this.ref.current.getBoundingClientRect();
            pos = {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            }
        }
        return {
            percent: (currentScroll / totalHeight) * 100,
            visible: !this.ref || (
                ((pos.x + pos.width) > 0) &&
                ((pos.y + pos.height) > 0) &&
                (pos.y < window.innerHeight) &&
                (pos.x < window.innerWidth)
            )
        };
    }

    private assign (){
        const percent = this.measure();
        if(percent.percent >= this.percentTarget && this.percentTarget >= 0){
            this._ready = true;
            this.callback();
        }
        this._percent = Math.min(100, Math.max(0, percent.percent));
        this._visible = percent.visible;
        if(this._visible){
            this._startTime = Date.now();
        }
    }

    private watcher (){
        const elapsed = Date.now() - this._startTime;
        this._duration = elapsed;
        // console.log('[Duration]', this._duration, this._visible);
        if(elapsed >= this.timingTarget){
            this._ready = true;
            this.callback();
        }
        if(this._visible) window.requestIdleCallback(this.watcher.bind(this));
    }

    watch(callback : ()=>void){
        this.callback = callback.bind(this);
        window.addEventListener('scroll', this.assign.bind(this));
        if(this.timingTarget >= 0) {
            window.requestIdleCallback(this.watcher.bind(this));
        }
    }

    dispose(){
        window.removeEventListener('scroll', this.assign.bind(this));
    }
}