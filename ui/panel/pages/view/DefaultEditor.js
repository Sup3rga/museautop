/**
 * @license Copyright (c) 2014-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
// import {Alignment} from '@ckeditor/ckeditor5-alignment/build/alignment';
import {Autoformat} from '@ckeditor/ckeditor5-autoformat/build/autoformat';
import {BlockQuote} from '@ckeditor/ckeditor5-block-quote/build/block-quote';
// import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
// import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
// import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor.js';
// import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor.js';
// import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily.js';
// import FontSize from '@ckeditor/ckeditor5-font/src/fontsize.js';
// import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
// import Image from '@ckeditor/ckeditor5-image/src/image.js';
// import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption.js';
// import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize.js';
// import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle.js';
// import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar.js';
// import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
// import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
// import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
// import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
// import Link from '@ckeditor/ckeditor5-link/src/link.js';
// import List from '@ckeditor/ckeditor5-list/src/list.js';
// import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties.js';
// import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed.js';
// import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
// import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice.js';
// import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting.js';
// import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
// import Table from '@ckeditor/ckeditor5-table/src/table.js';
// import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
// import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
// import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
// import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation.js';
// import TodoList from '@ckeditor/ckeditor5-list/src/todolist';
// import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';

class DefaultEditor extends ClassicEditor {}

// Plugins to include in the build.
DefaultEditor.builtinPlugins = [
    // Alignment,
    Autoformat,
    BlockQuote,
    // Bold,
    // Essentials,
    // FontBackgroundColor,
    // FontColor,
    // FontFamily,
    // FontSize,
    // Heading,
    // Image,
    // ImageCaption,
    // ImageResize,
    // ImageStyle,
    // ImageToolbar,
    // ImageUpload,
    // Indent,
    // IndentBlock,
    // Italic,
    // Link,
    // List,
    // ListProperties,
    // MediaEmbed,
    // Paragraph,
    // PasteFromOffice,
    // PictureEditing,
    // Strikethrough,
    // Table,
    // TableCellProperties,
    // TableProperties,
    // TableToolbar,
    // TextTransformation,
    // TodoList,
    // Underline
];

// Redactor configuration.
DefaultEditor.defaultConfig = {
    toolbar: {
        items: [
            'heading',
            '|',
            'fontSize',
            'fontFamily',
            '|',
            'fontColor',
            'fontBackgroundColor',
            '|',
            'bold',
            'italic',
            'underline',
            'strikethrough',
            '|',
            'alignment',
            '|',
            'numberedList',
            'bulletedList',
            '|',
            'outdent',
            'indent',
            '|',
            'todoList',
            'link',
            'blockQuote',
            'imageUpload',
            'insertTable',
            'mediaEmbed',
            '|',
            'undo',
            'redo'
        ]
    },
    language: 'fr',
    image: {
        toolbar: [
            'imageTextAlternative',
            'toggleImageCaption',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side'
        ]
    },
    table: {
        contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableCellProperties',
            'tableProperties'
        ]
    }
};

export default DefaultEditor;
