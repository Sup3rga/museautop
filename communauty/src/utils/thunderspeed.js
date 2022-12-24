/**
 *@name : ThunderSpeed
 *@author: Superga
 *@description: light javascript class for fast and asynchronous file upload
 */

var ThunderSpeed = function()   {
    //@Private :
    var files = [],
        currentFile = null,
        currentUpload = null,
        times = [0,0],
        uploadingFiles = [],
        acceptedType = [],
        ids = [],
        uploadedFile = [],
        multiple = false,
        uploading = false,
        paused = true,
        pauseTarget = null,
        loaded = 0,
        size = {},
        cursor = {},
        start = false,
        startMode = 0,
        params = {},
        url = '',
        $this = this,
        fileIndexName = 'ths_filepart',
        uploadedFileIndexName = 'ths_uploadedFiles',
        utils = {
            isnumeric: function(e){
                return /^[0-9]+$/.test(e);
            },
            foreach: function(e, fn){
                if(typeof fn != 'function') return;
                for(var i in e){
                    if(utils.isnumeric(i)){
                        fn(e[i], i);
                    }
                }
            },
            collapse: function(e){
                if(!Array.isArray(e)) return e;
                var r = [];
                for(var i in e){
                    r.push(e[i]);
                }
                return r;
            },
            xhr: function(){
              return new XMLHttpRequest();
            },
            debit: function(e){
                var r = e+' B';
                if(e / 1024 >= 1){
                    r = Math.round(e * 100 / 1024) / 100 + ' KB';
                    if(e / 1024000 >= 1){
                        r = (Math.round(e * 100 / 1024000) / 100) + ' MB';
                        if(e / 1024000000 >= 1){
                            r = (Math.round(e * 100 / 1024000000) / 100) + ' GB';
                        }
                    }
                }
                return r;
            },
            read: function(file){
                return new Promise(function(r,j){
                    var fr = new FileReader();
                    fr.onload = function(){
                        r(fr.result);
                    }
                    fr.readAsDataURL(file);
                });
            },
            remove: function(e,a){
                for(var i in e){
                    if(e[i] == a){
                        delete e[i];
                    }
                }
                return utils.collapse(e);
            },
            indexOf: function(val,searchFor){
                var r = null,
                    searchFor = searchFor == undefined ? false : searchFor;
                if(this.isnumeric(val) && !searchFor){
                    return parseInt(val);
                }
                utils.foreach(files, function(file, k){
                    if((file.id == val && !/\.(.+?)$/.test(val)) ||
                        (file.name == val && /\.(.+?)$/.test(val)) ||
                        (utils.isnumeric(val) && k == val)
                    ){
                        r = searchFor ? file.id : k;
                    }
                })
                return r;
            },
            arg: function(arg){
                var form = new FormData();
                for(var i in arg){
                    form.append(i, arg[i]);
                }
                return form;
            },
            getId: function(){
                var id, abc = ['a','b','c','d','e','f'], r = '', k;
                do{
                    id = (1000000000 + 1000000) * Math.random() - 1000000;
                    id = Math.floor(id)+'';
                    for(var i in id){
                        k = Math.floor(abc.length * Math.random());
                        r += k >= 0 && k < abc.length ? abc[k]+id[i][Math.floor(2 * Math.random()) != 0 ? 'toUpperCase' : 'toLowerCase']() : id[i];
                    }
                }while(ids.indexOf(id) >= 0);
                ids.push(id);
                return r;
            },
            isjson: function (m, str) {
                str = str == undefined ? false : str != 0 && str != false;
                if (typeof m == 'object') {
                    try {
                        JSON.stringify(m);
                        return true;
                    } catch (err) {
                        return false;
                    }
                }

                if (typeof m == 'string' && str) {
                    try {
                        m = JSON.parse(m);
                    } catch (err) {
                        return false;
                    }
                }

                if (typeof m != 'object') {
                    return false;
                }
                return true;
            },
            extend: function(e,a){
                for(var i in a){
                    e[i] = a[i];
                }
                return e;
            },
            dispatchEvent: function(ev,arg){
                utils.foreach(events[ev], function(obj, i){
                    obj.callback.apply($this,[arg]);
                    if(!obj.persistent){
                        delete events[ev][i];
                    }
                });
                events[ev] = utils.collapse(events[ev]);
            },
            iteration : {},
            upload: function(file){
                return new Promise(function(r,j){
                    cursor[file.id] = 0;
                    size[file.id] = 5000;
                    utils.iteration[file.id] = function(){
                        var ext = {}, time = [0,0];
                        ext.ths_fileextension = file.name.replace(/^[\s\S]+\.(.+?)$/, '$1');
                        ext.ths_filepartid = file.id;
                        // chunk = currentUpload.substr(cursor, cursor + size);
                        if(paused && file.id == pauseTarget){
                            return;
                        }
                        utils.read(file.slice(cursor[file.id],cursor[file.id] + size[file.id])).then(function(chunk){
                            cursor[file.id] = cursor[file.id] + size[file.id];
                            ext.ths_filesector = cursor[file.id];
                            cursor[file.id] = cursor[file.id] >= file.size ? file.size : cursor[file.id];
                            ext.ths_fileuploaddone = cursor[file.id] >= file.size;
                            ext[fileIndexName] = chunk.replace(/^data:(.+?),/, '');
                            var xhr = utils.xhr();
                            xhr.open('POST', url);
                            xhr.setRequestHeader('Content-Type', 'application/json');
                            xhr.setRequestHeader('charset','utf-8   ');
                            times[0] = new Date().getTime();
                            utils.dispatchEvent('progress', {
                                rate: utils.debit(size[file.id])+'/s',
                                file: {
                                    name: file.name,
                                    size: utils.debit(file.size),
                                    rawsize: file.size,
                                    id: file.id
                                },
                                progression: cursor[file.id] / file.size,
                                instance: $this,
                                percent: Math.round(cursor[file.id] / file.size * 10000) / 100,
                                loaded: utils.debit(file.size * (cursor[file.id] / file.size))
                            });
                            xhr.onreadystatechange = function () {
                                if (xhr.readyState == 4 && xhr.status == 200) {
                                    var response = xhr.responseText;
                                    if(utils.isjson(response,true)){
                                        response = JSON.parse(response);
                                        times[1] = new Date().getTime();
                                        if(response.error || !response.uploaded){
                                            j(response.message);
                                        }else{
                                            if(response.filename != null) {
                                                uploadedFile.push(response.filename);
                                            }
                                            if(ext.ths_fileuploaddone){
                                                r();
                                            }
                                            else{
                                                size[file.id] = Math.floor(size[file.id] / ((times[1] - times[0]) / 1000));
                                                size[file.id] = utils.isnumeric(size[file.id]) ? size[file.id] : 100000;
                                                if(!ext.ths_fileuploaddone){
                                                    utils.iteration[file.id]();
                                                }
                                            }
                                        }
                                    }
                                    else{
                                        j("Error :: "+response);
                                    }
                                }
                            }
                            xhr.send(JSON.stringify(ext));
                        });
                    }
                    utils.iteration[file.id]();
                });
            },
            wait : function(list){
                return new Promise(function(r,j){
                    if(!list.length){
                        r();
                        return;
                    }
                    function iter(){
                        uploadingFiles.push(list[0].id);
                        utils.upload(list[0]).then(function(){
                            list.shift();
                            if(list.length == 0){
                                r();
                            }
                            else{
                                iter();
                            }
                        })
                    }
                    iter();
                });
            }
        },
        events = {
            choose: [],
            progress: [],
            upload: [],
            terminate: [],
            start: [],
            stop: []
        };
    //@public :
    this.speed = 0;

    this.filterType = function(e){
        if(Array.isArray(e)){
            acceptedType = e;
        }
        else if(typeof e == 'string'){
            acceptedType = e.split(/ *, */);
        }
        return this;
    }

    this.remove = function(indexOrName){
        if(utils.isnumeric(indexOrName)){
            delete files[indexOrName];
            files = utils.collapse(files);
        }
        else{
            utils.foreach(files, function(file,i){
                if((file.name == indexOrName && /\.(.+?)$/.test(indexOrName)) || (file.id == indexOrName && !/\.(.+?)$/.test(indexOrName))){
                    delete files[i];
                }
            });
            files = utils.collapse(files);
        }
        return this;
    }

    this.clear = function(){
        files = [];
        times = [0,0];
        acceptedType = [];
        uploadingFiles = [];
        uploadedFile = [];
        ids = [];
        cursor = {};
        loaded = 0;
        size = {};
        fileIndexName = 'ths_filepart';
        return this;
    }

    this.watch = function(domFileInput){
        this.clear();
        var contains = 0,
            $this = this;
        try{
            contains = document.contains(domFileInput);
        }catch(e){}
        if(contains == true || (contains == 0 && typeof domFileInput == 'string')) {
            domFileInput = contains ? [domFileInput] : document.querySelectorAll(domFileInput);
            if (domFileInput != null) {
                utils.foreach(domFileInput, function(input, k){
                    input.addEventListener('change', function () {
                        if(!multiple) {
                            utils.foreach(files, function (file, i) {
                                if(k == file.source){
                                    delete files[i];
                                }
                            });
                            files = utils.collapse(files);
                        }
                        utils.foreach(this.files, function(file){
                            file.source = k;
                            file.id = utils.getId();
                            files.push(file);
                        });
                        this.value = '';
                        utils.dispatchEvent('choose', $this);
                    }, true);
                })
            }
        }
        return this;
    }

    this.files = function(){
        var r = [];
        utils.foreach(files, function(file){
            r.push({
                name: file.name,
                size: utils.debit(file.size),
                rawsize: file.size,
                id: file.id,
                getDataURL: function(){
                    return utils.read(file);
                }
            });
        });
        return r;
    }

    this.setFile = function(file){
        if(!file) return this;
        file.id = utils.getId();
        files.push(file);
        return this;
    }

    this.on = function(ev, callback){
        ev = (ev+"").toLowerCase();
        if(ev in events){
            events[ev].push({
                callback: callback,
                persistent: true
            });
        }
        return this;
    }

    this.setMultiple = function(_multiple){
        multiple = typeof _multiple == 'boolean' ? _multiple : _multiple != 0;
        return this;
    }

    this.setStartMode = function(mode){
        startMode = 0;
        if(/all/i.test(mode)){
            startMode = 1;
        }
    }

    this.setFileIndexName = function(name){
        fileIndexName = name;
    }

    this.setUploadedFileIndexName = function(name){
        uploadedFileIndexName = name;
    }

    this.params = function(e){
        if(utils.isjson(e)){
           params = e;
           if('url' in params){
               url = params.url;
               delete params.url;
           }
           if('fileIndexName' in params){
               fileIndexName = params.fileIndexName;
               delete  params.fileIndexName;
           }
           if('uploadedFileIndexName' in params){
                uploadedFileIndexName = params.uploadedFileIndexName;
                delete  params.uploadedFileIndexName;
           }
        }
        return this;
    }

    this.once = function(ev, callback){
        ev = (ev+"").toLowerCase();
        if(ev in events){
            events[ev].push({
                callback: callback,
                persistent: false
            });
        }
        return this;
    }

    this.start = function(index){
        index = utils.indexOf(index);
        if(( start && startMode == 0 ) || (startMode == 1 && start && !utils.isnumeric(index))) return;
        var list = [],
            paused = false,
            uploading = true;
        if(utils.isnumeric(index)){
            if(index < files.length && uploadingFiles.indexOf(files[index].id) < 0){
                list.push(files[index]);
            }
        }
        else{
            list = files;
        }
        return new Promise(function(r,j){
            utils.dispatchEvent('start', $this);
            utils.wait(list).then(function(){
                var xhr = utils.xhr();
                xhr.open('POST', url);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.setRequestHeader('charset','utf-8   ');
                xhr.onreadystatechange = function(){
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        uploading = false;
                        var response = xhr.responseText;
                        utils.dispatchEvent('terminate', $this);
                        if(utils.isjson(response,true)){
                            response = JSON.parse(response);
                            if(response.error){
                                j(response.message);
                            }
                            else{
                                r(response);
                            }
                        }
                        else{
                            j(response);
                        }
                    }
                }
                var uplFiles = {};
                uplFiles[uploadedFileIndexName] = uploadedFile;
                xhr.send(JSON.stringify(utils.extend(uplFiles ,params)));
                $this.clear();
            })
        });
    }

    this.resume = function(index){
        pauseTarget = utils.indexOf(index, true);
        paused = false;
        if(files.length) {
            if(uploading && uploadingFiles.indexOf(pauseTarget) >= 0){
                if(pauseTarget != null) {
                    utils.iteration[pauseTarget]();
                }
                else{
                    for(var i in utils.iteration){
                        utils.iteration[i]();
                    }
                }
            }
            else{
                this.start(pauseTarget);
            }
        }
        return files.length > 0;
    }

    this.pause = function(index){
        pauseTarget = utils.indexOf(index, true);
        paused = true;
    }
}

if(typeof module == 'object' && typeof module.exports != 'undefined'){
    module.exports = ThunderSpeed;
}