import React, { Component } from "react";

import "./languages.css";

class Languages extends Component {
  languages = [
    "en",
    "et",
    "lt",
    "ru",
    "de",
    "fr",
    "it",
    "pt",
    "es",
    "zh-Hans",
    "zh-Hant",
    "eo",
  ];

  render() {
    const { onFlagClick, localeCodeLoading } = this.props;
    return (
      <div className="languages">
        {this.languages.map((language) => (
          <div className="language" key={language}>
            {localeCodeLoading === language ? (
              <img
                key={language + "_loading"}
                src="./images/loadingSpinner.gif"
                alt="loading"
                className="imgLoadingGif"
              />
            ) : null}
            {language === "et" ? (
              <React.Fragment>
                <img
                  src={"./images/flags/" + language + ".svg"}
                  alt={language}
                  className={"flag flag-" + language}
                  onClick={() => onFlagClick(language)}
                />
                <img
                  key="et_pop"
                  src={"./images/flags/et_pop.svg"}
                  alt="et_pop"
                  className={"flag flag-et_pop"}
                  onClick={() => onFlagClick("et")}
                />
              </React.Fragment>
            ) : (
              <img
                src={"./images/flags/" + language + ".svg"}
                alt={language}
                className={"flag flag-" + language}
                onClick={() => onFlagClick(language)}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default Languages;
