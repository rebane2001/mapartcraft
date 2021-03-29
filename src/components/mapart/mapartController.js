import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import BlockSelection from "./blockSelection";

import "./mapartController.css";

class MapartController extends Component {
  state = { version: "1.12.2" };

  constructor(props) {
    super(props);
    if (CookieManager.getCookie("defaultVersion") === "") {
      CookieManager.setCookie("defaultVersion", "1.12.2", 9000);
    } else {
      let defaultVersion = CookieManager.getCookie("defaultVersion");
      this.state.version = defaultVersion;
    }
  }

  handleChangeVersion = (version) => {
    CookieManager.setCookie("defaultVersion", version, 9000);
    this.setState({ version });
  };

  render() {
    const { getLocaleString } = this.props;
    return (
      <React.Fragment>
        <BlockSelection
          getLocaleString={getLocaleString}
          handleChangeVersion={this.handleChangeVersion}
          version={this.state.version}
        ></BlockSelection>
      </React.Fragment>
    );
  }
}

export default MapartController;
