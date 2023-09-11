import React from 'react'
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import Loadable from 'react-loadable'
import App from './App'
import store from './store'
import * as Sentry from "@sentry/react";

if (import.meta.env.REACT_APP_SENTRY_DSN && import.meta.env.REACT_APP_NODE_ENV === 'production') {
  Sentry.init({
    dsn: import.meta.env.REACT_APP_SENTRY_DSN,
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}


Loadable.preloadReady().then(() => {
  if (typeof window !== 'undefined' && window && window.native) {
    ReactDOM.hydrate(
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>,
      document.getElementById("root"),
    );
  } else {
    ReactDOM.hydrate(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
      document.getElementById("root"),
    );
  }
})

