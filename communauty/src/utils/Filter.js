
class Filter{

    static object(object,indexes = []){
        let result = {};
        indexes.map((val)=>{
            if(val in object){
                result[val] = object[val];
            }
        });
        return result;
    }

    static contains(object,indexes,nullValues= [null]){
        let checked = true;
        indexes.map((val)=>{
            if(!(val in object && nullValues.indexOf(object[val]) < 0)){
                checked = false;
                return checked;
            }
        });
        return checked;
    }
}

module.exports = Filter;