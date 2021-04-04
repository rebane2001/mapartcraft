import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import BlockSelection from "./blockSelection";
import MapPreview from "./mapPreview";
import MapSettings from "./mapSettings";
import coloursJSON from "./SAOColoursList.json";
import DitherMethods from "./Const_DitherMethods";

import "./mapartController.css";

class MapartController extends Component {
  state = {
    selectedBlocks: {},
    optionValue_version: null,
    optionValue_modeNBTOrMapdat: "NBT",
    optionValue_mapSize_x: 1,
    optionValue_mapSize_y: 1,
    optionValue_cropImage: true,
    optionValue_showGridOverlay: false,
    optionValue_staircasing: "optimized",
    optionValue_whereSupportBlocks: "Important",
    optionValue_supportBlock: "minecraft:netherrack",
    optionValue_unobtainable: true,
    optionValue_transparency: true,
    optionValue_betterColour: true,
    optionValue_dithering: DitherMethods.FloydSteinberg.uniqueId,
    optionValue_preprocessingEnabled: false,
    preProcessingValue_brightness: 100,
    preProcessingValue_contrast: 100,
    preProcessingValue_saturation: 100,
  };

  constructor(props) {
    super(props);
    Object.keys(coloursJSON).forEach(
      (key) => (this.state.selectedBlocks[key] = "-1")
    );
    this.state.optionValue_version = CookieManager.touchCookie(
      "defaultVersion",
      "1.12.2"
    );
  }

  handleChangeColourSetBlock = (colourSetId, blockId) => {
    let selectedBlocks = { ...this.state.selectedBlocks };
    selectedBlocks[colourSetId] = blockId;
    this.setState({
      selectedBlocks,
    });
  };

  handleChangeColourSetBlocks = (setsAndBlocks) => {
    const { optionValue_version } = this.state;
    let selectedBlocks = {};
    Object.keys(coloursJSON).forEach((key) => (selectedBlocks[key] = "-1"));
    setsAndBlocks.forEach((block) => {
      const colourSetId = block[0].toString();
      const blockId = block[1].toString();
      if (
        blockId !== "-1" &&
        coloursJSON[colourSetId]["blocks"][blockId]["validVersions"].includes(
          optionValue_version
        )
      ) {
        selectedBlocks[colourSetId] = blockId;
      }
    });
    this.setState({
      selectedBlocks,
    });
  };

  onOptionChange_modeNBTOrMapdat = (e) => {
    const mode = e.target.value;
    this.setState({ optionValue_modeNBTOrMapdat: mode });
  };

  onOptionChange_version = (e) => {
    const version = e.target.value;
    let selectedBlocks = {};
    Object.keys(coloursJSON).forEach((key) => (selectedBlocks[key] = "-1"));
    CookieManager.setCookie("defaultVersion", version);
    this.setState({ optionValue_version: version, selectedBlocks });
  };

  onOptionChange_mapSize_x = (e) => {
    const x = parseInt(e.target.value);
    this.setState({ optionValue_mapSize_x: x });
  };

  onOptionChange_mapSize_y = (e) => {
    const y = parseInt(e.target.value);
    this.setState({ optionValue_mapSize_y: y });
  };

  onOptionChange_cropImage = () => {
    this.setState({ optionValue_cropImage: !this.state.optionValue_cropImage });
  };

  onOptionChange_showGridOverlay = () => {
    this.setState({
      optionValue_showGridOverlay: !this.state.optionValue_showGridOverlay,
    });
    // "updatePreviewScale(0)"
  };

  onOptionChange_staircasing = (e) => {
    const staircasingValue = e.target.value;
    this.setState({ optionValue_staircasing: staircasingValue });
  };

  onOptionChange_unobtainable = () => {
    this.setState({
      optionValue_unobtainable: !this.state.optionValue_unobtainable,
    });
  };

  onOptionChange_transparency = () => {
    this.setState({
      optionValue_transparency: !this.state.optionValue_transparency,
    });
  };

  onOptionChange_BetterColour = () => {
    this.setState({
      optionValue_betterColour: !this.state.optionValue_betterColour,
    });
  };

  onOptionChange_dithering = (e) => {
    const ditheringValue = parseInt(e.target.value);
    this.setState({ optionValue_dithering: ditheringValue });
  };

  onOptionChange_WhereSupportBlocks = (e) => {
    const newValue = e.target.value;
    this.setState({ optionValue_whereSupportBlocks: newValue });
  };

  onOptionChange_SupportBlock = (e) => {
    const newValue = e.target.value;
    this.setState({ optionValue_supportBlock: newValue });
  };

  onOptionChange_PreProcessingEnabled = () => {
    this.setState({
      optionValue_preprocessingEnabled: !this.state
        .optionValue_preprocessingEnabled,
    });
  };

