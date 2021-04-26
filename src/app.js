import React, { Component } from "react";

import CookieManager from "./cookieManager";

import FAQ from "./components/faq";
import Header from "./components/header";
import Languages from "./components/languages";
import MapartController from "./components/mapart/mapartController";
import locale_en from "./en.json";

import "./app.css";

class App extends Component {
  state = {
    displayingFAQ: false,
    displayingCookiesWarning: true,
    displayingCorruptedPresetWarning: false,
    displayingEdgeWarning: false,
    localeStrings: locale_en,
    localeCodeLoading: null,
  };

  constructor(props) {
    super(props);

    //show warning when using Edge
    if (
      !(/*@cc_on!@*/ (false || !!document["documentMode"])) &&
      !!window["StyleMedia"]
    ) {
      this.state.displayingEdgeWarning = true;
    }

    this.state.displayingCookiesWarning =
      CookieManager.touchCookie("cookiesAccepted", false) === "false";
  }

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

  onEdgeWarningButtonClick = () => {
    this.setState({ displayingEdgeWarning: false });
  };

  onCorruptedPresetWarningButtonClick = () => {
    this.setState({ displayingCorruptedPresetWarning: false });
  };

  onCookiesWarningButtonClick = () => {
    CookieManager.setCookie("cookiesAccepted", true);
    this.setState({ displayingCookiesWarning: false });
  };

  showCorruptedPresetWarning = () => {
    this.setState({ displayingCorruptedPresetWarning: true });
  };

  componentDidMount() {
    const localeCookieValue = CookieManager.touchCookie("locale", "en");
    if (localeCookieValue !== "en") {
      this.onFlagClick(localeCookieValue);
    }
  }

  render() {
    const {
      displayingFAQ,
      displayingCookiesWarning,
      displayingCorruptedPresetWarning,
      displayingEdgeWarning,
      localeCodeLoading,
    } = this.state;
    return (
      <div className="App">
        {displayingFAQ ? (
          <FAQ onCloseClick={this.hideFAQ} />
        ) : (
          <React.Fragment>
            <div className="titleAndLanguages">
              <h1>MapartCraft</h1>
              <Languages
                onFlagClick={this.onFlagClick}
                localeCodeLoading={localeCodeLoading}
              />
            </div>
            <Header
              getLocaleString={this.getLocaleString}
              onFAQClick={this.showFAQ}
            />
            <MapartController
              getLocaleString={this.getLocaleString}
              onCorruptedPreset={this.showCorruptedPresetWarning}
            />
            <div className="fixedMessages">
              {displayingEdgeWarning ? (
                <div className="fixedMessage">
                  <p>
                    {this.getLocaleString("EDGEWARNING").replace("\\n", "\n")}
                  </p>
                  <button type="button" onClick={this.onEdgeWarningButtonClick}>
                    ✔️
                  </button>
                </div>
              ) : null}
              {displayingCorruptedPresetWarning ? (
                <div className="fixedMessage">
                  <p>{this.getLocaleString("PRESETS-CORRUPTED")}</p>
                  <button
                    type="button"
                    onClick={this.onCorruptedPresetWarningButtonClick}
                  >
                    ❗
                  </button>
                </div>
              ) : null}
              {displayingCookiesWarning ? (
                <div className="fixedMessage">
                  <p>{this.getLocaleString("COOKIES-DISCLOSURE") + " 🍪"}</p>
                  <button
                    type="button"
                    onClick={this.onCookiesWarningButtonClick}
                  >
                    ✔️
                  </button>
                </div>
              ) : null}
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default App;
