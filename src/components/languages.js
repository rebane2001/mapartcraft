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
    return (
      <div className="languages">
        {this.languages.map((language) =>
          language === "et" ? (
            [
              <img
                key={language}
                src={"./images/flags/" + language + ".svg"}
                alt={language}
                className={"flag flag-" + language}
                onClick={() => this.props.onFlagClick(language)}
              ></img>,
              <img
                key="et_pop"
                src={"./images/flags/et_pop.svg"}
                alt="et_pop"
                className={"flag flag-et_pop"}
                onClick={() => this.props.onFlagClick("et")}
              ></img>,
            ]
          ) : (
            <img
              key={language}
              src={"./images/flags/" + language + ".svg"}
              alt={language}
              className={"flag flag-" + language}
              onClick={() => this.props.onFlagClick(language)}
            ></img>
          )
        )}
      </div>
    );
  }
}

export default Languages;
