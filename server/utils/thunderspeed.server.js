/**
 *@name : ThunderSpeed
 *@author: Superga
 *@description: light php class for fast and asynchronous file upload treatment
 */
const fs = require("fs");
const {promisify} = require('util');
const {
    isset,empty,time,is_array,buffer_base64,is_file,rename,unlink
} = require('./procedures');



class ThunderSpeed{
    static baseDir = './';
    static uploadDir = './';

    constructor(){
        this._POST = [];
        this.resumable = false;
        this.post = [];
        this.file = null;
        this.done = false;
        this.name = null;
        this.filename = null;
        this.timestamp = 0;
        this.chunkIndex = "ths_filepart";
        this.ok = false;
        this.init();
    }

    init(){
        let list = [this.chunkIndex, "ths_filepartid", "ths_fileextension", "ths_filesector"];
        this.post = [];
        let r = true,index;
        for(let i in list){
            index = list[i];
            if(isset(this._POST[index]) && !empty(this._POST[index])){
                this.post[index] = this._POST[index];
            }
            else{
                r = false;
                break;
            }
        }
        if(isset(this._POST["ths_fileuploaddone"])){
            this.post["ths_fileuploaddone"] = this._POST["ths_fileuploaddone"];
        }
        else{
            r = false;
        }
        return r;
    }

    isExpired(timestamp){
        const currentTimestamp = new Date().getTime();
        timestamp *= 1;
        return this.resumable ? false : currentTimestamp - timestamp > 60 * 5;
    }

    // async convert(){
    //     let _new = await fs.readFile(this.name+'.bak', {flag: 'ab'});
    //     file_put_contents($this->name.'.bak', base64_decode(file_get_contents($this->name)), FILE_BINARY);
    //     opendir(self::$baseDir);
    //     unlink($this->name);
    //     closedir();
    //     rename($this->name.'.bak', $this->name);
    // }

    async finish(){
        if(this.post['ths_fileuploaddone'] == true){
            let k = 0,name;
            do{
                this.filename = this.timestamp+(k == 0 ? "" : "("+k+")")+"."+this.post['ths_fileextension'];
                name = ThunderSpeed.uploadDir+this.filename;
                k++;
            }while(await is_file(name));
            await rename(this.name, name);
            this.done = true;
        }
    }

    async upload(){
        let file = null,
            r = {
                error : false,
                uploaded : true,
                message : '',
                filename : null
            };
        ThunderSpeed.baseDir = this.conformToDir(ThunderSpeed.baseDir);
        ThunderSpeed.uploadDir = this.conformToDir(ThunderSpeed.uploadDir);
        try {
            let list = await promisify(fs.readdir)(ThunderSpeed.baseDir);
            let timestamp = 0,
                sector = 0,
                name  = "", _file = null,
                exist = true;
            for(var i in list){
                _file = list[i];
                if(await is_file(ThunderSpeed.baseDir+_file)) {
                    name = _file.replace(/\.(.+?)$/, "").split("%");
                    if(this.isExpired(parseInt(name[0]))){
                        await unlink(ThunderSpeed.baseDir+_file);
                    }
                    if(name[1] === this.post['ths_filepartid']){
                        timestamp = name[0];
                        file = _file;
                        sector = name[2];
                        break;
                    }
                }
            }
            if(file == null){
                timestamp = new Date().getTime();
                exist = false;
            }
            else{
                if(this.isExpired(timestamp)){
                    r['uploaded'] = false;
                    r['message'] = 'expired session';
                    return r;
                }
            }
            name = ThunderSpeed.baseDir+timestamp+"%"+this.post['ths_filepartid']+'%'+(sector === 0 ? this.post['ths_filesector'] : sector )+'.thsfilepart';
            this.file = file;
            this.name = name;
            this.timestamp = timestamp;


            if(file != null && parseInt(this.post['ths_filesector']) <= parseInt(sector)){
                this.name = ThunderSpeed.$baseDir+timestamp+"%"+this.post['ths_filepartid']+'%'+sector+'.thsfilepart';
                this.finish();
                r['filename'] = this.filename;
                return r;
            }

            if(exist){
                timestamp = time();
                await rename(name, ThunderSpeed.baseDir+timestamp+"%"+this.post['ths_filepartid']+"%"+this.post['ths_filesector']+'.thsfilepart');
                name = ThunderSpeed.baseDir+timestamp+"%"+this.post['ths_filepartid']+"%"+this.post['ths_filesector']+'.thsfilepart';
            }
            this.file = null;
            this.name = name;
            this.timestamp = timestamp;
            let buffer = [];
            if(exist) {
                const tmp = await promisify(fs.readFile)(name);
                buffer.push(tmp);
            }
            buffer.push(buffer_base64(this.post[this.chunkIndex]));
            await promisify(fs.writeFile)(name, Buffer.concat(buffer).toString('binary'), 'binary');
            await this.finish();
            r['filename'] = this.filename;
            return r;
        }catch(e){
            r.error = true;
            r.message = 'An error occured during the operation !';
            return r;
        }
    }

    isDone(){
        return this.done;
    }

    setResumable(resumable){
        this.resumable = resumable;
    }

    isResumable(){
        return this.resumable;
    }

    getFileName(){
        return this.filename;
    }

    watch(chunkIndex){
        chunkIndex = is_array(chunkIndex) ? chunkIndex : [chunkIndex];
        let index, current = this;
        return function(request, response, next){
            current._POST = request.body;
            current.done = false;
            (async ()=>{
                for(let i in chunkIndex) {
                    index = chunkIndex[i];
                    current.chunkIndex = index;
                    if(current.init() && !current.done) {
                        let result = await current.upload();
                        response.json(result);
                        return;
                    }
                }
                next();
            })();
        }
    }

    conformToDir(val){
        if(!/\/$/.test(val)){
            val += "/";
        }
        return val;
    }

    // then(?callable $e){
    //     if($this->done){
    //         $e($this);
    //     }
    //     return $this;
    // }

    async move(uploadedFileName, targetDir, targetFileName = null){
        if(uploadedFileName == null) return;
        targetDir = this.conformToDir(targetDir);
        ThunderSpeed.uploadDir = this.conformToDir(ThunderSpeed.uploadDir);
        if(await is_file(ThunderSpeed.uploadDir+uploadedFileName)){
            await rename(ThunderSpeed.uploadDir+uploadedFileName, targetDir+(targetFileName == null ? uploadedFileName : targetFileName));
        }
    }

    async flush(uploadedFileName){
        if(uploadedFileName == null) return;
        ThunderSpeed.uploadDir = this.conformToDir(ThunderSpeed.uploadDir);
        let r = false;
        if(await is_file(ThunderSpeed.uploadDir+uploadedFileName)) {
            await unlink(ThunderSpeed.uploadDir + uploadedFileName);
            r = true;
        }
        return r;
    }

    async isUploaded(filename = null){
        ThunderSpeed.uploadDir = this.conformToDir(ThunderSpeed.uploadDir);
        return  filename !== null && await is_file(ThunderSpeed.uploadDir + filename);
    }
}

module.exports = ThunderSpeed;