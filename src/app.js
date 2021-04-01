import React, { Component } from "react";

import CookieManager from "./cookieManager";

import FAQ from "./components/faq";
import Header from "./components/header";
import Languages from "./components/languages";
import MapartController from "./components/mapart/mapartController";
import locale_en from "./en.json";

class App extends Component {
  state = {
    localeStrings: {},
    localeLoaded: false,
    displayingFAQ: false,
  };

  getLocaleString = (stringName) => {
    const { localeStrings } = this.state;
    if (stringName in localeStrings) {
      return localeStrings[stringName];
    } else {
      return "EN:" + locale_en[stringName]; //TODO fall back to EN
    }
  };

  showFAQ = () => {
    this.setState({ displayingFAQ: true });
  };

  hideFAQ = () => {
    this.setState({ displayingFAQ: false });
  };

  onFlagClick = (countryCode) => {
    CookieManager.setCookie("locale", countryCode);
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
    const { localeLoaded, displayingFAQ } = this.state;
    return (
      <div className="App">
        {displayingFAQ ? (
          <FAQ onCloseClick={this.hideFAQ} />
        ) : (
          <React.Fragment>
            {localeLoaded ? (
              <React.Fragment>
                <Languages onFlagClick={this.onFlagClick} />
                <Header
                  getLocaleString={this.getLocaleString}
                  onFAQClick={this.showFAQ}
                />
                <MapartController getLocaleString={this.getLocaleString} />
              </React.Fragment>
            ) : (
              <h1>Loading locale... 🌐</h1>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default App;
