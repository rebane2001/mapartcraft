import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import FAQ from "./components/faq";
import Root from "./components/root";

import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <Router basename="/mapartcraft">
      <Switch>
        <Route path="/:countryCode?/faq" component={FAQ} />
        <Route path="/:countryCode?" component={Root} />
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
