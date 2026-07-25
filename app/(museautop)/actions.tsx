"use server";
import Cookie from "@/server/data/Cookie";
import Client from "@/server/data/Client";
import {cookies} from "next/headers";
import Wayto from "@/server/controller/wayto";

export async function visites(){
    const {io} = global;
    Cookie.setProvider(await cookies(), Cookie.processModes.NEXT);
    if(io){
        io.emit("/get/visitors/stats", await Wayto.getVisiteStats());
    }
    await Client.attend();
}

export async function setVisites({artid, punchid} : never){
    if(punchid && artid){
        console.log('[Error] Once at time !', {artid, punchid});
        return;
    }
    if(punchid){
        await Wayto.punchlineVisites(punchid);
    }
    if(artid){
        await Wayto.articleVisites(punchid);
    }
}