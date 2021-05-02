import React, { Component } from "react";
import { Link } from "react-router-dom";

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
    const { localeCodeLoading } = this.props;
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
                <Link to={`/${language}`}>
                <img
                  src={"./images/flags/" + language + ".svg"}
                  alt={language}
                  className={"flag flag-" + language}
                />
                <img
                  key="et_pop"
                  src={"./images/flags/et_pop.svg"}
                  alt="et_pop"
                  className={"flag flag-et_pop"}
                />
                </Link>
              </React.Fragment>
            ) : (
              <Link to={`/${language === "en" ? "" : language}`}>
              <img
                src={"./images/flags/" + language + ".svg"}
                alt={language}
                className={"flag flag-" + language}
              />
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default Languages;
