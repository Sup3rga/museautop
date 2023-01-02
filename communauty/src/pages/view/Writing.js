import React,{Component} from "react";
import {Icon} from "../../components/Header";
import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon
} from "@mui/material";
import Route from "../../utils/Route";
import BlankLoader from "./BlankLoader";
import Main from "../Main";
import Management from "../../utils/Management";
import {ArticlePreview} from "../../components/ArticleThumbnail";
import Filter from "../../utils/Filter";

export default class Writing extends Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            currentCategory: 0,
            categories: {},
            articles: [],
            draft: 0
        }
    }

    componentDidMount() {
        Management.getWritingDatas().then(data => {
            let r = {
                0: 'Toutes les catégories'
            };
            let {categories = {}, articles = []} = data;
            for(let i in categories){
                r[categories[i].id] = categories[i].name;
            }
            this.setState(state => {
                return  {
                    ...state,
                    loading: false,
                    categories: r,
                    articles: articles
                }
            })
        });
        this.setState(state => {return {...state, draft: Management.getDraft().length }});
    }

    static RenderSelect(props){
        let {list} = props;
        return (
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
                <Select {...props}>
                    {
                        Object.keys(list).map((key,index)=>{
                            return <MenuItem value={key} key={index}>{list[key]}</MenuItem>
                        })
                    }
                </Select>
            </FormControl>
        )
    }

    render() {

        if(this.state.loading){
            return <BlankLoader/>
        }

        return (
            <div className="ui-container ui-size-fluid ui-fluid-height presentation">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center ui-height-2">
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Catégorie"
                            value = {this.state.currentCategory}
                            sx={{height: 40}}
                            list = {this.state.categories}
                            onChange={(e)=>{
                                this.setState(state=>{ return {...state, currentCategory: e.target.value} });
                            }}
                        />
                    </div>
                    {
                        !this.state.draft ? null:
                        <Button color="warning">
                            Brouillons ({this.state.draft})
                        </Button>
                    }
                </div>
                <div className="ui-element ui-size-fluid ui-height-10 article-list">
                    {
                        this.state.articles.map((data, index)=>{
                            console.log('[Data]',data);
                            let props = Filter.object(data, [
                                'title','caption','reading','category',
                                'likes','dislikes','createdBy', 'modifiedBy', 'id'
                            ]);
                            if(props.modifiedBy.id  === props.createdBy.id){
                                props.modifiedBy = null;
                            }
                            return <ArticlePreview
                                key={index}
                                adminMod={true}
                                skeleton={!('id' in data)}
                                {...props}
                            />
                        })
                    }
                </div>
                <SpeedDial sx={{ position: 'absolute', bottom: 70, right: 16 }}
                    icon={<SpeedDialIcon/>}
                    ariaLabel={"ok"}>
                    <SpeedDialAction
                        name="new"
                        icon={<Icon icon="feather"/>}
                        title={"Nouvel article"}
                        onClick={()=>Route.pushState('./writing/new')}
                    />
                    <SpeedDialAction
                        title="Catégorie"
                        name="category"
                        icon={<Icon icon="layer-group"/>}
                        onClick={()=>Route.pushState('./writing/category')}
                    />
                </SpeedDial>
            </div>
        );
    }
}