import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
/*import App from './App'; */
import './App.css';
import Test from './Test'; // Directly import Test component

/*
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />); 
*/
            
ReactDOM.render(
  <React.StrictMode>
    <div style={{padding: '20px', background: 'black', color: 'white'}}>
      <h1>TEST - If you see this, React is working</h1>
    </div>
  </React.StrictMode>,
  document.getElementById('root')
);
