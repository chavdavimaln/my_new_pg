import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ThemeContext from "./context/ThemeContext";

const root = ReactDOM.createRoot(
  document.getElementById('root')
);

root.render(
    <Provider store={store}>
      <BrowserRouter basename='/'>
        <ThemeContext>
          <App />
        </ThemeContext>
      </BrowserRouter>
    </Provider>
);

reportWebVitals();