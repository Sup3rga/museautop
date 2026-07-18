"use client";
import {useEffect, useMemo, useState} from "react";
import {io} from "socket.io-client";
import {default as routes} from "@/streamuing.routes.json";
import {Socket} from "socket.io";

interface _StreamingProps {
    alias?: string
    url?: string
    emiturl?: string
    listenurl?: string
    filter?: string
    data?: Record<never, never>
    placeholder?: null | unknown
}
function useStreamUIng(socket : string | Socket, params : Record<never, never> = {}){
    const connector = useMemo(()=>{
        if(typeof socket == "string") {
            //@ts-expect-error
            return io.connect(socket);
        }
        return socket;
    }, [socket]);
    useEffect(() => {
        // connector.on("connected", (e : never)=>{
        //     console.log("{Let's go>>>>", routes);
        // });
    }, [connector]);
    const reveal = (alias : string | undefined, emiturl : string, listenurl : string)=>{
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
    }

    const ticket = {
        socket: connector,
        request: (endpoint : _StreamingProps | string, params = {})=>{
            const alias = typeof endpoint === 'string' ? "" :  endpoint.alias ?? "",
                emiturl= typeof endpoint === 'string' ? "" : endpoint.emiturl ?? "",
                listenurl= typeof endpoint === 'string' ? "" : endpoint.listenurl ?? "",
                url = typeof endpoint === 'string' ? endpoint : endpoint.emiturl ?? "",
                data= typeof endpoint === 'string' ? params : endpoint.data ?? {};

            let errorMessage : unknown =null;
            const object = {
                call: async ()=>{
                    try {
                        return await ticket.upstream({alias, url, emiturl, listenurl, data});
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
                [outurl, inurl] = reveal(alias, emiturl, listenurl);
            }
            return new Promise((res, err)=>{
                connector
                .emit(outurl, {...params, ...data})
                .once(inurl, (data : any) => {
                    if(!data.error){
                        res(data)
                    }
                    else{
                        err(data.code);
                    }
                });
            })
        },
        downstream: ({alias, emiturl="", listenurl="", url="", data={}, filter, placeholder=null} : _StreamingProps)=>{
            let outurl, inurl;
            if(url?.length){
                outurl = url;
                inurl = url;
            }
            else {
                [outurl, inurl] = reveal(alias, emiturl, listenurl);
            }
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [datas, setData] = useState(placeholder);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useEffect(() => {
                // console.log("[Down socket]", {url, outurl, inurl, data, params});
                connector
                    .emit(outurl, {...params, ...data})
                    .on(inurl, (data : any) => {
                        // console.log("{Receiving>>>",data);
                        if(!data.error){
                            if(filter && typeof data.data == "object"){
                                return setData(data.data[filter])
                            }
                            setData(data.data)
                        }
                    });
            }, []);
            return datas;
        },
        StreamUI: ({alias, emiturl="", listenurl="", url = "", data={}, filter, placeholder= null} : _StreamingProps)=>{
            return (
                <>{ticket.downstream({alias, emiturl, url, listenurl, data, filter, placeholder})}</>
            )
        }
    }
    return ticket;
}
export default useStreamUIng;