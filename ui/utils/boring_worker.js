export default class __ModelWorker__ {
    _vars = {}
    _model = {};

    constructor(canvas, model, customVars = {}){
        this._vars["canvas"] = canvas;
        this._vars["context"] = canvas.getContext('2d');
        this._model = model;
        for(let i in customVars){
            this._vars[i] = customVars[i];
        }
        this.work();
    }

    work(){
        for(let statement of this._model.draw){
            console.log("[Statement...]", statement);
            this.read(statement);
        }
        console.log('[VARS]', this._vars);
        // this._vars = null;
    }

    read(statement){
        switch (statement.type){
            case "var": return this.createVar(statement);
            case "val": return this.getValue(statement);
            case "method": return this.callMethod(statement);
            case "assign": return this.assign(statement);
            case "condition": return this.takeDecision(statement);
            case "loop": return this.iterations(statement);
            case "increment": return this.increment(statement);
            case "test": return this.test(statement);
            case "get": return this.getIndexValue(statement);
        }
        return null;
    }

    getIndexValue(statement){
        let _var = this.getVarValue(statement.name);
        for(let part of statement.index){
            _var = this.getProps(_var, this.getVarValue(part))
        }
        return _var;
    }
    test(statement){
        const regex = new RegExp(statement.regex, statement.flag ?? "");
        const value = this.getValue(statement.value);
        return regex.test(value);
    }
    iterations(statement){
        for(let code of statement.init){
            this.read(code);
        }
        let goNext = true;
        let result;
        let i = 0;

        while(i < 1) {
            goNext = this.getValue(statement.condition);
            if (!goNext) {
                return result;
            }

            for (let code of statement.statements) {
                result = this.read(code);
            }
            i++;
        }
    }

    increment(statement){
        const _var = this.getVar(statement.name);
        if(_var[0]){
            _var[0][_var[1]] = this.doOperation(statement.operation, _var[0][_var[1]], this.getValue(statement.value));
            return _var[0][_var[1]];
        }
        return 0;
    }

    callMethod(statement){
        const object = this.read(statement.object);
        const args = [];
        for(let data of statement.arguments){
            args.push(this.getValue(data))
        }
        if(statement.name in object){
            return object[statement.name].apply(object, args);
        }
        return null;
    }

    takeDecision(statement){
        let goNext = true;
        let condition;
        for(let code of statement.statements){
            if("condition" in code){
                condition = this.getValue(code.condition);
                if(condition){
                    goNext = false;
                }
            }
            else{
                goNext = false;
            }

            if(!goNext){
                condition = null;
                for(let exec of code.statements){
                    condition = this.read(exec);
                }
                return condition;
            }
        }
        return null;
    }

    //@deprecated
    assign(statement){
        let object = this._vars;
        const split = statement.name.split(".");
        const props = split[split.length - 1];
        if(split.length > 1) {
            for (let i = 0; i < split.length - 1; i++) {
                if (split[i] in object) {
                    object = object[split[i]];
                } else return null;
            }
        }
        // console.log("[VAL]", this.getValue(statement.value), statement);
        if(props in object) object[props] = this.getValue(statement.value);
    }

    doOperation(sign, operand1, operand2){
        switch (sign){
            case "+=" : case "+" : return operand1 + operand2;
            case "-=" : case "-" : return operand1 - operand2;
            case "*=" : case "*" : return operand1 * operand2;
            case "/=" : case "/" : return operand1 / operand2;
            case "%=" : case "%" : return operand1 % operand2;
            case ">" : return operand1 > operand2;
            case ">=" : return operand1 >= operand2;
            case "<" : return operand1 < operand2;
            case "<=" : return operand1 <= operand2;
            case "==" : return operand1 == operand2;
            case "!=" : return operand1 != operand2;
            case "!" : return !operand2;
            case "and" : case "&&" : return operand1 && operand2;
            case "or" : case "||" : return operand1 || operand2;
            default: return 0;
        }
    }

    getProps(object, index){
        try{
            if(index in object){
                return object[index];
            }
            else return null;
        }
        catch {
            if(object.hasOwnProperty(index)){
                return object[index];
            }
            else return null;
        }
    }

    getVar(name){
        const split = name.split(".");
        let result = this._vars;
        for(let i = 0; i < split.length - 1; i++){
            result = this.getProps(result, split[i]);
            if(result === null) return result;
        }
        return [result, result != null && this.getProps(result, split[split.length - 1]) !== undefined ? split[split.length - 1] : null];
    }

    getVarValue(name){
        const object = this.getVar(name);
        return object[0] != null ? object[0][object[1]] : null;
    }

    getValue(statement){
        if(typeof statement != 'object') return statement;
        else if (statement.type === 'object') return statement.values;
        else if(statement.type === 'calc'){
            let result = 0;
            let operation = null;
            for(let value of statement.values){
                if(value.type === "operator"){
                    operation = value.value;
                }
                else if (operation != null){
                    result = this.doOperation(operation, result, this.getValue(value));
                }
                else result = this.getValue(value);
            }
            // console.log("[Result]", result);
            return result;
        }
        else if(statement.type === "val"){
            const split = statement.value.split(".");
            let result = this._vars;
            for(let part of split){
                result = this.getProps(result, part);
                if(result === null) return result;
            }
            return result;
        }
        return this.read(statement);
    }

    createVar(statement){
        const split = statement.name.split(".");
        let object = this._vars;
        for(let i = 0; i < split.length - 1; i++){
            if(!(split[i] in object)){
                object[split[i]] = {};
            }
            object = object[split[i]];
        }
        object[split[split.length-1]] = this.getValue(statement.value);
    }
}