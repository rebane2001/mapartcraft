import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import BlockSelection from "./blockSelection";
import MapPreview from "./mapPreview";
import MapSettings from "./mapSettings";
import defaultPresets from "./defaultPresets.json";
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
    customPresets: [],
    selectedPresetName: defaultPresets[0]["name"],
  };

  constructor(props) {
    super(props);
    this.state.customPresets = JSON.parse(
      CookieManager.touchCookie("customPresets", "[]")
    );
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

  handleGetPDNPaletteClicked = () => {
    const { getLocaleString } = this.props;
    const { selectedBlocks, optionValue_staircasing } = this.state;
    let paletteText =
      "; paint.net Palette File\n; Generated by MapartCraft\n; Link to preset: " +
      this.generatePresetURL() +
      "\n; staircasing: " +
      (optionValue_staircasing === "off" ? "disabled" : "enabled") +
      "\n";
    let numberOfColoursExported = 0;
    const toneKeysToExport =
      optionValue_staircasing === "off"
        ? ["normal"]
        : ["dark", "normal", "light"];
    // NB: unobtainable never included since palette is mainly for survival? TODO: ask others for consensus
    Object.keys(selectedBlocks).forEach((key) => {
      if (selectedBlocks[key] !== "-1") {
        let colours = coloursJSON[key]["tonesRGB"];
        toneKeysToExport.forEach((toneKeyToExport) => {
          numberOfColoursExported += 1;
          paletteText += "FF";
          for (let i = 0; i < 3; i++) {
            paletteText += Number(colours[toneKeyToExport][i])
              .toString(16)
              .padStart(2, "0")
              .toUpperCase();
          }
          paletteText += "\n";
        });
      }
    });
    if (numberOfColoursExported > 96) {
      alert(
        getLocaleString("PDNWARNING1") +
          numberOfColoursExported.toString() +
          getLocaleString("PDNWARNING2")
      );
    }
    if (numberOfColoursExported === 0) {
      alert(getLocaleString("SELECTBLOCKSWARNING-DOWNLOAD"));
      return;
    }
    const downloadBlob = new Blob([paletteText], { type: "text/plain" });
    const downloadURL = window.URL.createObjectURL(downloadBlob);
    const downloadElt = document.createElement("a");
    downloadElt.style = "display: none";
    downloadElt.href = downloadURL;
    downloadElt.download = "MapartcraftPalette.txt";
    document.body.appendChild(downloadElt);
    downloadElt.click();
    window.URL.revokeObjectURL(downloadURL);
    document.body.removeChild(downloadElt);
  };

  handlePresetChange = (e) => {
    const presetName = e.target.value;
    const { customPresets } = this.state;

    this.setState({ selectedPresetName: presetName });

    const defaultPreset = defaultPresets.find(
      (preset) => preset["name"] === presetName
    );
    if (defaultPreset !== undefined) {
      this.handleChangeColourSetBlocks(defaultPreset["blocks"]);
      return;
    }

    const customPreset = customPresets.find(
      (preset) => preset["name"] === presetName
    );
    if (customPreset !== undefined) {
      this.handleChangeColourSetBlocks(customPreset["blocks"]);
      return;
    }
  };

  handleDeletePreset = () => {
    const { customPresets, selectedPresetName } = this.state;
    if (
      !customPresets.find((preset) => preset["name"] === selectedPresetName)
    ) {
      // if a default preset selected then do nothing and return
      return;
    }

    const customPresets_new = customPresets.filter(
      (preset) => preset["name"] !== selectedPresetName
    );
    this.setState({
      customPresets: customPresets_new,
      selectedPresetName: defaultPresets[0]["name"],
    });
    CookieManager.setCookie("customPresets", JSON.stringify(customPresets_new));
  };

  handleSavePreset = () => {
    const { getLocaleString } = this.props;
    const { customPresets, selectedBlocks } = this.state;

    let presetName = prompt(getLocaleString("PRESETS-ENTERNAME"), "");
    if (presetName === null) {
      return;
    }

    const otherPresets = customPresets.filter(
      (preset) => preset["name"] !== presetName
    );
    let newPreset = { name: presetName, blocks: [] };
    Object.keys(selectedBlocks).forEach((key) => {
      newPreset["blocks"].push([parseInt(key), parseInt(selectedBlocks[key])]);
    });
    const customPresets_new = [...otherPresets, newPreset];
    this.setState({
      customPresets: customPresets_new,
      selectedPresetName: presetName,
    });
    CookieManager.setCookie("customPresets", JSON.stringify(customPresets_new));
  };

  generatePresetURL = () => {
    // Colour Set Id encoded in base 36 as [0-9a-z]
    // Block Id encoded in modified base 26 as [Q-ZA-P]
    const { selectedBlocks } = this.state;
    let presetQueryString = "";
    Object.keys(selectedBlocks).forEach((key) => {
      if (selectedBlocks[key] !== "-1") {
        presetQueryString += parseInt(key).toString(36);
        presetQueryString += parseInt(selectedBlocks[key])
          .toString(26)
          .replace(/[0-9]/g, (match) => {
            return {
              0: "Q",
              1: "R",
              2: "S",
              3: "T",
              4: "U",
              5: "V",
              6: "W",
              7: "X",
              8: "Y",
              9: "Z",
            }[match];
          });
      }
    });
    return "https://rebane2001.com/mapartcraft/?preset=" + presetQueryString;
  };

  handleSharePreset = (e) => {
    console.log(e);
    //TODO
  };

  handleImportPreset = (e) => {
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
      customPresets,
      selectedPresetName,
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
          customPresets={customPresets}
          selectedPresetName={selectedPresetName}
          onPresetChange={this.handlePresetChange}
          onDeletePreset={this.handleDeletePreset}
          onSavePreset={this.handleSavePreset}
          onSharePreset={this.handleSharePreset}
          onImportPreset={this.handleImportPreset}
          onGetPDNPaletteClicked={this.handleGetPDNPaletteClicked}
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
        />
      </React.Fragment>
    );
  }
}

export default MapartController;
