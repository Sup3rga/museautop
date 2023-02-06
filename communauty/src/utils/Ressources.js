import AkaDatetime from './AkaDatetime';
import Filter from '../utils/Filter';

export default class Ressources{
    static links = {
        '/': "Accueil",
        '/articles': "Articles",
        "/punchlines": "Punchlines",
        "/contact-us": "Contactez-nous"
    };

    static calendar = {
      months: ['Jan','Fev','Mars','Avr', 'Mai','Juin', 'Juil','Août', 'Sept', 'Oct','Nov','Déc'],
      days: ['Dimanche','Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    };

    static apis = "http://localhost:7070";

    static getDateString(val, long = true){
        var date = new AkaDatetime(val),
            calendar = Ressources.calendar,
            now = new AkaDatetime();
        var diff = AkaDatetime.diff(now, date),
            hour = (date.getHour() == 0 ? "minuit " : date.getHour()+'h ')+(date.getMinute() == 0 ? 'pile' : date.getMinute());
        if(diff.getDay() == 0 && diff.getMonth() == 1 && diff.getYear() == 0){
            if(diff.getHour() == 0){
                if(diff.getMinute() <= 1){
                    return (long ? "À " : '')+"l'instant";
                }
                else{
                    return (long ? "Il y a " : '')+diff.getMinute()+' min.'
                }
            }
            else if(date.getDay() - now.getDay() == 0){
                return "Aujourd'hui à "+hour;
            }
            else{
                return "Demain à "+hour
            }
        }
        else if(diff.getDay() == 1 && date.getDay() - now.getDay() == 1 && diff.getMonth() == 1 && diff.getYear() == 0){
            return "Demain à "+hour
        }
        return (long ? calendar.days[date.getWeekDay()] : '')+' '+date.getDay()+' '+calendar.months[date.getMonth() * 1 - 1]+' '+date.getFullYear()+(long ? ' à '+ hour : '');
    }

    static async fetch(route, data){
        const response = await fetch(Ressources.apis+route,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static getUrl(){
        return window.location.pathname;
    }

    static getLocalStorage(key,object = false){
        let data = localStorage.getItem(key);
        if(!data){
            data = [];
        }
        else if(object){
            data = JSON.parse(data);
        }
        return data;
    }

    static setLocalStorage(key,value){
        if(typeof value == 'object' && value != null){
            value = JSON.stringify(value);
        }
        localStorage.setItem(key,value);
    }

    static getProjectName(){
        return "Rap Au Top";
    }
    
    static getSelfAdsText(){
        return "Nous sommes là pour vous aider à atteindre votre objectif en matière de" +
            " visiblité médiatique !" +
            " Nous sommes là pour vous aider à atteindre votre objectif en matière de" +
            " visiblité médiatique !" +
            " Nous sommes là pour vous aider à atteindre votre objectif en matière de" +
            " visiblité médiatique !" +
            " Nous sommes là pour vous aider à atteindre votre objectif en matière de" +
            " visiblité médiatique !" +
            " Nous sommes là pour vous aider à atteindre votre objectif en matière de" +
            " visiblité médiatique !" +
            " Nous sommes là pour vous aider à atteindre votre objectif en matière de" +
            " visiblité médiatique !"
    }

    static getFooterLinks(){
        return [
            {
                "/policy":"Politique et confidentialité",
                "/terms-&-conditions": "Termes et conditions applicables",
                "/strategy":"Nos plans de marketing",
                "/pricing":"Nos prix",
            },
            this.links,
            {
                "/policy":"Politique et confidentialité",
                "/terms-&-conditions": "Termes et conditions applicables",
                "/strategy":"Quels sont nos plans de marketing",
                "/pricing":"Nos prix",
            },
            {
                "/policy":"Politique et confidentialité",
                "/terms-&-conditions": "Termes et conditions applicables",
                "/strategy":"Quels sont nos plans de marketing",
                "/pricing":"Nos prix",
            }
        ]
    }

    static getSocialMediaLinks(){
        return [
            {
                icon: "facebook-f",
                link: "https://fb.com",
                title: "visitez notre page facebook"
            },
            {
                icon: "instagram",
                link: "https://ig.com",
                title: "visitez notre page instagram"
            },
            {
                icon: "youtube",
                link: "https://youtube.com",
                title: "Abonnez-vous à chaîne youtube"
            },
            {
                icon: "twitter",
                link: "https://twitter.com",
                title: "Suivez nos tweets"
            },
            {
                icon: "linkedin-in",
                link: "https://linkedin.com",
                title: "Abonnez-vous à notre page Linked In"
            }
        ];
    }

    static async getArticleCategories(){
        const data = await Ressources.fetch('/fetch', {
            bhid: window.currentBranch,
            sector: 'articles'
        });
        return {
            0: 'Toutes les catégories',
            ...Filter.toOptions(data.data, 'id', 'name')
        };
    }

    static async getArticles(){
        const data = await Ressources.fetch('/fetch', {
            articles: 'normal',
            bhid: window.currentBranch
        });
        return data.data;
    }

    static getArticlesFakeData(){
        let qty = Math.ceil(Math.random() * 3 + 5),
            r = [];
        for (let i = 0; i < qty; i++){
            r.push({
                title: null,
                subtitle: null,
                caption: null,
                date: null
            });
        }
        return r;
    }

    static async rateArticle(id,positive){
        try{
            const data = await Ressources.fetch('/submit', {
                bhid: window.currentBranch,
                [positive ? 'like_article' : 'dislike_article']: id
            });
            return !data.error;
        }catch (e){
            return false;
        }
    }

    static text(html){
        const parse = !html ? [] : html.match(/<p>([\s\S]+?)<\/p>/g);
        let content = '';
        for(let i = 0; i < parse.length; i++){
            content += parse[i];
        }
        let element = document.createElement('div');
        element.innerHTML = content;
        return element.innerText;
    }

    static async getSlidesData(){
        const data = await Ressources.fetch('/fetch', {
            bhid: window.currentBranch,
            articles: 'sponsored'
        });
        return data.data;
    }

    static getSlidesDataFakeData(){
        let qty = Math.ceil(Math.random() * 4 + 1),
            r = [];
        for (let i = 0; i < qty; i++){
            r.push({
                title: null,
                text: null,
                caption: null
            });
        }
        return r;
    }

    static async getLastPunchLinesData(){
        const data = await Ressources.fetch('/fetch', {
            punchlines: 'sponsored',
            bhid: window.currentBranch
        });
        return data.data.punchlines;
    }

    static async watchPunchline(id){
        try {
            const data = await Ressources.fetch('/submit', {
                cardid: id,
                bhid: window.currentBranch
            });
        }catch (e){
            console.log('[E]',e);
        }
    }

    static async getPunchlinesData(filter){
        const data = await Ressources.fetch('/fetch', {
            punchlines: 'grid',
            meta: true,
            bhid: window.currentBranch
        });
        return data.data;
    }

    static getLastPunchLinesDataFakeData(){
        let qty = Math.ceil(Math.random() * 5 + 1),
            r = [];
        for (let i = 0; i < qty; i++){
            r.push({
                image: null
            });
        }
        return r;
    }

    static range(min= 0,max = 1){
        let t = [];
        min *= 1;
        max *= 1;
        for(let i = min; i <= max; i++){
            t.push(i);
        }
        return t;
    }

    static async getArticleData(id){
        const data = await Ressources.fetch('/fetch', {
            articles: 'normal',
            artid: id,
            bhid: window.currentBranch
        });
        return data.data;
    }

    static async sendMessage(data){
        return await Ressources.fetch('/submit', data);
    }
}