import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import App from './App';
import './App.css';
/* import './styles/tailwind.output.css'; */


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


/*
import React from 'react';
import ReactDOM from 'react-dom/client';
import Test from './Test';  // ←Change this from App to Test

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Test />  {//Now rendering Test instead of App}
  </React.StrictMode>
);
*/
