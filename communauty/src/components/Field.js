import React from 'react';
import {Icon} from "./Header";

export default class Field extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            passwordVisible: false
        }
    }

    render() {
        let {placeholder,type,options,children, onChange, value, toggled} = this.props;
        type = type || 'text';
        options = options || {}
        let field = null;
        switch (type){
            case 'select':
                field = (
                    <select
                        className="ui-element ui-size-fluid"
                        placeholder={placeholder}
                        onChange={onChange}
                    >
                        {children ? children :
                            Object.keys(options).map((val,index)=>{
                                if(value == val){
                                    return <option value={val} selected>{options[val]}</option>;
                                }
                                return <option value={val}>{options[val]}</option>
                            })
                        }
                    </select>
                );
            break;
            case 'textarea':
                field = (
                    <textarea
                        className="ui-element ui-size-fluid"
                        placeholder={placeholder}
                        onChange={onChange}
                    >
                        {children}
                    </textarea>
                );
            break;
            default:
                field = (
                    <>
                        <input className="ui-element ui-size-fluid"
                               placeholder={placeholder || ''}
                               type={toggled && this.state.passwordVisible ? 'text' : type || 'text'}
                               onChange={onChange}
                        />
                        {
                            type.toLowerCase() == 'password' && toggled ?
                            <Icon mode="ion"
                                  className="ui-element"
                                  icon={this.state.passwordVisible ? 'eye-disabled' : 'eye'}
                                  style={{
                                      padding: ".4em 1em",
                                      color: "rgba(0,0,0,.7)"
                                  }}
                                  onClick={(e)=>{
                                      this.setState({
                                          passwordVisible: !this.state.passwordVisible
                                      })
                                  }}
                            />
                                :
                            null
                        }
                    </>
                );
        }
        return (
            <div className={
                "ui-container ui-field " + this.props.className + " " +
                (
                    type.toLowerCase() == 'password' && toggled ?
                    "ui-unwrap ui-flex ui-vertical-center" : ""
                )
            }>
                {field}
            </div>
        );
    }
}