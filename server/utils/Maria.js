const mysql = eval('require')('mysql2/promise');

class MariaExec{
    
    constructor(sql) {
        this.sql = sql;
        this.rows = [];
        this.rowCount = 0;
    }
    transformSql(arg = {}) {
        let finalSql = '',
            _ignore = [],
            _var = '',
            _count = {
                simple_quote: 0,
                quote: 0,
                ask: 0
            };
        for (let i in this.sql) {
            if (this.sql[i] === '"' && _count.simple_quote === 0) {
                _count.quote = (_count.quote + 1) % 2;
            }
            if (this.sql[i] === "'" && _count.quote === 0) {
                _count.simple_quote = (_count.simple_quote + 1) % 2;
            }
            if (_var.length) {
                if (/[a-z0-9_]/i.test(this.sql[i]) && i * 1 < this.sql.length - 1) {
                    _var += this.sql[i];
                } else {
                    if (i * 1 === this.sql.length - 1 && /[a-z0-9_]/i.test(this.sql[i])) {
                        _var += this.sql[i];
                    }
                    _var = _var.replace(/^:/, '');
                    if (!(_var in arg)) {
                        throw new Error("arguments [ " + _var + " ] is not given !");
                    }
                    finalSql += /^[\d]+$/.test(arg[_var]) ? parseFloat(arg[_var]) : [undefined, null].indexOf(arg[_var]) >= 0 ? 'NULL' : "'" + (arg[_var].toString().replace(/'/g, "\\'")) + "'";
                    _ignore.push(_var);
                    _var = '';
                }
                if (i * 1 === this.sql.length - 1 && /[a-z0-9_]/i.test(this.sql[i])) {
                    break;
                }
            }

            if (!_var.length && !/:|\?/.test(this.sql[i])) {
                finalSql += this.sql[i];
            }

            if (_count.quote === 0 && _count.simple_quote === 0) {
                if (this.sql[i] === ':') {
                    _var = this.sql[i];
                }
                if (this.sql[i] === "?") {
                    if (!(_count.ask in arg)) {
                        throw new Error("variable bounds do not match with given arguments !");
                    }
                    _ignore.push(_count.ask);
                    finalSql += /^[\d]+$/.test(arg[_count.ask]) ? parseFloat(arg[_count.ask]) : arg[_count.ask] === undefined ? 'NULL' : "'" + (arg[_count.ask].toString().replace(/'/g, "\\'")) + "'";
                    _count.ask++;
                }
            }
        }
        return finalSql;
    }

    fetch(){
        if(!Array.isArray(this.rows) || this.rows.length === 0) return null;
        const data = this.rows.shift();
        this.initCursor();
        return data;
    }
    initCursor(){
        if(Array.isArray(this.rows)){
            this.rowCount = this.rows.length;
        }
    }
    async execute(params = {}){
        if(!Maria.pool) throw new Error("Can't execute request on undefine pool !");
        const [rows] = await Maria.pool.query(this.transformSql(params));
        this.rows = rows;
        this.initCursor();
        return this;
    }
}
class Maria{
    static pool = null;
    constructor(options = {}) {
        let required = ['user', 'host', 'database', 'password'];
        for(let field of required){
            if(!(field in options)){
                throw new Error(`\`${field}\` is required !`);
            }
        }
        if(!Maria.pool){
            Maria.pool = mysql.createPool({
                connectionLimit : 50,
                maxIdle : 30,
                idleTimeout : 30000,
                enableKeepAlive : true,
                keepAliveInitialDelay : 0,
                ...options
            });
        }
    }
    prepare(sql){
        return new MariaExec(sql);
    }
}

module.exports = Maria;