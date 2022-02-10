import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./header.css";

class Header extends Component {
  state = { contactInfoClassname: "contactInfoBlurred" };

  // Reveal contact info
  onContactInfoClick = (event) => {
    const { getLocaleString } = this.props;
    event.preventDefault();
    if (window.confirm(getLocaleString("FAQ/HAVE-YOU-READ"))) {
      alert(getLocaleString("FAQ/HELP-IN-ENGLISH"));
      this.setState({ contactInfoClassname: "contactInfo" });
    }
  };

  render() {
    const { contactInfoClassname } = this.state;
    const { getLocaleString } = this.props;
    return (
      <div className="header">
        <h3>
          <Link to={`/${![undefined, "en"].includes(this.props.countryCode) ? this.props.countryCode + "/" : ""}faq`}>
            <span className="FAQTextButton">{getLocaleString("FAQ/FAQ")}</span>
          </Link>
          <span> | </span>
          <a href="https://youtu.be/j-4RXPkJKU8" target="_blank" rel="noopener noreferrer">
            {getLocaleString("FAQ/VIDEO-TUTORIAL")}
          </a>
          <span> | </span>
          <a href="https://github.com/rebane2001/mapartcraft" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span> | </span>
          <a href="https://discord.gg/r7Tuerq" target="_blank" rel="noopener noreferrer">
            2b2t Mapart Discord
          </a>
          <span> | </span>
          <a href="https://area51.selfadjointoperator.com/mapartcraft/" target="_blank" rel="noopener noreferrer">
            Beta
          </a>
        </h3>
        <p>
          {getLocaleString("DESCRIPTION/1")}
          <a href="https://www.reddit.com/r/2b2t/" target="_blank" rel="noopener noreferrer">
            2b2t
          </a>
          {getLocaleString("DESCRIPTION/2")}
          <br></br>
          {getLocaleString("DESCRIPTION/3")}
          <a href="https://redd.it/2yck3f" target="_blank" rel="noopener noreferrer">
            {getLocaleString("DESCRIPTION/4")}
          </a>
          {getLocaleString("DESCRIPTION/5")}
          <br></br>
          {getLocaleString("DESCRIPTION/6")}
          <span className={contactInfoClassname} onClick={this.onContactInfoClick}>
            (rebane2001#3716)
          </span>
          {getLocaleString("DESCRIPTION/7")}
          <span className={contactInfoClassname} onClick={this.onContactInfoClick}>
            (
            <a href="https://www.reddit.com/message/compose/?to=rebane2001" target="_blank" rel="noopener noreferrer">
              /u/rebane2001
            </a>
            )
          </span>
          {getLocaleString("DESCRIPTION/8")}
          <a href="https://github.com/rebane2001/mapartcraft/issues" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {"."}
          <br></br>
          <em>
            {getLocaleString("DESCRIPTION/9")}
            <a href="/mapartcraft/classic" target="_blank" rel="noopener noreferrer">
              {getLocaleString("DESCRIPTION/10")}
            </a>
            {"."}
          </em>
          <br></br>
          <b>
            {getLocaleString("FAQ/PLEASE-READ-1")}
            <Link to={`/${![undefined, "en"].includes(this.props.countryCode) ? this.props.countryCode + "/" : ""}faq`}>
              <span className="FAQTextButton">{getLocaleString("FAQ/FAQ")}</span>
            </Link>
            {getLocaleString("FAQ/PLEASE-READ-2")}
          </b>
        </p>
      </div>
    );
  }
}

export default Header;
