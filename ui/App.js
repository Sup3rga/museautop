import React from 'react';
import Link from './site/components/Link'

export default class App extends React.Component{

  constructor(props){
    super(props)
  }

  render(){
    return (
      <>
        <h1>Hello</h1>
        <Link href="bien">
          Bien
        </Link>
      </>
    )
  }
}