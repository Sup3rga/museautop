import ThunderSpeed from './thunderspeed';
import Ressources from "./Ressources";

export default class UploadAdapter {
    constructor( loader, fileIndex = 'img') {
        // CKEditor 5's FileLoader instance.
        this.loader = loader;
        this.__imgset = null;
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
                        default: e.filename
                    });
                });
            })
        } );
    }

    // Aborts the upload process.
    abort() {
        if ( this.xhr ) {
            this.xhr.abort();
        }
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners( resolve, reject ) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = 'Couldn\'t upload file:' + ` ${ loader.file.name }.`;

        xhr.addEventListener( 'error', () => reject( genericErrorText ) );
        xhr.addEventListener( 'abort', () => reject() );
        xhr.addEventListener( 'load', () => {
            const response = xhr.response;

            if ( !response || response.error ) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }

            // If the upload is successful, resolve the upload promise with an object containing
            // at least the "default" URL, pointing to the image on the server.
            resolve( {
                default: response.url
            } );
        } );

        if ( xhr.upload ) {
            xhr.upload.addEventListener( 'progress', evt => {
                if ( evt.lengthComputable ) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            } );
        }
    }

    // Prepares the data and sends the request.
    _sendRequest() {
        const data = new FormData();

        data.append( 'upload', this.loader.file );

        this.xhr.send( data );
    }
}