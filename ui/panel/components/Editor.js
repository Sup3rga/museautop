import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function Editor({ data, onChange, onReady}) {
    return (
        <CKEditor
            editor={ClassicEditor}
            data={data}
            onReady={onReady}
            onChange={(event, editor) => {
                onChange(editor.getData());
            }}
        />
    );
}