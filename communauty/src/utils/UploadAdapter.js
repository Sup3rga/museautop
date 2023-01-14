import ThunderSpeed from './thunderspeed';
import Ressources from "./Ressources";

export default class UploadAdapter {
    constructor( loader, fileIndex = 'img', prefix = '') {
        // CKEditor 5's FileLoader instance.
        this.loader = loader;
        this.__imgset = null;
        this.prefix = prefix;
        this.uploader = new ThunderSpeed();
        this.uploader.params({
            url: Ressources.apis+'/upl_img',
            fileIndexName: fileIndex,
            uploadedFileIndexName: 'upl_'+fileIndex
        });
    }

    onImageSet(callback = null){
        this.__imgset = callback;
    }

    // Starts the upload process.
    upload() {
        const $this = this;
        return new Promise( ( resolve, reject ) => {
            // this._initRequest();
            // this._initListeners( resolve, reject );
            // this._sendRequest();
            $this.loader.file.then((file)=>{
                $this.uploader.setFile(file)
                .on('progress', (e)=>{
                    $this.loader.uploadTotal = e.file.rawsize;
                    $this.loader.uploaded = e.file.rawsize * e.progression;
                })
                .start()
                .then(function(e){
                    if($this.__imgset){
                        $this.__imgset(e.filename);
                    }
                    resolve({
                        default: $this.prefix+e.filename
                    });
                });
            })
        } );
    }
}