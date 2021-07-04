import React, { Component } from "react";
import { Link } from "react-router-dom";

import Locale from "../locale/locale";

import "./languages.css";

class Languages extends Component {
  render() {
    return (
      <div className="languages">
        {Object.keys(Locale).map((language) => (
          <div className="language" key={language}>
            {language === "et" ? (
              <React.Fragment>
                <Link to={`/${language}`}>
                  <img src={Locale[language].flag} alt={language} className={`flag flag_${language}`} />
                  <img key="et_pop" src={Locale[language].flag_special} alt="et_pop" className={"flag flag_et_pop"} />
                </Link>
              </React.Fragment>
            ) : (
              <Link to={`/${language === "en" ? "" : language}`}>
                <img src={Locale[language].flag} alt={language} className={`flag flag_${language}`} />
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default Languages;
