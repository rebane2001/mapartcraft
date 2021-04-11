import React, { Component } from "react";

import CookieManager from "./cookieManager";

import FAQ from "./components/faq";
import Header from "./components/header";
import Languages from "./components/languages";
import MapartController from "./components/mapart/mapartController";
import locale_en from "./en.json";

class App extends Component {
  state = {
    displayingFAQ: false,
    localeStrings: locale_en,
    localeCodeLoading: null,
  };

  getLocaleString = (stringName) => {
    const { localeStrings } = this.state;
    if (stringName in localeStrings) {
      return localeStrings[stringName];
    } else {
      return "EN: " + locale_en[stringName];
    }
  };

  showFAQ = () => {
    this.setState({ displayingFAQ: true });
  };

  hideFAQ = () => {
    this.setState({ displayingFAQ: false });
  };

  onFlagClick = (countryCode) => {
    if (countryCode === "en") {
      this.setState({ localeStrings: locale_en });
      CookieManager.setCookie("locale", countryCode);
      return;
    }
    this.setState({ localeCodeLoading: countryCode });
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
        CookieManager.setCookie("locale", countryCode);
        this.setState({ localeStrings: data });
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        this.setState({ localeCodeLoading: null });
      });
  };

  componentDidMount() {
    const localeCookieValue = CookieManager.touchCookie("locale", "en");
    if (localeCookieValue !== "en") {
      this.onFlagClick(localeCookieValue);
    }
  }

  render() {
    const { displayingFAQ, localeCodeLoading } = this.state;
    return (
      <div className="App">
        {displayingFAQ ? (
          <FAQ onCloseClick={this.hideFAQ} />
        ) : (
          <React.Fragment>
            <Languages
              onFlagClick={this.onFlagClick}
              localeCodeLoading={localeCodeLoading}
            />
            <Header
              getLocaleString={this.getLocaleString}
              onFAQClick={this.showFAQ}
            />
            <MapartController getLocaleString={this.getLocaleString} />
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default App;
