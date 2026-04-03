const Filter = require('../utils/Filter');

class CommonServe{
    constructor(query, response) {
        this.query = query;
        this.response = response;
        this.found = false;
    }

    serve(paramslist = [], execution, elseArgs = []){
        if(Filter.contains(this.query, paramslist)){
            this.found = true;
            (async()=>{
                this.response.json(await execution.apply(null, [this.query, ...elseArgs]));
            })();
        }
        return this;
    }

    notFound(){
        if(!this.found){
            this.response.status(400);
            this.response.send("No ressource found");
        }
    }
}

module.exports = CommonServe;