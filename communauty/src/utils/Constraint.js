
class Constraint{
    static checkEmail(value){
        return /^[a-z][a-z0-9._]+[a-z0-9_]@[a-z0-9_.]+[a-z0-9_]\.[a-z0-9]{2,}$/.test(value);
    }

    static toFormalName(value){
        let result = '', up = true;
        value = value.toLowerCase();
        for(let i in value){
            result += up ? value[i].toUpperCase() : value[i];
            up = [' ', '-', "'"].indexOf(value[i]) >= 0;
        }
        return result;
    }

    static containsText(value){
        return /[\w]+/.test(value);
    }
}

module.exports = Constraint;