
export default class Url{
    static get(){
        return window.location.pathname;
    }

    static getHash(){
        return window.location.hash;
    }

    static match(scheme,path){
        return new RegExp(scheme.replace(/\//g, '\\/')).test(path);
    }
}