import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import BlockSelection from "./blockSelection";
import coloursJSON from "./SAOColoursList.json";

import "./mapartController.css";

class MapartController extends Component {
  state = { version: null, selectedBlocks: {} };

  constructor(props) {
    super(props);
    Object.keys(coloursJSON).forEach(
      (key) => (this.state.selectedBlocks[key] = "-1")
    );
    let defaultVersion;
    if (CookieManager.getCookie("defaultVersion") === "") {
      CookieManager.setCookie("defaultVersion", "1.12.2", 9000);
      defaultVersion = "1.12.2";
    } else {
      defaultVersion = CookieManager.getCookie("defaultVersion");
    }
    this.state.version = defaultVersion;
  }

  handleChangeVersion = (e) => {
    const version = e.target.value;
    let selectedBlocks = {};
    Object.keys(coloursJSON).forEach((key) => (selectedBlocks[key] = "-1"));
    CookieManager.setCookie("defaultVersion", version, 9000);
    this.setState({ version, selectedBlocks });
  };

  handleChangeColourSetBlock = (colourSetId, blockId) => {
    let selectedBlocks = { ...this.state.selectedBlocks };
    selectedBlocks[colourSetId] = blockId;
    this.setState({
      selectedBlocks,
    });
  };

  handleChangeColourSetBlocks = (setsAndBlocks) => {
    const { version } = this.state;
    let selectedBlocks = {};
    Object.keys(coloursJSON).forEach((key) => (selectedBlocks[key] = "-1"));
    setsAndBlocks.forEach((block) => {
      const colourSetId = block[0].toString();
      const blockId = block[1].toString();
      if (
        blockId !== "-1" &&
        coloursJSON[colourSetId]["blocks"][blockId]["validVersions"].includes(
          version
        )
      ) {
        selectedBlocks[colourSetId] = blockId;
      }
    });
    this.setState({
      selectedBlocks,
    });
  };

  render() {
    const { getLocaleString } = this.props;
    const { version, selectedBlocks } = this.state;
    return (
      <React.Fragment>
        <BlockSelection
          getLocaleString={getLocaleString}
          onChangeVersion={this.handleChangeVersion}
          onChangeColourSetBlock={this.handleChangeColourSetBlock}
          onChangeColourSetBlocks={this.handleChangeColourSetBlocks}
          version={version}
          selectedBlocks={selectedBlocks}
        ></BlockSelection>
      </React.Fragment>
    );
  }
}

export default MapartController;
