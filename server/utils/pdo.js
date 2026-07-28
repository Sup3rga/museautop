const promisify = require('util').promisify;

class PDOResult{

    constructor(results) {
        this.results = results;
        this.cursor = 0;
        this.rowCount = results.length;
    }

    fetch() {
        let r = this.cursor < this.rowCount ? this.results[0] : null;
        this.results.shift();
        this.cursor++;
        return r;
    }

    fetchAll() {
        let r = [];
        for (this.cursor = 0; this.cursor < this.results.length; this.cursor++) {
            r.push(this.results[this.cursor]);
        }
        return r;
    }

    closeCursor(){

    }
}

class PDOExecute{
    constructor(sqlString, pdo) {
        this.pdo = pdo;
        this.sqlString = sqlString; // ✅ local à cette exécution
        this.results = [];
        this.cursor = 0;
        this.rowCount = 0;
    }
    async execute(arg = []) {
        let finalSql = '',
            _ignore = [],
            _var = '',
            _count = {
                simple_quote: 0,
                quote: 0,
                ask: 0
            };
        for (let i in this.sqlString) {
            if (this.sqlString[i] === '"' && _count.simple_quote === 0) {
                _count.quote = (_count.quote + 1) % 2;
            }
            if (this.sqlString[i] === "'" && _count.quote === 0) {
                _count.simple_quote = (_count.simple_quote + 1) % 2;
            }
            if (_var.length) {
                if (/[a-z0-9_]/i.test(this.sqlString[i]) && i * 1 < this.sqlString.length - 1) {
                    _var += this.sqlString[i];
                } else {
                    if (i * 1 === this.sqlString.length - 1 && /[a-z0-9_]/i.test(this.sqlString[i])) {
                        _var += this.sqlString[i];
                    }
                    _var = _var.replace(/^:/, '');
                    if (!(_var in arg)) {
                        throw new Error("arguments [ " + _var + " ] is not given !");
                    }
                    finalSql += /^[\d]+$/.test(arg[_var]) ? parseFloat(arg[_var]) : [undefined, null].indexOf(arg[_var]) >= 0 ? 'NULL' : "'" + (arg[_var].toString().replace(/'/g, "\\'")) + "'";
                    _ignore.push(_var);
                    _var = '';
                }
                if (i * 1 === this.sqlString.length - 1 && /[a-z0-9_]/i.test(this.sqlString[i])) {
                    break;
                }
            }

            if (!_var.length && !/:|\?/.test(this.sqlString[i])) {
                finalSql += this.sqlString[i];
            }

            if (_count.quote === 0 && _count.simple_quote === 0) {
                if (this.sqlString[i] === ':') {
                    _var = this.sqlString[i];
                }
                if (this.sqlString[i] === "?") {
                    if (!(_count.ask in arg)) {
                        throw new Error("variable bounds do not match with given arguments !");
                    }
                    _ignore.push(_count.ask);
                    finalSql += /^[\d]+$/.test(arg[_count.ask]) ? parseFloat(arg[_count.ask]) : arg[_count.ask] === undefined ? 'NULL' : "'" + (arg[_count.ask].toString().replace(/'/g, "\\'")) + "'";
                    _count.ask++;
                }
            }
        }
        if(!this.pdo.connected && this.pdo.logError){
            // console.log("[DB ERROR]",{connected: this.pdo.connected, error: this.pdo.logError})
            throw new Error(this.pdo.logError);
        }
        if(this.pdo.driver == 'mysql'){
            let results = await (($this)=>{
                return new Promise(async (res,rej)=>{
                    if(!$this.pdo.db){
                        await $this.pdo.retryConnection();
                    }
                    $this.pdo.db.query(finalSql, null, function (err, result){
                        if(err){
                            return rej(err);
                        }
                        // console.log('[pdo][Result]',result);
                        res(result);
                    });
                });
            })(this);
            return new PDOResult(results);
        }
        if(this.pdo.driver == 'sqlite'){
            let _run = /^([\s]*)?select/i.test(finalSql);
            let result = await promisify(this.pdo.db[_run ? 'each' : 'run'])(finalSql);
            return new PDOResult(result);
        }
    }
}
class PDO {
    constructor(options = {
        driver: null,
        host: '',
        user: '',
        password: '',
        database: ''
    }
    ) {
        let config = {
            driver: null,
            host: '',
            user: '',
            password: '',
            database: ''
        };
        for(let i in config){
            if(i in options){
                config[i] = options[i];
            }
        }
        this.dbname = typeof dbname == 'undefined' ? './library.db' : dbname;
        this.sqlString = '';
        this.driver = options.driver;
        this.connected = false;
        this._options = config;
        this.retryConnection();
        this.logError = null;
        this.results = {};
        this.queue = [];
        this.cursor = 0;
        this.rowCount = 0;
    }

    async retryConnection(){
        const $this = this;
        this.db;
        return new Promise((res)=>{
            if($this.db) {
                return res();
            }
            const timer = setInterval((e)=>{
                try{
                    $this.setDriver($this._options);
                    $this.connected = true;
                    if($this.db) {
                        clearInterval(timer);
                        res();
                    }
                }catch (e){
                    $this.logError = e;
                }
            }, 300);
        });
    }

    setDriver(options){
        let driverName = options.driver.toLowerCase();
        const _options = {...options};
        delete _options.driver;
        if(driverName == 'mysql'){
            // const mysql = require('mysql2');
            // _options.connectionLimit = 50;
            // _options.maxIdle = 30;
            // _options.idleTimeout = 30000;
            // _options.enableKeepAlive = true;
            // _options.keepAliveInitialDelay = 0;
            // this.db = mysql.createPool(_options);
        }
        else if(driverName == 'sqlite'){
            // console.log('[SQLITE]');
            // const sqlite = require('sqlite3').verbose();
            // this.db = new sqlite.Database(dbname);
        }
        else{
            throw new Error("undefined driver given !");
        }
    }

    prepare(string, _delegate = true) {
        this.sqlString = string;
        this.results = [];
        this.cursor = 0;
        this.rowCount = 0;
        return new PDOExecute(string, this);
    }

    async commit(){
        try {
            this.db.commit();
        }catch (e) {
           console.log('[Commit] err',e);
        }
    }

    close() {
        this.db.close();
        this.db = null;
    }
}

module.exports = PDO;
