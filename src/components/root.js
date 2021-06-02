import React, { Component } from "react";

import Header from "./header";
import Languages from "./languages";
import MapartController from "./mapart/mapartController";

import Locale from "../locale/locale";

import "./root.css";

class Root extends Component {
  state = {
    displayingCorruptedPresetWarning: false,
    displayingEdgeWarning: false,
  };

  constructor(props) {
    super(props);

    //show warning when using Edge
    if (!(/*@cc_on!@*/ (false || !!document["documentMode"])) && !!window["StyleMedia"]) {
      this.state.displayingEdgeWarning = true;
    }
  }

  getLocaleString = (stringName) => {
    const countryCode = this.props.match.params.countryCode;
    if (countryCode in Locale && stringName in Locale[countryCode].strings) {
      return Locale[countryCode].strings[stringName];
    } else if (countryCode === undefined) {
      return Locale.en.strings[stringName];
    } else {
      return `EN: ${Locale.en.strings[stringName]}`;
    }
  };

  onEdgeWarningButtonClick = () => {
    this.setState({ displayingEdgeWarning: false });
  };

  onCorruptedPresetWarningButtonClick = () => {
    this.setState({ displayingCorruptedPresetWarning: false });
  };

  showCorruptedPresetWarning = () => {
    this.setState({ displayingCorruptedPresetWarning: true });
  };

  render() {
    const { displayingCorruptedPresetWarning, displayingEdgeWarning } = this.state;
    return (
      <React.Fragment>
        <div className="titleAndLanguages">
          <h1 style={{ color: "red" }}>MapartCraft WIP</h1>
          <Languages />
        </div>
        <Header getLocaleString={this.getLocaleString} countryCode={this.props.match.params.countryCode} />
        <MapartController getLocaleString={this.getLocaleString} onCorruptedPreset={this.showCorruptedPresetWarning} />
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
              <button type="button" onClick={this.onCorruptedPresetWarningButtonClick}>
                ❗
              </button>
            </div>
          ) : null}
        </div>
      </React.Fragment>
    );
  }
}

export default Root;
