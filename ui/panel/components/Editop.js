'use client'
import { useEffect, useRef } from 'react'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import ImageTool from '@editorjs/image'

export default function Editop({ onChange }) {
    const editorRef = useRef(null)

    useEffect(() => {
        console.log('[Ref]', editorRef);
        if(editorRef) {
            const editor = new EditorJS({
                holder: 'editorjs',
                tools: {
                    header: Header,
                    list: List,
                    image: {
                        class: ImageTool,
                        config: {
                            endpoints: {
                                byFile: '/api/upload',  // upload depuis l'ordinateur
                                byUrl: '/api/upload-url', // optionnel : depuis une URL
                            }
                        }
                    }
                },
                placeholder: "Ecrivez quelque chose",
                onChange: async () => {
                    const data = await editor.save();
                    console.log('[Data]', data);
                    onChange(data)
                },
            })

            // editorRef.current = editor
        }
        // return () => editor.destroy()
    }, [editorRef])

    return <div id="editorjs" ref={editorRef} style={{display: 'block', width: '100%', minHeight: "300px"}}/>
}