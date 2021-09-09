import React, { Component } from "react";

import BlockImage from "../blockImage";

import "./autoCompleteInputBlockToAdd.css";

class AutoCompleteInputBlockToAdd extends Component {
  state = { suggestionSelected: true };

  getRelevantSuggestions = () => {
    const { coloursJSON, value, optionValue_version } = this.props;
    let suggestions_prefix = [];
    let suggestions_includes = [];

    for (const [colourSetId, colourSet] of Object.entries(coloursJSON)) {
      for (const [blockId, block] of Object.entries(colourSet.blocks)) {
        if (!(optionValue_version.MCVersion in block.validVersions)) {
          continue;
        }
        let blockNBTData = block.validVersions[optionValue_version.MCVersion];
        if (typeof blockNBTData === "string") {
          // this is of the form eg "&1.12.2"
          blockNBTData = block.validVersions[blockNBTData.slice(1)];
        }
        if (!block.supportBlockMandatory) {
          // no gravity affected blocks etc for support / noobline
          if (blockNBTData.NBTName.startsWith(value)) {
            suggestions_prefix.push({
              blockName: blockNBTData.NBTName,
              colourSetId,
              blockId,
            });
          } else if (blockNBTData.NBTName.includes(value)) {
            suggestions_includes.push({
              blockName: blockNBTData.NBTName,
              colourSetId,
              blockId,
            });
          }
        }
      }
    }
    return suggestions_prefix.concat(suggestions_includes);
  };

  handleTextChange = (e) => {
    const newValue = e.target.value.replace(" ", "_").toLowerCase();
    this.props.setValue(newValue);
  };

  onSuggestionClicked = (suggestion) => {
    this.props.setValue(suggestion.blockName);
    this.setState({ suggestionSelected: true });
  };

  onFocus = () => {
    this.setState({ suggestionSelected: false });
  };

  render() {
    const { coloursJSON, value } = this.props;
    const { suggestionSelected } = this.state;

    const relevantSuggestions = this.getRelevantSuggestions();

    return (
      <React.Fragment>
        <input type="text" value={value} onChange={this.handleTextChange} onFocus={this.onFocus} onClick={this.onFocus} />
        <table className={"blockToAddSuggestions"} style={{ display: suggestionSelected || relevantSuggestions.length === 0 ? "none" : "table" }}>
          <tbody>
            {relevantSuggestions.map((suggestion) => (
              <tr
                className={"blockToAddSuggestion"}
                key={`${suggestion.colourSetId}$_${suggestion.blockId}_${suggestion.blockName}`}
                onClick={() => this.onSuggestionClicked(suggestion)}
              >
                <th>
                  <BlockImage coloursJSON={coloursJSON} colourSetId={suggestion.colourSetId} blockId={suggestion.blockId} />
                </th>
                <th>{suggestion.blockName}</th>
              </tr>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default AutoCompleteInputBlockToAdd;
