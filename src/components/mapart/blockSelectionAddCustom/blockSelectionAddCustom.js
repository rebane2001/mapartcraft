import React, { Component } from "react";

import SupportedVersions from "../json/supportedVersions.json";

import "./blockSelectionAddCustom.css";

class BlockSelectionAddCustom extends Component {
  state = {
    block_name: "",
    block_nbtTags: [["", ""]],
    block_colourSetId: null,
    block_needsSupport: false,
    block_flammable: false,
    block_versions: {},
  };

  E_KeyOrValue = {
    key: 0,
    value: 1,
  };

  examplesGroups = [
    {
      title: "Stairs",
      blocks: [
        {
          blockName: "birch_stairs",
          nbtTags: {
            facing: "north|east|south|west",
            half: "top|bottom",
          },
          versions: ["1_12_2", "1_13_2", "1_14_4", "1_15_2", "1_16_5", "1_17_1"],
        },
      ],
    },
    {
      title: "Slabs",
      blocks: [
        {
          blockName: "stone_slab",
          nbtTags: {
            variant: "cobblestone",
            half: "top|bottom",
          },
          versions: ["1_12_2"],
        },
        {
          blockName: "cobblestone_slab",
          nbtTags: {
            type: "top|bottom",
          },
          versions: ["1_13_2", "1_14_4", "1_15_2", "1_16_5", "1_17_1"],
        },
      ],
    },
    {
      title: "'Alpha slabs'",
      blocks: [
        {
          blockName: "stone_slab",
          nbtTags: {
            variant: "wood_old",
            half: "top|bottom",
          },
          versions: ["1_12_2"],
        },
        {
          blockName: "petrified_oak_slab",
          nbtTags: {
            type: "top|bottom",
          },
          versions: ["1_13_2", "1_14_4", "1_15_2", "1_16_5", "1_17_1"],
        },
      ],
    },
  ];

  constructor(props) {
    super(props);
    const { coloursJSON } = props;
    this.state.block_colourSetId = Object.keys(coloursJSON)[0];
    for (const supportedVersion_key of Object.keys(SupportedVersions)) {
      this.state.block_versions[supportedVersion_key] = false;
    }
  }

  componentDidUpdate(prevProps) {
    const { lastSelectedCustomBlock } = this.props;
    if (prevProps.lastSelectedCustomBlock !== lastSelectedCustomBlock) {
      this.loadBlockIntoForm(lastSelectedCustomBlock.colourSetId, lastSelectedCustomBlock.blockId);
    }
  }

  loadBlockIntoForm(colourSetId, blockId) {
    const { coloursJSON } = this.props;
    const blockToLoad = coloursJSON[colourSetId].blocks[blockId];
    let blockToLoad_nbtTags = [];
    const versionToLoad_nbtData = Object.values(blockToLoad.validVersions).find((version) => typeof version !== "string");
    for (const [nbtTag_key, nbtTag_value] of Object.entries(versionToLoad_nbtData.NBTArgs)) {
      blockToLoad_nbtTags.push([nbtTag_key, nbtTag_value]);
    }
    blockToLoad_nbtTags.push(["", ""]);
    const blockToLoad_versions = {};
    for (const [supportedVersion_key, supportedVersion_value] of Object.entries(SupportedVersions)) {
      if (supportedVersion_value.MCVersion in blockToLoad.validVersions) {
        blockToLoad_versions[supportedVersion_key] = true;
      } else {
        blockToLoad_versions[supportedVersion_key] = false;
      }
    }
    this.setState({
      block_name: versionToLoad_nbtData.NBTName,
      block_nbtTags: blockToLoad_nbtTags,
      block_colourSetId: colourSetId,
      block_needsSupport: blockToLoad.supportBlockMandatory,
      block_flammable: blockToLoad.flammable,
      block_versions: blockToLoad_versions,
    });
  }

  onSettingChange_block_name = (e) => {
    this.setState({ block_name: e.target.value });
  };

