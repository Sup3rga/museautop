const fs = require("fs");
const {promisify} = require('util')

function isset(val){
    return val != undefined;
}

function set(val,defaultValue){
    return isset(val) ? val : defaultValue;
}

function empty(val){
    return val === '' || val == null;
}

function computeToHexa(value){
    if(isNaN(value)){
        return 0;
    }
    let result = value, buffer = '', cpu;
    const base = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
    if(base[value]){
        return base[value];
    }
    else{
        do{
            cpu = result % 16;
            buffer = (cpu in base ? base[cpu] : cpu)+buffer;
            result = Math.floor(result / 16);
            if(result < 16){
                buffer = (result in base ? base[result] : result)+buffer;
            }
        }while(result >= 16);
    }
    return buffer;
}

function toHexa(value,sequence=2){
    let result = '', next = 0;
    value = value.toString();
    for(let i = 0; i < value.length - sequence; i += sequence){
        next = (i + sequence) >= value.length - sequence ? value.length - 1 : i + sequence;
        result += computeToHexa(value.substr(i,2) * 1);
    }
    return result;
}

function time(){
    return new Date().getTime();
}

function is_array(val){
    return Array.isArray(val);
}

function filter(list, val){
    const _list = [];
    for(let i in list){
        if(list[i] != val){
            _list.push(list[i]);
        }
    }
    return _list;
}

function base64_decode(base64){
    return buffer_base64(base64).toString('binary');
}

function buffer_base64(base64){
    return  Buffer.from(base64, 'base64');
}

async function is_file(filename){
    let exist = await promisify(fs.exists)(filename);
    if(exist){
        let status = await promisify(fs.stat)(filename);
        return status.isFile();
    }
    return false;
}

async function rename(filename, name){
    await promisify(fs.rename)(filename, name);
}

async function unlink(filename){
    if(await is_file(filename)){
        await promisify(fs.unlink)(filename);
    }
}

function in_array(list = [], element, ignoreCase = false){
    if(!ignoreCase){
        return list.indexOf(element) >= 0;
    }
    for(let i in list){
        if(list[i].toString().toLowerCase() === element.toString().toLowerCase()){
            return true;
        }
    }
    return false;
}

module.exports = {
    isset,empty,time,is_array,base64_decode,
    is_file,rename,unlink,buffer_base64,
    filter,in_array,toHexa,set
};