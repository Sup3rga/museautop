import React, {useMemo} from "react";
import parser from "html-react-parser";
import {default as Ads} from "@/public/ads.json";

interface AdJsxProps{
    stage: "reading" | "footer";
    index: number;
}
export function useAdsIndex(content : string, deps : any[] = []){
    const adsIndex = useMemo(()=>{
        const total : number[] = [];
        let i = 0;
        const index = [];
        parser(content, {
            replace: (el : any)=>{
                if(/^(h[0-9]+|p)$/.test(el.name)){
                    total.push(i);
                }
                i++;
            }
        });
        const split = Math.floor(total.length / Ads.reading.length);
        for(i = 0; i < Ads.reading.length; i ++){
            index.push(total[Math.floor(Math.random() * (split - i * split) + i * split)]);
        }
        return index;
    }, deps);
    return adsIndex;
}

function AdsParser(data: any, key: any = 0){
    if(data.tag == "group"){
        return (
            <>
                {
                    data.children.map((data : any, key)=>AdsParser(data, key))
                }
            </>
        );
    }
    if(data.tag == "script"){
        return <script key={key} {...(data.props ? data.props : {})}
            dangerouslySetInnerHTML={{
                __html: data.children ?? ""
            }}
        />;
    }
    if(data.tag == "div"){
        return <div key={key} {...(data.props ? data.props : {})}
                       dangerouslySetInnerHTML={{
                           __html: data.children ?? ""
               }}
        />;
    }
}
export function AdJsx({stage,index} : AdJsxProps){
    const datas = Ads[stage];
    return index in datas ? AdsParser(datas[index]) : null;
}