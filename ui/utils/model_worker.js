export default class ModelWorker {
    _vars = {}
    _model = {};

    constructor(canvas, model, customVars = {}){
        // console.log("[MODEL WORKER] start.")
        this._vars = {};
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
            this.read(statement);
        }
        // console.log('[VARS]', this._vars);
        // this._vars = null;
    }

    read(statement, options = []){
        if(typeof statement != "object"){
            throw new Error("Error within parsing statement :: ", statement);
            return;
        }
        const type = Object.keys(statement)[0];
        switch (type){
            case "set": return this.createVars(statement[type]);
            case "methods": return this.callMethods(statement[type]);
            case "method": return this.callMethod(statement[type]);
            case "if": return this.takeDecision(statement[type], options);
            case "loop": return this.iterations(statement[type], options);
            case "test": return this.test(statement[type]);
            case "get": return this.getIndexValue(statement[type]);
        }
        return null;
    }

    //@new
    getIndexValue(statement){
        const name = Object.keys(statement)[0];
        let _var = this.getValue(name);
        for(let part of statement[name]){
            _var = this.getProps(_var, this.getValue(part))
        }
        return _var;
    }

    //@hold
    test(statement){
        const regex = new RegExp(statement.regex, statement.flag ?? "");
        const value = this.getValue(statement.value);
        return regex.test(value);
    }

    //@new
    iterations(statement, options=[]){
        let goNext = true;
        let result;
        let i = 0;
        let source;
        let isArray = false;
        let index = [];
        let k = 0;

        if('source' in statement && 'vars' in statement){
            source = this.getValue(statement.source);
            isArray = Array.isArray(source);
            if(!isArray && typeof source != 'object') throw new Error("Can't parse : ", statement);
            index = Object.keys(source);
        }
        while(true) {
            i++;
            if('check' in statement) {
                goNext = this.getValue(statement.check);
            }
            else if('source' in statement && 'vars' in statement){
                if(k < index.length) {
                    this._vars[statement.vars[0]] = source[index[k]];
                    if (statement.vars.length > 1) this._vars[statement.vars[1]] = isArray ? parseInt(index[k]) : index[k];
                    k++;
                }
                else{
                    goNext = false;
                }
            }
            else{
                throw new Error("Can't parse : ", statement);
            }
            if (!goNext) {
                return result;
                break;
            }
            for (let code of statement.exec) {
                result = this.read(code);
            }
        }
    }

    //@new
    callMethods(statement){
        const array_mode = Array.isArray(statement);
        let result = null;
        let key;
        for(let method in statement){
            if(array_mode){
                key = Object.keys(statement[method])[0];
                result = this.callMethod({
                    name: key,
                    params: statement[method][key]
                });
            }
            else {
                result = this.callMethod({
                    name: method,
                    params: statement[method]
                });
            }
        }
        return result;
    }
    //@new
    callMethod(statement){
        const method = this.getValue(statement.name);
        const object = this.getValue((()=>{
            const parts = statement.name.split(".");
            parts.pop();
            return parts.join(".");
        })())
        const args = [];
        for(let data of statement.params){
            args.push(this.getValue(data))
        }
        if(method){
            return method.apply(object, args);
        }
        return null;
    }

    //@new
    takeDecision(statements, options = []){
        let goNext = true;
        let condition;
        for(let code of statements){
            if("check" in code){
                condition = this.getValue(code.check);
                if(condition){
                    goNext = false;
                }
            }
            else{
                goNext = false;
            }

            if(!goNext){
                condition = null;
                for(let exec of code.exec){
                    if(options.indexOf("var") >= 0) condition = this.getValue(exec);
                    else condition = this.read(exec);
                }
                return condition;
            }
        }
        return null;
    }

    //@hold
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

    //@new
    getValue(statement, options = []){
        if(typeof statement == "number" || typeof statement == "boolean") return statement;
        if(typeof statement == "string"){
            if(/^"([\s\S]+?)?"$/.test(statement.trim())){
                return RegExp.$1;
            }
            const split = statement.split(".");
            let result = this._vars;
            for(let part of split){
                result = this.getProps(result, part);
                if(result === null) return result;
            }
            return result;
        }
        if(typeof statement != 'object') return this.read(statement, options);
        const type = Object.keys(statement)[0];
        if(type === "object"){
            return JSON.parse(JSON.stringify(statement[type]));
        }
        if(type === "calc"){
            let result = 0;
            let operation = null;
            for(let value of statement[type]){
                if(/[*+!/%><=-](=)?/.test(value) || ["&&", "||"].indexOf(value) >= 0){
                    operation = value;
                }
                else if (operation != null){
                    result = this.doOperation(operation, result, this.getValue(value, options));
                }
                else result = this.getValue(value, options);
            }
            return result;
        }
        return this.read(statement, options);
    }
    //@new
    createVar(name, value){
        const split = name.split(".");
        let object = this._vars;
        for(let i = 0; i < split.length - 1; i++){
            if(!(split[i] in object)){
                object[split[i]] = {};
            }
            object = object[split[i]];
        }
        const val = this.getValue(value, ['var']);
        if(name == "geo.xy"){
            console.log("GEO>>>", {
                width: this._vars.dim.width,
                left: this._vars.dim.actualBoundingBoxLeft,
                right: this._vars.dim.actualBoundingBoxRight,
                lineHeight: this._vars.lineHeight,
                canvas: this._vars.canvas.width
            }, value, val);
        }
        object[split[split.length-1]] = val;
    }
    //@new
    createVars(statement){
        for(let name in statement){
            this.createVar(name, statement[name])
        }
    }
}