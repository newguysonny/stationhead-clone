import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import { App } from './App'; // Note the curly braces
import './App.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import Test from './Test';  // ← Change this from App to Test

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Test />  {//Now rendering Test instead of App}
  </React.StrictMode>
);
*/