  onSettingChange_block_nbtTags = (e, tagIndex, keyOrValue) => {
    const { block_nbtTags } = this.state;
    let block_nbtTags_new = [...block_nbtTags];
    block_nbtTags_new[tagIndex][keyOrValue] = e.target.value;
    if (
      tagIndex === block_nbtTags_new.length - 2 &&
      block_nbtTags_new[block_nbtTags_new.length - 2].every((t) => t === "") &&
      block_nbtTags_new[block_nbtTags_new.length - 1].every((t) => t === "")
    ) {
      // remove last tags inputs if they are empty and we have just made the penultimate tag inputs empty
      block_nbtTags_new.pop();
    } else if (tagIndex === block_nbtTags_new.length - 1) {
      // always keep a blank set of inputs at the end for further tags
      block_nbtTags_new.push(["", ""]);
    }
    this.setState({ block_nbtTags: block_nbtTags_new });
  };

  onSettingChange_block_colourSetId = (e) => {
    this.setState({ block_colourSetId: e.target.value });
  };

  onSettingChange_block_needsSupport = () => {
    this.setState((currentState) => {
      return {
        block_needsSupport: !currentState.block_needsSupport,
      };
    });
  };

  onSettingChange_block_flammable = () => {
    this.setState((currentState) => {
      return {
        block_flammable: !currentState.block_flammable,
      };
    });
  };

  onSettingChange_block_versions = (versionToToggle) => {
    let block_versions_new = { ...this.state.block_versions };
    block_versions_new[versionToToggle] = !block_versions_new[versionToToggle];
    this.setState({ block_versions: block_versions_new });
  };

