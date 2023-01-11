import React from 'react';
import ReactDOM from 'react-dom';
import Route from './utils/Route';
import localforage from "localforage";
import Management from "./utils/Management";
import Ressources from "./utils/Ressources";
import Home from "./pages/Home";


localforage.config({
    driver      : localforage.INDEXEDDB,
    name        : Ressources.getProjectName(),
    version     : 1.0,
    storeName   : Ressources.getProjectName().replace(' ','_')+'DataBase',
    description : 'for storage'
});
localforage.ready();

Management.storage = localforage;


Route
.set('.*', <Home/>)

ReactDOM.render(
  <React.StrictMode>
      <Route/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
