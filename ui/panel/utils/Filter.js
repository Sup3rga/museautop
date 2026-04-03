
class Filter{

    static object(object,indexes = []){
        let result = {};
        indexes.forEach((val)=>{
            if(val in object){
                result[val] = object[val];
            }
        });
        return result;
    }

    static contains(object,indexes,nullValues= [null,undefined]){
        let checked = true;
        indexes.forEach((val)=>{
            if(!(val in object && nullValues.indexOf(object[val]) < 0)){
                checked = false;
                return checked;
            }
        });
        return checked;
    }

    static flush(object, indexes = []){
        for(let i in indexes){
            if(object[indexes[i]]){
                delete object[indexes[i]];
            }
        }
    }

    static toOptions(object, index, value){
        const options = {};
        for(let i in object){
            if(typeof object[i] !== 'object'){
                options[object[i]] = object[i].toString();
            }
            else {
                options[object[i][index]] = object[i][value];
            }
        }
        return options;
    }
}

module.exports = Filter;