
class Constraint{
    static checkEmail(value){
        return /^[a-z][a-z0-9._]+[a-z0-9_]@[a-z0-9_.]+[a-z0-9_]\.[a-z0-9]{2,}$/.test(value);
    }

    static passEmail(value, nullValue=''){
        return Constraint.checkEmail(value) ? value : nullValue;
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

    static checkNickname(value){
        return /^[a-z][a-z0-9.]+[a-z]$/i.test(value);
    }

    static passNickname(value, nullValue = ''){
        return Constraint.checkNickname(value) ? value : nullValue;
    }

    static checkPhone(value){
        return /^[0-9]{1,3} *[0-9]+( *[0-9]+)*$/.test(value);
    }

    static passPhone(value, nullValue=''){
        return Constraint.checkPhone(value) ? value : nullValue;
    }

    static checkDomain(value){
        return /^[a-z][a-z0-9-.]+[a-z0-9]\.[a-z0-9]{2,6}$/.test(value);
    }

    static passDomain(value, nullValue=''){
        return Constraint.checkDomain(value) ? value : nullValue;
    }

    static checkBranchName(value){
        return /^[a-z][a-z0-9. -]+[a-z0-9]$/i.test(value);
    }

    static passBranchName(value, nullValue=""){
        return Constraint.checkBranchName(value) ? value : nullValue;
    }
}

module.exports = Constraint;