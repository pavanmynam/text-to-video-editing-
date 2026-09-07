import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // మన కలర్‌ఫుల్ స్టైల్స్ ని ఇక్కడ కనెక్ట్ చేసాము!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
