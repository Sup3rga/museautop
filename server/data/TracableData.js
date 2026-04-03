const Data = require('./Data')

class TracableData extends Data{
    constructor() {
        super();
        this.modifiedAt = null;
        this.modifiedBy = 0;
        this.branch = null;
    }
}

module.exports = TracableData;