// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // นำเข้า BrowserRouter
import App from './App';
import './index.css';
import { UserProvider } from "./pages/UserContext"; // import UserProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* ห่อ App ด้วย BrowserRouter */}
    <UserProvider>
      <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
