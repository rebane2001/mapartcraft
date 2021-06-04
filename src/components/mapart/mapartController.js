import React, { Component } from "react";

import CookieManager from "../../cookieManager";
import BlockSelection from "./blockSelection";
import MapPreview from "./mapPreview";
import MapSettings from "./mapSettings";
import Materials from "./materials";
import defaultPresets from "./defaultPresets.json";
import coloursJSON from "./coloursJSON.json";
import DitherMethods from "./ditherMethods.json";

import IMG_Upload from "../../images/upload.png";

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
    optionValue_whereSupportBlocks: "AllOptimized",
    optionValue_supportBlock: "cobblestone",
    optionValue_unobtainable: true,
    optionValue_transparency: true,
    optionValue_transparencyTolerance: 128,
    optionValue_betterColour: true,
    optionValue_dithering: DitherMethods.FloydSteinberg.uniqueId,
    optionValue_preprocessingEnabled: false,
    preProcessingValue_brightness: 100,
    preProcessingValue_contrast: 100,
    preProcessingValue_saturation: 100,
    preProcessingValue_backgroundColourSelect: "Off",
    preProcessingValue_backgroundColour: "#151515",
    uploadedImage: null,
    uploadedImage_baseFilename: null,
    presets: [],
    selectedPresetName: "None",
    currentMaterialsData: {
      maps: [[]], // entries are dictionaries with keys "materials", "supportBlockCount", "coloursLayout"
      currentSelectedBlocks: {}, // we keep this soley for materials.js
    },
    mapPreviewWorker_inProgress: false,
  };

  supportedVersions = [
    { MCVersion: "1.12.2", NBTVersion: 1343 },
    { MCVersion: "1.13.2", NBTVersion: 1631 },
    { MCVersion: "1.14.4", NBTVersion: 1976 },
    { MCVersion: "1.15.2", NBTVersion: 2230 },
    { MCVersion: "1.16.5", NBTVersion: 2586 },
  ];

  constructor(props) {
    super(props);
    this.state.presets = JSON.parse(CookieManager.touchCookie("presets", JSON.stringify(defaultPresets)));
    Object.keys(coloursJSON).forEach((key) => (this.state.selectedBlocks[key] = "-1"));
    const cookieMCVersion = CookieManager.touchCookie("mcversion", this.supportedVersions[0].MCVersion);
    if (this.supportedVersions.find((supportedVersion) => supportedVersion.MCVersion === cookieMCVersion)) {
      this.state.optionValue_version = cookieMCVersion;
    } else {
      this.state.optionValue_version = this.supportedVersions[0].MCVersion;
    }
    const URLParams = new URL(window.location).searchParams;
    if (URLParams.has("preset")) {
      const decodedPresetBlocks = this.URLToPreset(URLParams.get("preset"));
      if (decodedPresetBlocks !== null) {
        this.state.selectedBlocks = decodedPresetBlocks;
      }
    }
  }

  eventListener_dragover = (e) => {
    // this has to be here for drop event to work
    e.preventDefault();
    e.stopPropagation();
  };

  eventListener_drop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      const imgUrl = URL.createObjectURL(file);
      this.loadUploadedImageFromURL(imgUrl, "mapart");
    }
  };

  eventListener_paste = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.clipboardData.files;
    if (files.length) {
      const file = files[0];
      const imgUrl = URL.createObjectURL(file);
      this.loadUploadedImageFromURL(imgUrl, "mapart");
    }
  };

  componentDidMount() {
    this.loadUploadedImageFromURL(IMG_Upload, "mapart");

    document.addEventListener("dragover", this.eventListener_dragover);
    document.addEventListener("drop", this.eventListener_drop);

    document.addEventListener("paste", this.eventListener_paste);
  }

  componentWillUnmount() {
    document.removeEventListener("dragover", this.eventListener_dragover);
    document.removeEventListener("drop", this.eventListener_drop);
    document.removeEventListener("paste", this.eventListener_paste);
  }

  onFileDialogEvent = (e) => {
    const files = e.target.files;
    if (!files.length) {
      return;
    } else {
      const file = files[0];
      const imgUrl = URL.createObjectURL(file);
      this.loadUploadedImageFromURL(imgUrl, file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  loadUploadedImageFromURL(imageURL, baseFilename) {
    const img = new Image();
    img.onload = () => {
      this.setState({
        uploadedImage: img,
        uploadedImage_baseFilename: baseFilename,
      });
    };
    img.src = imageURL;
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
        colourSetId in coloursJSON &&
        blockId in coloursJSON[colourSetId]["blocks"] &&
        Object.keys(coloursJSON[colourSetId]["blocks"][blockId]["validVersions"]).includes(optionValue_version)
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
    CookieManager.setCookie("mcversion", version);
    this.setState((currentState) => {
      let selectedBlocks = { ...currentState.selectedBlocks };
      Object.keys(coloursJSON).forEach((key) => {
        if (selectedBlocks[key] !== "-1" && !Object.keys(coloursJSON[key]["blocks"][selectedBlocks[key]]["validVersions"]).includes(version)) {
          selectedBlocks[key] = "-1";
        }
      });
      return { optionValue_version: version, selectedBlocks };
    });
  };

  onOptionChange_mapSize_x = (e) => {
    let x = parseInt(e.target.value);
    if (isNaN(x)) {
      x = 1;
    }
    this.setState({ optionValue_mapSize_x: x });
  };

  onOptionChange_mapSize_y = (e) => {
    let y = parseInt(e.target.value);
    if (isNaN(y)) {
      y = 1;
    }
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

  onOptionChange_transparencyTolerance = (e) => {
    const transparencyTolerance = parseInt(e.target.value);
    this.setState({
      optionValue_transparencyTolerance: transparencyTolerance,
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

  setOption_SupportBlock = (text) => {
    this.setState({ optionValue_supportBlock: text });
  };

  onOptionChange_PreProcessingEnabled = () => {
    this.setState({
      optionValue_preprocessingEnabled: !this.state.optionValue_preprocessingEnabled,
    });
  };

  onOptionChange_PreProcessingBrightness = (e) => {
    let newValue = parseInt(e.target.value);
    if (isNaN(newValue)) {
      newValue = 0;
    }
    this.setState({ preProcessingValue_brightness: newValue });
  };

  onOptionChange_PreProcessingContrast = (e) => {
    let newValue = parseInt(e.target.value);
    if (isNaN(newValue)) {
      newValue = 0;
    }
    this.setState({ preProcessingValue_contrast: newValue });
  };

  onOptionChange_PreProcessingSaturation = (e) => {
    let newValue = parseInt(e.target.value);
    if (isNaN(newValue)) {
      newValue = 0;
    }
    this.setState({ preProcessingValue_saturation: newValue });
  };

  onOptionChange_PreProcessingBackgroundColourSelect = (e) => {
    const newValue = e.target.value;
    this.setState({ preProcessingValue_backgroundColourSelect: newValue });
  };

  onOptionChange_PreProcessingBackgroundColour = (e) => {
    const newValue = e.target.value;
    this.setState({ preProcessingValue_backgroundColour: newValue });
  };

  onViewOnlineClicked = (e) => {
    console.log(e);
    //TODO
  };

  downloadBlobFile(data, mimeType, filename) {
    const downloadBlob = new Blob([data], { type: mimeType });
    const downloadURL = window.URL.createObjectURL(downloadBlob);
    const downloadElt = document.createElement("a");
    downloadElt.style = "display: none";
    downloadElt.href = downloadURL;
    downloadElt.download = filename;
    document.body.appendChild(downloadElt);
    downloadElt.click();
    window.URL.revokeObjectURL(downloadURL);
    document.body.removeChild(downloadElt);
  }

  handleGetPDNPaletteClicked = () => {
    const { getLocaleString } = this.props;
    const { selectedBlocks, optionValue_staircasing } = this.state;
    let paletteText =
      "; paint.net Palette File\n; Generated by MapartCraft\n; Link to preset: " +
      this.presetToURL() +
      "\n; staircasing: " +
      (optionValue_staircasing === "off" ? "disabled" : "enabled") +
      "\n";
    let numberOfColoursExported = 0;
    const toneKeysToExport = optionValue_staircasing === "off" ? ["normal"] : ["dark", "normal", "light"];
    Object.keys(selectedBlocks).forEach((key) => {
      if (selectedBlocks[key] !== "-1") {
        let colours = coloursJSON[key]["tonesRGB"];
        toneKeysToExport.forEach((toneKeyToExport) => {
          numberOfColoursExported += 1;
          paletteText += "FF";
          for (let i = 0; i < 3; i++) {
            paletteText += Number(colours[toneKeyToExport][i]).toString(16).padStart(2, "0").toUpperCase();
          }
          paletteText += "\n";
        });
      }
    });
    if (numberOfColoursExported === 0) {
      alert(getLocaleString("BLOCK-SELECTION/PRESETS/DOWNLOAD-WARNING-NONE-SELECTED"));
      return;
    } else if (numberOfColoursExported > 96) {
      alert(
        `${getLocaleString("BLOCK-SELECTION/PRESETS/DOWNLOAD-WARNING-MAX-COLOURS-1")}${numberOfColoursExported.toString()}${getLocaleString(
          "BLOCK-SELECTION/PRESETS/DOWNLOAD-WARNING-MAX-COLOURS-2"
        )}`
      );
    }
    this.downloadBlobFile(paletteText, "text/plain", "MapartcraftPalette.txt");
  };

  handlePresetChange = (e) => {
    const presetName = e.target.value;
    const { presets } = this.state;

    this.setState({ selectedPresetName: presetName });

    if (presetName === "None") {
      this.handleChangeColourSetBlocks([]);
    } else {
      const selectedPreset = presets.find((preset) => preset["name"] === presetName);
      if (selectedPreset !== undefined) {
        this.handleChangeColourSetBlocks(selectedPreset["blocks"]);
      }
    }
  };

  handleDeletePreset = () => {
    const { presets, selectedPresetName } = this.state;

    const presets_new = presets.filter((preset) => preset["name"] !== selectedPresetName);
    this.setState({
      presets: presets_new,
      selectedPresetName: "None",
    });
    CookieManager.setCookie("presets", JSON.stringify(presets_new));
  };

  handleSavePreset = () => {
    const { getLocaleString } = this.props;
    const { presets, selectedBlocks } = this.state;

    let presetToSave_name = prompt(getLocaleString("BLOCK-SELECTION/PRESETS/SAVE-PROMPT-ENTER-NAME"), "");
    if (presetToSave_name === null) {
      return;
    }

    const otherPresets = presets.filter((preset) => preset["name"] !== presetToSave_name);
    let newPreset = { name: presetToSave_name, blocks: [] };
    Object.keys(selectedBlocks).forEach((key) => {
      if (selectedBlocks[key] !== "-1") {
        newPreset["blocks"].push([parseInt(key), parseInt(selectedBlocks[key])]);
      }
    });
    const presets_new = [...otherPresets, newPreset];
    this.setState({
      presets: presets_new,
      selectedPresetName: presetToSave_name,
    });
    CookieManager.setCookie("presets", JSON.stringify(presets_new));
  };

  presetToURL = () => {
    // Colour Set Id encoded in base 36 as [0-9a-z]
    // Block Id encoded in modified base 26 as [Q-ZA-P]
    const { selectedBlocks } = this.state;
    let presetQueryString = "";
    Object.keys(selectedBlocks).forEach((key) => {
      if (selectedBlocks[key] !== "-1") {
        presetQueryString += parseInt(key).toString(36);
        presetQueryString += coloursJSON[key]["blocks"][selectedBlocks[key]]["presetIndex"]
          .toString(26)
          .toUpperCase()
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

  handleSharePreset = () => {
    const { getLocaleString } = this.props;
    const { selectedBlocks } = this.state;
    if (Object.keys(selectedBlocks).every((colourSetId) => selectedBlocks[colourSetId] === "-1")) {
      alert(getLocaleString("BLOCK-SELECTION/PRESETS/SHARE-WARNING-NONE-SELECTED"));
    } else {
      prompt(getLocaleString("BLOCK-SELECTION/PRESETS/SHARE-LINK"), this.presetToURL());
    }
  };

  URLToPreset = (encodedPreset) => {
    const { onCorruptedPreset } = this.props;
    const { optionValue_version } = this.state;
    if (encodedPreset === "dQw4w9WgXcQ") {
      window.location.replace("https://www.youtube.com/watch?v=cZ5wOPinZd4");
      return;
    }
    if (!/^[0-9a-zQ-ZA-P]*$/g.test(encodedPreset)) {
      onCorruptedPreset();
      return null;
    }
    let selectedBlocks = { ...this.state.selectedBlocks };
    let presetRegex = /([0-9a-z]+)(?=([Q-ZA-P]+))/g;
    let match;
    while ((match = presetRegex.exec(encodedPreset)) !== null) {
      const encodedColourSetId = match[1];
      const encodedBlockId = match[2];
      const decodedColourSetId = parseInt(encodedColourSetId, 36).toString();
      const decodedPresetIndex = parseInt(
        encodedBlockId
          .replace(/[Q-Z]/g, (match) => {
            return {
              Q: "0",
              R: "1",
              S: "2",
              T: "3",
              U: "4",
              V: "5",
              W: "6",
              X: "7",
              Y: "8",
              Z: "9",
            }[match];
          })
          .toLowerCase(),
        26
      );
      if (!(decodedColourSetId in coloursJSON)) {
        continue;
      }
      const decodedBlock = Object.entries(coloursJSON[decodedColourSetId]["blocks"]).find((elt) => elt[1]["presetIndex"] === decodedPresetIndex);
      if (decodedBlock === undefined) {
        continue;
      }
      const decodedBlockId = decodedBlock[0].toString();
      if (Object.keys(coloursJSON[decodedColourSetId]["blocks"][decodedBlockId]["validVersions"]).includes(optionValue_version)) {
        selectedBlocks[decodedColourSetId] = decodedBlockId;
      }
    }
    return selectedBlocks;
  };

  onMapPreviewWorker_begin = () => {
    this.setState({ mapPreviewWorker_inProgress: true });
  };

  handleSetMapMaterials = (currentMaterialsData) => {
    this.setState({ currentMaterialsData: currentMaterialsData, mapPreviewWorker_inProgress: false });
  };

  render() {
    const { supportedVersions } = this;
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
      optionValue_transparencyTolerance,
      optionValue_betterColour,
      optionValue_dithering,
      optionValue_preprocessingEnabled,
      preProcessingValue_brightness,
      preProcessingValue_contrast,
      preProcessingValue_saturation,
      preProcessingValue_backgroundColourSelect,
      preProcessingValue_backgroundColour,
      uploadedImage,
      uploadedImage_baseFilename,
      presets,
      selectedPresetName,
      currentMaterialsData,
      mapPreviewWorker_inProgress,
    } = this.state;
    return (
      <div className="mapartController">
        <BlockSelection
          getLocaleString={getLocaleString}
          onChangeColourSetBlock={this.handleChangeColourSetBlock}
          optionValue_version={optionValue_version}
          optionValue_modeNBTOrMapdat={optionValue_modeNBTOrMapdat}
          optionValue_staircasing={optionValue_staircasing}
          optionValue_unobtainable={optionValue_unobtainable}
          selectedBlocks={selectedBlocks}
          presets={presets}
          selectedPresetName={selectedPresetName}
          onPresetChange={this.handlePresetChange}
          onDeletePreset={this.handleDeletePreset}
          onSavePreset={this.handleSavePreset}
          onSharePreset={this.handleSharePreset}
          onGetPDNPaletteClicked={this.handleGetPDNPaletteClicked}
        />
        <div className="sectionsPreviewSettingsMaterials">
          <MapPreview
            getLocaleString={getLocaleString}
            selectedBlocks={selectedBlocks}
            optionValue_version={optionValue_version}
            optionValue_modeNBTOrMapdat={optionValue_modeNBTOrMapdat}
            optionValue_mapSize_x={optionValue_mapSize_x}
            optionValue_mapSize_y={optionValue_mapSize_y}
            optionValue_cropImage={optionValue_cropImage}
            optionValue_showGridOverlay={optionValue_showGridOverlay}
            optionValue_staircasing={optionValue_staircasing}
            optionValue_whereSupportBlocks={optionValue_whereSupportBlocks}
            optionValue_unobtainable={optionValue_unobtainable}
            optionValue_transparency={optionValue_transparency}
            optionValue_transparencyTolerance={optionValue_transparencyTolerance}
            optionValue_betterColour={optionValue_betterColour}
            optionValue_dithering={optionValue_dithering}
            optionValue_preprocessingEnabled={optionValue_preprocessingEnabled}
            preProcessingValue_brightness={preProcessingValue_brightness}
            preProcessingValue_contrast={preProcessingValue_contrast}
            preProcessingValue_saturation={preProcessingValue_saturation}
            preProcessingValue_backgroundColourSelect={preProcessingValue_backgroundColourSelect}
            preProcessingValue_backgroundColour={preProcessingValue_backgroundColour}
            uploadedImage={uploadedImage}
            onFileDialogEvent={this.onFileDialogEvent}
            onGetMapMaterials={this.handleSetMapMaterials}
            onMapPreviewWorker_begin={this.onMapPreviewWorker_begin}
          />
          <MapSettings
            getLocaleString={getLocaleString}
            supportedVersions={supportedVersions}
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
            onOptionChange_WhereSupportBlocks={this.onOptionChange_WhereSupportBlocks}
            optionValue_supportBlock={optionValue_supportBlock}
            setOption_SupportBlock={this.setOption_SupportBlock}
            optionValue_unobtainable={optionValue_unobtainable}
            onOptionChange_unobtainable={this.onOptionChange_unobtainable}
            optionValue_transparency={optionValue_transparency}
            onOptionChange_transparency={this.onOptionChange_transparency}
            optionValue_transparencyTolerance={optionValue_transparencyTolerance}
            onOptionChange_transparencyTolerance={this.onOptionChange_transparencyTolerance}
            optionValue_betterColour={optionValue_betterColour}
            onOptionChange_BetterColour={this.onOptionChange_BetterColour}
            optionValue_dithering={optionValue_dithering}
            onOptionChange_dithering={this.onOptionChange_dithering}
            optionValue_preprocessingEnabled={optionValue_preprocessingEnabled}
            onOptionChange_PreProcessingEnabled={this.onOptionChange_PreProcessingEnabled}
            preProcessingValue_brightness={preProcessingValue_brightness}
            onOptionChange_PreProcessingBrightness={this.onOptionChange_PreProcessingBrightness}
            preProcessingValue_contrast={preProcessingValue_contrast}
            onOptionChange_PreProcessingContrast={this.onOptionChange_PreProcessingContrast}
            preProcessingValue_saturation={preProcessingValue_saturation}
            onOptionChange_PreProcessingSaturation={this.onOptionChange_PreProcessingSaturation}
            preProcessingValue_backgroundColourSelect={preProcessingValue_backgroundColourSelect}
            onOptionChange_PreProcessingBackgroundColourSelect={this.onOptionChange_PreProcessingBackgroundColourSelect}
            preProcessingValue_backgroundColour={preProcessingValue_backgroundColour}
            onOptionChange_PreProcessingBackgroundColour={this.onOptionChange_PreProcessingBackgroundColour}
            uploadedImage_baseFilename={uploadedImage_baseFilename}
            currentMaterialsData={currentMaterialsData}
            mapPreviewWorker_inProgress={mapPreviewWorker_inProgress}
            downloadBlobFile={this.downloadBlobFile}
            onViewOnlineClicked={this.onViewOnlineClicked}
          />
          {optionValue_modeNBTOrMapdat === "NBT" ? (
            <Materials
              getLocaleString={getLocaleString}
              optionValue_version={optionValue_version}
              optionValue_supportBlock={optionValue_supportBlock}
              currentMaterialsData={currentMaterialsData}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default MapartController;
