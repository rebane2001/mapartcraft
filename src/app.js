import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import FAQ from "./components/faq";
import Root from "./components/root";

import "./app.css";

class App extends Component {
  render() {
    return (
      <Router basename="/mapartcraft">
        <div className="App">
          <Switch>
            <Route path="/:countryCode?/faq" component={FAQ} />
            <Route path="/:countryCode?" component={Root} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