  onOptionChange_PreProcessingBrightness = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ preProcessingValue_brightness: newValue });
  };

  onOptionChange_PreProcessingContrast = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ preProcessingValue_contrast: newValue });
  };

  onOptionChange_PreProcessingSaturation = (e) => {
    const newValue = parseInt(e.target.value);
    this.setState({ preProcessingValue_saturation: newValue });
  };

  onViewOnlineClicked = (e) => {
    console.log(e);
    //TODO
  };

  onGetNBTClicked = (e) => {
    console.log(e);
    //TODO
  };

  onGetNBTSplitClicked = (e) => {
    console.log(e);
    //TODO
  };

  onGetMapdatSplitClicked = (e) => {
    console.log(e);
    //TODO
  };

  onGetPDNPaletteClicked = (e) => {
    console.log(e);
    //TODO
  };

  render() {
    const { getLocaleString } = this.props;
    const {
      selectedBlocks,
      optionValue_version,
      optionValue_modeNBTOrMapdat,
      optionValue_mapSize_x,
      optionValue_mapSize_y,
      optionValue_cropImage,
      optionValue_showGridOverlay,
      optionValue_staircasing,
      optionValue_whereSupportBlocks,
      optionValue_supportBlock,
      optionValue_unobtainable,
      optionValue_transparency,
      optionValue_betterColour,
      optionValue_dithering,
      optionValue_preprocessingEnabled,
      preProcessingValue_brightness,
      preProcessingValue_contrast,
      preProcessingValue_saturation,
    } = this.state;
    return (
      <React.Fragment>
        <BlockSelection
          getLocaleString={getLocaleString}
          onChangeColourSetBlock={this.handleChangeColourSetBlock}
          onChangeColourSetBlocks={this.handleChangeColourSetBlocks}
          optionValue_version={optionValue_version}
          optionValue_modeNBTOrMapdat={optionValue_modeNBTOrMapdat}
          optionValue_staircasing={optionValue_staircasing}
          optionValue_unobtainable={optionValue_unobtainable}
          selectedBlocks={selectedBlocks}
        />
        <MapPreview
          getLocaleString={getLocaleString}
          optionValue_mapSize_x={optionValue_mapSize_x}
          optionValue_mapSize_y={optionValue_mapSize_y}
          optionValue_cropImage={optionValue_cropImage}
          optionValue_showGridOverlay={optionValue_showGridOverlay}
        />
        <MapSettings
          getLocaleString={getLocaleString}
          optionValue_version={optionValue_version}
          onOptionChange_version={this.onOptionChange_version}
          optionValue_modeNBTOrMapdat={optionValue_modeNBTOrMapdat}
          onOptionChange_modeNBTOrMapdat={this.onOptionChange_modeNBTOrMapdat}
          optionValue_mapSize_x={optionValue_mapSize_x}
          onOptionChange_mapSize_x={this.onOptionChange_mapSize_x}
          optionValue_mapSize_y={optionValue_mapSize_y}
          onOptionChange_mapSize_y={this.onOptionChange_mapSize_y}
          optionValue_cropImage={optionValue_cropImage}
          onOptionChange_cropImage={this.onOptionChange_cropImage}
          optionValue_showGridOverlay={optionValue_showGridOverlay}
          onOptionChange_showGridOverlay={this.onOptionChange_showGridOverlay}
          optionValue_staircasing={optionValue_staircasing}
          onOptionChange_staircasing={this.onOptionChange_staircasing}
          optionValue_whereSupportBlocks={optionValue_whereSupportBlocks}
          onOptionChange_WhereSupportBlocks={
            this.onOptionChange_WhereSupportBlocks
          }
          optionValue_supportBlock={optionValue_supportBlock}
          onOptionChange_SupportBlock={this.onOptionChange_SupportBlock}
          optionValue_unobtainable={optionValue_unobtainable}
          onOptionChange_unobtainable={this.onOptionChange_unobtainable}
          optionValue_transparency={optionValue_transparency}
          onOptionChange_transparency={this.onOptionChange_transparency}
          optionValue_betterColour={optionValue_betterColour}
          onOptionChange_BetterColour={this.onOptionChange_BetterColour}
          optionValue_dithering={optionValue_dithering}
          onOptionChange_dithering={this.onOptionChange_dithering}
          optionValue_preprocessingEnabled={optionValue_preprocessingEnabled}
          onOptionChange_PreProcessingEnabled={
            this.onOptionChange_PreProcessingEnabled
          }
          preProcessingValue_brightness={preProcessingValue_brightness}
          onOptionChange_PreProcessingBrightness={
            this.onOptionChange_PreProcessingBrightness
          }
          preProcessingValue_contrast={preProcessingValue_contrast}
          onOptionChange_PreProcessingContrast={
            this.onOptionChange_PreProcessingContrast
          }
          preProcessingValue_saturation={preProcessingValue_saturation}
          onOptionChange_PreProcessingSaturation={
            this.onOptionChange_PreProcessingSaturation
          }
          onViewOnlineClicked={this.onViewOnlineClicked}
          onGetNBTClicked={this.onGetNBTClicked}
          onGetNBTSplitClicked={this.onGetNBTSplitClicked}
          onGetMapdatSplitClicked={this.onGetMapdatSplitClicked}
          onGetPDNPaletteClicked={this.onGetPDNPaletteClicked}
        />
      </React.Fragment>
    );
  }
}

export default MapartController;
