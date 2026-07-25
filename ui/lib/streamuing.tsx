"use client";
import {useEffect, useMemo, useState, memo} from "react";
import {io} from "socket.io-client";
import {default as routes} from "@/streamuing.routes.json";
import {Socket} from "engine.io-client";

interface _StreamingProps {
    alias?: string
    url?: string
    emiturl?: string
    listenurl?: string
    filter?: string
    data?: Record<never, never>
    placeholder?: null | unknown
}

export const streaming : any = {
    connector: null,
    __: ["", null, {}],
    init(socket : any, params : Record<never, never> = {}){
        if(typeof socket == "string" && this.__[0] != socket){
            //@ts-expect-error
            this.connector = io.connect(socket, {
                withCredentials: true,
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket', 'polling']
            });
        }
        else if (socket instanceof Socket && this.__[1] !== socket){
            this.connector = socket;
        }
        this.__[2] = params;
    },
    reveal(alias : string | undefined, emiturl : string, listenurl : string){
        if(typeof alias == "string"){
            if(!(alias in routes)){
                emiturl = ""; listenurl = emiturl;
            }
            else {
                const urls = (routes as never)[alias];
                emiturl = urls[0];
                listenurl = urls[1];
            }
        }
        return [emiturl, listenurl]
    },
    request(endpoint : _StreamingProps | string, params = {}){
        const alias = typeof endpoint === 'string' ? "" :  endpoint.alias ?? "",
            emiturl= typeof endpoint === 'string' ? "" : endpoint.emiturl ?? "",
            listenurl= typeof endpoint === 'string' ? "" : endpoint.listenurl ?? "",
            url = typeof endpoint === 'string' ? endpoint : endpoint.emiturl ?? "",
            data= typeof endpoint === 'string' ? params : endpoint.data ?? {};

        let errorMessage : unknown =null;
        const object = {
            call: async ()=>{
                try {
                    return await streaming.upstream({alias, url, emiturl, listenurl, data});
                }catch (e) {
                    if (errorMessage) {
                        if(typeof errorMessage == "function"){
                            errorMessage(e);
                        }
                        else {
                            console.log(errorMessage, e);
                        }
                    } else {
                        throw new Error(e);
                    }
                }
            },
            except: (message: string)=>{
                errorMessage = message;
                return object;
            }
        };
        return object;
    },
    upstream: async ({alias, emiturl="", listenurl="", url = "", data={}} : _StreamingProps)=>{
        let outurl, inurl;
        if(url?.length){
            outurl = url;
            inurl = url;
        }
        else {
            [outurl, inurl] = streaming.reveal(alias, emiturl, listenurl);
        }
        // console.log('[Upstream]>>', streaming.connector, {...streaming.__[2], ...data, outurl});
        return new Promise((res, err)=>{
            streaming.connector
            .once(inurl, (data : any) => {
                if(!data.error){
                    res(data)
                }
                else{
                    err(data.code);
                }
            })
            .emit(outurl, {...streaming.__[2], ...data});
        })
    },
    downstream: ({alias, emiturl="", listenurl="", url="", data={}, filter, placeholder=null} : _StreamingProps)=>{
        let outurl, inurl;
        if(url?.length){
            outurl = url;
            inurl = url;
        }
        else {
            [outurl, inurl] = streaming.reveal(alias, emiturl, listenurl);
        }
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [datas, setData] = useState(placeholder);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            // console.log("[Down socket]", {url, outurl, inurl, data});
            const listener = (data : any) => {
                // console.log("{Receiving>>>",data);
                if(!data.error){
                    if(filter && typeof data.data == "object"){
                        return setData(data.data[filter]);
                    }
                    setData(data.data);
                }
            };
            // console.log('[Appel du socket]');
            streaming.connector
            .on(inurl, listener)
            .emit(outurl, {...streaming.__[2], ...data});
            return ()=>{
                streaming.connector.off(inurl, listener);
            }
        }, []);
        return datas;
    },
    ui:{}
}

streaming.ui.text = memo(function StreamingUI(
    {
        alias,
        emiturl = "",
        listenurl = "",
        url = "",
        data = {},
        filter,
        placeholder = null
    }: _StreamingProps
){
    return <>{streaming.downstream({alias, emiturl, url, listenurl, data, filter, placeholder})}</>
});