import React from 'react';
import Hammer from '../lib/hammer';

export class CarousselSlide extends React.Component{

    render() {
        var style = {
            backgroundImage: 'url('+this.props.image+')'
        };
        return (
            <div className={
                "ui-element ui-size-12 ui-caroussel-slide slide ui-image-first "+
                (this.props.skeleton ? 'skeleton' : '')
            }>
                <div className="ui-container ui-image" style={style}>
                </div>
                <div className="ui-container ui-text">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

class CarousselWrapper extends React.Component{
    constructor(props) {
        super(props);
        this.element = null;
        this.slideTo = this.props.slideTo || null;
        this.width = 0;
        this.len = 0;
        this.translate = 0;
        this.ctl = null;
        if(this.slideTo){
            this.slideTo(this.setSlide.bind(this));
        }
    }

    setSlide(index){
        index = index <= 0 ? 0 : index >= this.len - 1 ? this.len - 1 : index;
        this.translate = -index * 100;
        this.setTranslate(this.translate,400);
        return index;
    }

    setTranslate(value, time = 0){
        value = value >= 0 ? 0 : value;
        this.element.style.transitionDuration = (time / 1000) +'s';
        this.element.style.transform = 'translate3d('+(value)+'%,0,0)';
    }

    componentDidMount() {
        this.width = this.element.offsetWidth;
        let total = this.len * this.width, percent;
        this.ctl = new Hammer(this.element);
        // this.ctl.on('panleft', ev => {
        //     percent = ev.distance / total * -100;
        //     let value = -this.translate + percent;
        //     this.setTranslate(value);
        // }).on('panright', ev => {
        //     percent = ev.distance / total * 100;
        //     let value = -this.translate + percent;
        //     console.log('[percent]',value);
        //     this.setTranslate(value);
        // }).on('panend', ev => {
        //     console.log('[Finish]', percent);
        // })
    }

    render() {
        let index = this.props.slide;
        this.translate = index * 100;
        let style = {
            transform: 'translate3d('+(-this.translate)+'%, 0,0)'
        };
        this.len = Array.isArray(this.props.children) ? this.props.children.length : 1;
        return <div className="ui-element ui-size-fluid ui-caroussel-wrapper" style={style} ref={ref => this.element = ref}>
                {this.props.children}
            </div>
    }
}

export default class Caroussel extends React.Component{
    constructor(props) {
        super(props);
        this.currentSlide = 0;
        this.setCall = null;
        this.slide = 0;
    }

    slideTo(callback){
        this.setCall = callback;
    }

    render() {
        return <div className="ui-container ui-size-fluid ui-caroussel caroussel">
            <button className="ui-element ui-caroussel-nav prev las la-arrow-left"
                    onClick={ e => {
                        if(this.setCall){
                            this.slide = this.setCall(--this.slide);
                        }
                    }}
            />
            <button className="ui-element ui-caroussel-nav next las la-arrow-right"
                    onClick={e => {
                        if(this.setCall){
                            this.slide = this.setCall(++this.slide);
                        }
                    }}
            />
            <div className="ui-element ui-caroussel-indicator ui-flex ui-vertical-center">
                <span className="ui-element ui-caroussel-indicator-dot ui-flex ui-horizontal-center ui-vertical-center active"/>
                <span className="ui-element ui-caroussel-indicator-dot ui-flex ui-horizontal-center ui-vertical-center"/>
                <span className="ui-element ui-caroussel-indicator-dot ui-flex ui-horizontal-center ui-vertical-center"/>
                <span className="ui-element ui-caroussel-indicator-dot ui-flex ui-horizontal-center ui-vertical-center"/>
            </div>
            <CarousselWrapper slide={this.slide} slideTo={this.slideTo.bind(this)}>
                {this.props.children}
            </CarousselWrapper>
        </div>
    }
}