  render() {
    const { getLocaleString, coloursJSON, onAddCustomBlock, onDeleteCustomBlock } = this.props;
    const { block_name, block_nbtTags, block_colourSetId, block_needsSupport, block_flammable, block_versions } = this.state;
    const examples = (
      <details open={false}>
        <summary>{getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/EXAMPLES")}</summary>
        {this.examplesGroups.map((examplesGroup) => (
          <div key={examplesGroup.title}>
            <b>{examplesGroup.title}</b>
            {examplesGroup.blocks.map((block) => (
              <div
                key={block.blockName}
                style={{
                  outline: "0.1em solid white",
                  padding: "0.2em",
                  marginBlockStart: "0.2em",
                  marginBlockEnd: "0.2em",
                }}
              >
                <table>
                  <tbody>
                    <tr>
                      <th>
                        <b>
                          {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/BLOCK-NAME")}
                          {":"}
                        </b>{" "}
                      </th>
                      <td style={{ textAlign: "right" }}>
                        {"minecraft:"}
                        <input type="text" value={block.blockName} disabled={true} />
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <b>
                          {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/NBT-TAGS")}
                          {":"}
                        </b>{" "}
                      </th>
                      <td style={{ textAlign: "right" }}>
                        {Object.entries(block.nbtTags).map(([tagKey, tagValue]) => (
                          <div key={tagKey}>
                            <input type="text" value={tagKey} disabled={true} />
                            {":"}
                            <input type="text" value={tagValue} disabled={true} />
                            <br />
                          </div>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <b>
                          {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/VERSIONS")}
                          {":"}
                        </b>{" "}
                      </th>
                      <td>
                        {Object.entries(SupportedVersions).map(([supportedVersion_key, supportedVersion_value]) => (
                          <React.Fragment key={supportedVersion_key}>
                            <input type="checkbox" checked={block.versions.includes(supportedVersion_key)} disabled={true} />
                            {supportedVersion_value.MCVersion}{" "}
                          </React.Fragment>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
            <br />
          </div>
        ))}
      </details>
    );
    const setting_customBlock_name = (
      <tr>
        <th>
          <b>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/BLOCK-NAME")}
            {":"}
          </b>{" "}
        </th>
        <td style={{ textAlign: "right" }}>
          {"minecraft:"}
          <input type="text" value={block_name} onChange={this.onSettingChange_block_name} />
        </td>
      </tr>
    );
    const setting_customBlock_nbtTags = (
      <tr>
        <th>
          <b>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/NBT-TAGS")}
            {":"}
          </b>{" "}
        </th>
        <td style={{ textAlign: "right" }}>
          {block_nbtTags.map(([tagKey, tagValue], tagIndex) => (
            <div key={tagIndex}>
              <input type="text" value={tagKey} onChange={(e) => this.onSettingChange_block_nbtTags(e, tagIndex, this.E_KeyOrValue.key)} />
              {":"}
              <input type="text" value={tagValue} onChange={(e) => this.onSettingChange_block_nbtTags(e, tagIndex, this.E_KeyOrValue.value)} />
              <br />
            </div>
          ))}
        </td>
      </tr>
    );
    const setting_customBlock_colourSetId = (
      <tr>
        <th>
          <b>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/COLOUR-SET")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <select
            value={block_colourSetId}
            onChange={this.onSettingChange_block_colourSetId}
            style={{
              backgroundColor: `rgb(${coloursJSON[block_colourSetId].tonesRGB.normal.join(", ")})`,
              color:
                coloursJSON[block_colourSetId].tonesRGB.normal[0] * 0.299 +
                  coloursJSON[block_colourSetId].tonesRGB.normal[1] * 0.587 +
                  coloursJSON[block_colourSetId].tonesRGB.normal[2] * 0.114 >
                186
                  ? "black"
                  : "white",
            }}
          >
            {Object.entries(coloursJSON).map(([colourSetId, colourSet]) => (
              <option
                key={colourSetId}
                value={colourSetId}
                style={{
                  backgroundColor: `rgb(${colourSet.tonesRGB.normal.join(", ")})`,
                  color:
                    colourSet.tonesRGB.normal[0] * 0.299 + colourSet.tonesRGB.normal[1] * 0.587 + colourSet.tonesRGB.normal[2] * 0.114 > 186
                      ? "black"
                      : "white",
                }}
              >
                {colourSet.colourName}
              </option>
            ))}
          </select>
        </td>
      </tr>
    );
    const setting_customBlock_needsSupport = (
      <tr>
        <th>
          <b>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/NEEDS-SUPPORT")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <input type="checkbox" checked={block_needsSupport} onChange={this.onSettingChange_block_needsSupport} />
        </td>
      </tr>
    );
    const setting_customBlock_flammable = (
      <tr>
        <th>
          <b>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/FLAMMABLE")}
            {":"}
          </b>{" "}
        </th>
        <td>
          <input type="checkbox" checked={block_flammable} onChange={this.onSettingChange_block_flammable} />
        </td>
      </tr>
    );
    const setting_customBlock_versions = (
      <tr>
        <th>
          <b>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/VERSIONS")}
            {":"}
          </b>{" "}
        </th>
        <td>
          {Object.entries(block_versions).map(([block_version, block_version_checked]) => (
            <React.Fragment key={block_version}>
              <input type="checkbox" checked={block_version_checked} onChange={() => this.onSettingChange_block_versions(block_version)} />
              {SupportedVersions[block_version].MCVersion}{" "}
            </React.Fragment>
          ))}
        </td>
      </tr>
    );
    const customBlock_submit = (
      <tr>
        <th colSpan="2">
          <button
            style={{ width: "100%" }}
            onClick={() => onAddCustomBlock(block_colourSetId, block_name, block_nbtTags, block_versions, block_needsSupport, block_flammable)}
          >
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/ADD")}
          </button>
        </th>
      </tr>
    );
    const customBlock_delete = (
      <tr>
        <th colSpan="2">
          <button style={{ width: "100%" }} onClick={() => onDeleteCustomBlock(block_colourSetId, block_name, block_versions)}>
            {getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/DELETE")}
          </button>
        </th>
      </tr>
    );
    return (
      <details className="blockSelectionAddCustom" open={false}>
        <summary>{getLocaleString("BLOCK-SELECTION/ADD-CUSTOM/TITLE")}</summary>
        {examples}
        <table>
          <tbody>
            {setting_customBlock_name}
            {setting_customBlock_nbtTags}
            {setting_customBlock_colourSetId}
            {setting_customBlock_needsSupport}
            {setting_customBlock_flammable}
            {setting_customBlock_versions}
            {customBlock_submit}
            {customBlock_delete}
          </tbody>
        </table>
      </details>
    );
  }
}

export default BlockSelectionAddCustom;
