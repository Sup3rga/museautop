const {Parser} = require("node-sql-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const dev = process.NODE_ENV != "production";
const genericSchema = new mongoose.Schema({}, { strict: false });

const parser = new Parser();
class MongoSql{
    static initialized = false;
    static dbName = "";
    static host = "";

    static async init(){
        return new Promise((res, rej)=>{
            // console.log('[Initialized]', MongoSql.initialized, MongoSql.initialized ? 'connecting...' : 'ready !');
            // console.log('[DBNAME]', MongoSql.dbName, MongoSql.host, dev);
            if(!MongoSql.initialized){
                mongoose.connect(`mongodb://${dev ? '127.0.0.1:27017' : MongoSql.host}/${MongoSql.dbName}`, {
                    retryWrites: true,
                    enableUtf8Validation: true,
                })
                .then((result)=> {
                    MongoSql.initialized = true;
                    // console.log('[Result]',result);
                    res();
                })
                .catch(err => {
                    console.log('[Database error]', err)
                    rej(err);
                });
            }
            else{
                res();
            }
        })
    }
    static getModel(tableName, strict = true) {
        if (mongoose.modelNames().includes(tableName)) {
            // console.log('[Inclusion]',tableName);
            return mongoose.model(tableName);
        }
        // console.log('[Exclusion]',tableName);
        if(strict) return mongoose.model(tableName, genericSchema);
        return mongoose.connection.collection(tableName);
    }

    static resolveValue(node) {
        // Valeur simple (string, number, bool)
        if (['string', 'number', 'bool', 'single_quote_string'].includes(node.type)) {
            return node.value;
        }

        // Appel de fonction
        if (node.type === 'function') {
            const fnName = node.name.name[0].value.toUpperCase();
            const args = node.args.value.map(MongoSql.resolveValue);

            switch (fnName) {
                case 'SHA1':
                    return crypto.createHash('sha1').update(String(args[0])).digest('hex');
                case 'SHA256':
                    return crypto.createHash('sha256').update(String(args[0])).digest('hex');
                case 'MD5':
                    return crypto.createHash('md5').update(String(args[0])).digest('hex');
                case 'NOW':
                case 'SYSDATE':
                    return new Date();
                case 'CURDATE':
                    return new Date(new Date().toDateString());
                case 'CURTIME':
                    return new Date().toTimeString().split(' ')[0];
                default:
                    throw new Error(`Fonction SQL non supportée : ${fnName}`);
            }
        }

        return node.value;
    }

    static buildFilter(where) {
        if (!where) return {};

        if (where.type === 'binary_expr') {
            const { left, operator, right } = where;

            if (operator === 'AND') {
                return { $and: [MongoSql.buildFilter(left), MongoSql.buildFilter(right)] };
            }
            if (operator === 'OR') {
                return { $or: [MongoSql.buildFilter(left), MongoSql.buildFilter(right)] };
            }

            const field = left.column;
            const value = MongoSql.resolveValue(right);

            const opMap = {
                '=':  { [field]: value },
                '!=': { [field]: { $ne: value } },
                '>':  { [field]: { $gt: value } },
                '<':  { [field]: { $lt: value } },
                '>=': { [field]: { $gte: value } },
                '<=': { [field]: { $lte: value } },
            };

            return opMap[operator] ?? {};
        }

        return {};
    }
    async exec(sql){
        await MongoSql.init();
        const parse = parser.astify(sql);
        // console.log('[Parse]', parse);
        switch (parse.type) {
            case 'select': return await this.handleSelect(parse);
            case 'insert': return await this.handleInsert(parse);
            case 'update': return await this.handleUpdate(parse);
            case 'delete': return await this.handleDelete(parse);
            case 'create': return await this.createSchema(parse);
            default:  throw new Error(`Type non supporté : ${parse.type}`);
        }
    }

    async close(){
        return;
    }
    mapType(sqlType, col) {
        const notNull = col.nullable?.value === 'not null';
        const defaultVal = col.default_val?.value?.value;
        const isUnique = col.unique_or_primary === 'unique' || col.unique === 'unique';

        const base = {
            required: notNull,
            unique: isUnique,
            ...(defaultVal !== undefined && { default: defaultVal }),
        };

        if (['VARCHAR', 'TEXT', 'CHAR', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT'].includes(sqlType)) {
            return { ...base, type: String };
        }
        if (['INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT'].includes(sqlType)) {
            return { ...base, type: Number };
        }
        if (['FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC'].includes(sqlType)) {
            return { ...base, type: Number };
        }
        if (['BOOLEAN', 'BOOL'].includes(sqlType)) {
            return { ...base, type: Boolean };
        }
        if (['DATE', 'DATETIME', 'TIMESTAMP'].includes(sqlType)) {
            return { ...base, type: Date };
        }
        if (['JSON'].includes(sqlType)) {
            return { ...base, type: mongoose.Schema.Types.Mixed };
        }
        // Type inconnu → Mixed par défaut
        return { ...base, type: mongoose.Schema.Types.Mixed };
    }

    async createSchema(ast){
        const tableName = ast.table[0].table;

        const schemaDef = {};

        for (const col of ast.create_definitions) {
            // Ignorer les contraintes (PRIMARY KEY, INDEX, etc.)
            if (col.resource !== 'column') continue;

            const colName = col.column.column;
            const colType = col.definition.dataType.toUpperCase();

            schemaDef[colName] = this.mapType(colType, col);
        }

        mongoose.model(tableName, genericSchema);
        return { tableName, schema: new mongoose.Schema(schemaDef) };
    }

    async _handleSelect(ast) {
        // Construire un map alias → collection
        // ex: { c: 'communauty', b: 'branch' }
        const aliasMap = {};
        for (const table of ast.from) {
            aliasMap[table.as || table.table] = table.table;
        }

        // Séparer les conditions de jointure des filtres normaux
        const { joins, filters } = splitConditions(ast.where, aliasMap);

        // Table principale = première dans le FROM
        const mainAlias = ast.from[0].as || ast.from[0].table;
        const mainCollection = aliasMap[mainAlias];
        const col = mongoose.connection.collection(mainCollection);

        // Construire le pipeline d'agrégation
        const pipeline = [];

        // 1. Filtrer sur la collection principale
        const mainFilter = buildFilter(filters, mainAlias);
        if (Object.keys(mainFilter).length > 0) {
            pipeline.push({ $match: mainFilter });
        }

        // 2. Ajouter les $lookup pour chaque jointure
        for (const join of joins) {
            const localAlias = join.leftTable;
            const foreignAlias = join.rightTable;
            const foreignCollection = aliasMap[foreignAlias];

            pipeline.push({
                $lookup: {
                    from: foreignCollection,
                    localField: join.leftField,
                    foreignField: join.rightField,
                    as: foreignAlias,
                }
            });

            // Déplie le tableau résultant (relation 1-1)
            pipeline.push({ $unwind: `$${foreignAlias}` });

            // Appliquer les filtres sur la collection jointe
            const foreignFilter = buildFilter(filters, foreignAlias);
            if (Object.keys(foreignFilter).length > 0) {
                const prefixedFilter = {};
                for (const [key, val] of Object.entries(foreignFilter)) {
                    prefixedFilter[`${foreignAlias}.${key}`] = val;
                }
                pipeline.push({ $match: prefixedFilter });
            }
        }

        // 3. Projeter les colonnes demandées
        if (ast.columns !== '*') {
            const project = {};
            for (const col of ast.columns) {
                const { table: colAlias, column } = col.expr;
                if (colAlias === mainAlias) {
                    project[column] = `$${column}`;
                } else {
                    project[column] = `$${colAlias}.${column}`;
                }
            }
            project['_id'] = 0;
            pipeline.push({ $project: project });
        }

        // 4. DISTINCT → $group sur tous les champs projetés
        if (ast.distinct === 'DISTINCT') {
            const groupId = {};
            for (const col of ast.columns) {
                groupId[col.expr.column] = `$${col.expr.column}`;
            }
            pipeline.push({ $group: { _id: groupId } });
            pipeline.push({ $replaceRoot: { newRoot: '$_id' } });
        }

        return await col.aggregate(pipeline).toArray();
    }

    async handleSelect(ast) {
        const modelName = ast.from[0].table;
        const Model = MongoSql.getModel(modelName);

        const filter = MongoSql.buildFilter(ast.where);
        return await Model.find(filter);
    }

    async handleInsert(ast) {
        const modelName = ast.table[0].table;
        const Model = MongoSql.getModel(modelName);

        const columns = ast.columns;
        const values = ast.values.values[0].value.map(v => MongoSql.resolveValue(v));

        const doc = {};
        columns.forEach((col, i) => doc[col] = values[i]);

        return await Model.create(doc);
    }

    async handleUpdate(ast) {
        const modelName = ast.table[0].table;
        const Model = MongoSql.getModel(modelName);

        const updates = {};
        ast.set.forEach(({ column, value }) => {
            updates[column] = MongoSql.resolveValue(value);
        });

        const filter = MongoSql.buildFilter(ast.where);
        return await Model.updateMany(filter, { $set: updates });
    }

    async handleDelete(ast) {
        const modelName = ast.from[0].table;
        const Model = MongoSql.getModel(modelName);

        const filter = MongoSql.buildFilter(ast.where);
        return await Model.deleteMany(filter);
    }
}

module.exports = MongoSql;