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

function AdsHtmlString(data){
    let content = "";
    if(data.tag == "group"){
        for(const child of data.children){
            content += AdsHtmlString(child);
        }
        return content;
    }
    if(["script", "div"].indexOf(data.tag) >= 0){
        content += `<${data.tag}`;
        for(const prop in data.props){
            content += "\n"+prop + '="'+data.props[prop] + '"\n';
        }
        content += '>\n';
        content += data.children ?? "";
        content += `</${data.tag}>`;
        return content;
    }
}
function AdsFrame(data){
    return <iframe
        srcDoc={AdsHtmlString(data)}
        style={{
            width: data.width ?? "auto",
            height: data.height ?? "auto",
            // border: "none",
            overflow: data.width || data.height ? "hidden" : "auto"
        }}
        scrolling={"no"}
    />
}
export function AdJsx({stage,index} : AdJsxProps){
    const datas = Ads[stage];
    return index in datas ? AdsFrame(datas[index]) : null;
}