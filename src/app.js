import React, { Component } from "react";

import CookieManager from "./cookieManager";

import Header from "./components/header";
import Languages from "./components/languages";
import MapartController from "./components/mapart/mapartController";

class App extends Component {
  state = { localeStrings: {}, localeLoaded: false };

  getLocaleString = (stringName) => {
    const { localeStrings } = this.state;
    if (stringName in localeStrings) {
      return localeStrings[stringName];
    } else {
      return "EN:"; //TODO fall back to EN
    }
  };

  onFlagClick = (countryCode) => {
    CookieManager.setCookie("locale", countryCode, 9000);
    this.setState({ localeLoaded: false });
    fetch("./locale/" + countryCode + ".json")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText,
          });
        }
      })
      .then((data) => {
        this.setState({ localeStrings: data, localeLoaded: true });
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  componentDidMount() {
    const localeCookieValue = CookieManager.touchCookie("locale", "en");
    this.onFlagClick(localeCookieValue);
  }

  render() {
    const { localeLoaded } = this.state;
    return localeLoaded ? (
      <div className="App">
        <Languages onFlagClick={this.onFlagClick}></Languages>
        <Header getLocaleString={this.getLocaleString}></Header>
        <MapartController
          getLocaleString={this.getLocaleString}
        ></MapartController>
      </div>
    ) : (
      <div>
        <h1>Loading locale... 🌐</h1>
      </div>
    );
  }
}

export default App;
