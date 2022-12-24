import AkaDatetime from './AkaDatetime';
import test from '../article';

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

    static getDateString(val){
        var date = new AkaDatetime(val),
            calendar = Ressources.calendar;
        return calendar.days[date.getWeekDay()]+' '+date.getDay()+' '+calendar.months[date.getMonth() * 1 - 1]+' '+date.getFullYear();
    }

    static getUrl(){
        return window.location.pathname;
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
        return {
            "all": "Tout",
            "musique": "Musique",
            "actualites": "Actualités",
            "hip-hop": "Hip-hop",
            "clip": "Clip"
        };
    }

    static async getArticles(){
        return [
            {
                id: 12,
                title: "50 Cent sur le podium...",
                subtitle: "La nuit dernière était épique. Mais à savoir comment, il faut lire la suite pour savoir.",
                caption: './assets/captions/rapcap004.jpg',
                categorie: "musique",
                date: '2022-11-13'
            },{
                id: 15,
                title: "La victoire de je ne sais qui !",
                subtitle: "Découvrez ce qui s'est passé lors de la cérémonie de BET",
                caption: './assets/captions/rapcap006.jpg',
                categorie: "actualites",
                date: '2022-11-06'
            },{
                id: 19,
                title: "La victoire de je ne sais qui !",
                subtitle: "Découvrez ce qui s'est passé lors de la cérémonie de BET",
                caption: './assets/captions/rapcap007.jpg',
                categorie: "actualites",
                date: '2022-11-06'
            },{
                id: 21,
                title: "La victoire de je ne sais qui !",
                subtitle: "Découvrez ce qui s'est passé lors de la cérémonie de BET",
                caption: './assets/captions/rapcap008.jpg',
                categorie: "hip-hop",
                date: '2022-11-06'
            },{
                id: 17,
                title: "Jay-z est de retour pour...",
                subtitle: "Par manque d'inspiration pour écrire des concepts d'articles, nous voilà quelque part " +
                    "sur Jay-z pour dire un truc, quoi !  ",
                caption: './assets/captions/rapcap009.jpg',
                categorie: "actualites",
                date: '2022-11-06'
            }
        ];
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

    static async getSlidesData(){
        return [
            {
                title: "Cet artiste est capable de faire vibrer littéralement une salle !",
                text: "Découvrez ce qui s'est passé lors de la cérémonie de BET",
                caption: './assets/captions/rapcap003.jpg',
            },
            {
                title: "La ligue reprend !",
                text: "La rédaction de Rap-au-top souhaite vous faire vivre les dernières images du retour de la ligue.",
                caption: './assets/captions/rapcap002.jpg',
            },
            {
                title: "Un projet est en préparation dans les coulisses !",
                text: "Découvrez ce qui s'est passé lors de la cérémonie de BET",
                caption: './assets/captions/rapcap001.jpg',
            }
        ];
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
        return [
            {
                image: './assets/captions/rappunch001.jpg'
            },
            {
                image: './assets/captions/rappunch002.jpg'
            },
            {
                image: './assets/captions/rappunch003.jpg'
            }
        ];
    }

    static async getPunchlinesData(filter){
        return [
            {
                image: './assets/captions/rappunch001.jpg',
                artist: 'Dinos',
                category: 'Hip-Hop',
                year: 2020,
                music: 'Titre de la musique',
                comment: "Ceci est un commentaire sur le punchline",
                text: 'Ceci est le texte'
            },
            {
                image: './assets/captions/rappunch002.jpg',
                artist: 'Dinos',
                category: 'Hip-Hop',
                year: 2020,
                music: 'Titre de la musique',
                comment: "Ceci est un commentaire sur le punchline",
                text: 'Ceci est le texte'
            },
            {
                image: './assets/captions/rappunch003.jpg',
                artist: 'Dinos',
                category: 'Hip-Hop',
                year: 2020,
                music: 'Titre de la musique',
                comment: "Ceci est un commentaire sur le punchline",
                text: 'Ceci est le texte'
            },
            {
                image: './assets/captions/rappunch002.jpg',
                artist: 'Dinos',
                category: 'Hip-Hop',
                year: 2020,
                music: 'Titre de la musique',
                comment: "Ceci est un commentaire sur le punchline",
                text: 'Ceci est le texte'
            },
            {
                image: './assets/captions/rappunch003.jpg',
                artist: 'Dinos',
                category: 'Hip-Hop',
                year: 2020,
                music: 'Titre de la musique',
                comment: "Ceci est un commentaire sur le punchline",
                text: 'Ceci est le texte'
            },
            {
                image: './assets/captions/rappunch002.jpg',
                artist: 'Dinos',
                category: 'Hip-Hop',
                year: 2020,
                music: 'Titre de la musique',
                comment: "Ceci est un commentaire sur le punchline",
                text: 'Ceci est le texte'
            }
        ];
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

    static async getArticleData(){
        return {
            title: "La sortie d'une nouvelle single de Hip-Hop prochainement dans les bac",
            text: test,
            caption: '/assets/captions/rapcap008.jpg',
            publishDate: '11-08-2022',
            time: '13:00',
            stats: [],
            author: null
        };
    }
}