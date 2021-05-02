import React, { Component } from "react";

import Header from "./header";
import Languages from "./languages";
import MapartController from "./mapart/mapartController";

import CookieManager from "../cookieManager";
import locale_en from "./en.json";

import "./root.css";

class Root extends Component {
  state = {
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

  fetchAndSetLocaleIfExists(countryCode) {
    if (![undefined, "en"].includes(countryCode)) {
      this.setState({ localeCodeLoading: countryCode });
      fetch("./locale/" + countryCode + ".json")
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          this.setState({ localeStrings: data });
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          this.setState({ localeCodeLoading: null });
        });
    } else {
      this.setState({
        localeStrings: locale_en,
      });
    }
  }

  componentDidMount() {
    const countryCode = this.props.match.params.countryCode;
    this.fetchAndSetLocaleIfExists(countryCode);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.match.params.countryCode !== this.props.match.params.countryCode
    ) {
      this.fetchAndSetLocaleIfExists(this.props.match.params.countryCode);
    }
  }

  render() {
    const {
      displayingCookiesWarning,
      displayingCorruptedPresetWarning,
      displayingEdgeWarning,
      localeCodeLoading,
    } = this.state;
    return (
      <React.Fragment>
        <div className="titleAndLanguages">
          <h1>MapartCraft</h1>
          <Languages localeCodeLoading={localeCodeLoading} />
        </div>
        <Header
          getLocaleString={this.getLocaleString}
          countryCode={this.props.match.params.countryCode}
        />
        <MapartController
          getLocaleString={this.getLocaleString}
          onCorruptedPreset={this.showCorruptedPresetWarning}
        />
        <div className="fixedMessages">
          {displayingEdgeWarning ? (
            <div className="fixedMessage">
              <p>{this.getLocaleString("EDGEWARNING").replace("\\n", "\n")}</p>
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
              <button type="button" onClick={this.onCookiesWarningButtonClick}>
                ✔️
              </button>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

export default Root;
