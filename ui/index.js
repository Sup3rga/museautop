import React from 'react';
import ReactDOM from 'react-dom';
import Home from './site/views/Home';
import Articles from './site/views/Articles';
import Route from "./utils/Route";
import Contact from "./site/views/Contact";
import Reading from "./site/views/Reading";
import Punchlines from "./site/views/Punchlines";

Route
.set('/', <Home/>)
.set('/articles', <Articles/>)
.set('/articles/[0-9]+/[\\S\\s]+', <Reading/>)
.set('/punchlines', <Punchlines/>)
.set('/contact-us', <Contact/>)

ReactDOM.render(
  <React.StrictMode>
    <Route/>
  </React.StrictMode>,
  document.getElementById('root')
);
