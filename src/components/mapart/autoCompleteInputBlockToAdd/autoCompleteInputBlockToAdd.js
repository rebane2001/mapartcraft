import React, { Component } from "react";

import BlockImage from "../blockImage";

import "./autoCompleteInputBlockToAdd.css";

class AutoCompleteInputBlockToAdd extends Component {
  state = {
    activeSuggestionIndex: -1,
    relevantSuggestions: [],
    suggestionSelected: true,
  };

  keyCodes = {
    ENTER: 13,
    UP: 38,
    DOWN: 40,
  };

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
    this.setState({
      relevantSuggestions: suggestions_prefix.concat(suggestions_includes),
    });
  };

  handleChange = (e) => {
    const newValue = e.target.value.replace(" ", "_").toLowerCase();
    this.props.setValue(newValue);
  };

  handleKeyDown = (e) => {
    const { activeSuggestionIndex, relevantSuggestions } = this.state;
    this.setState({
      suggestionSelected: false,
    });
    switch (e.keyCode) {
      case this.keyCodes.UP: {
        if (activeSuggestionIndex !== -1) {
          this.setState({ activeSuggestionIndex: activeSuggestionIndex - 1 });
        }
        break;
      }
      case this.keyCodes.DOWN: {
        if (activeSuggestionIndex !== relevantSuggestions.length - 1) {
          this.setState({ activeSuggestionIndex: activeSuggestionIndex + 1 });
        }
        break;
      }
      case this.keyCodes.ENTER: {
        if (activeSuggestionIndex !== -1) {
          this.props.setValue(relevantSuggestions[activeSuggestionIndex].blockName);
          this.setState({
            activeSuggestionIndex: -1,
            suggestionSelected: true,
          });
        }
        break;
      }
      default: {
        this.setState({
          activeSuggestionIndex: -1,
        });
        break;
      }
    }
  };

  onSuggestionClicked = (suggestion) => {
    this.props.setValue(suggestion.blockName);
    this.setState({
      activeSuggestionIndex: -1,
      suggestionSelected: true,
    });
  };

  onFocus = () => {
    this.setState({
      suggestionSelected: false,
    });
  };

  componentDidMount() {
    this.getRelevantSuggestions();
  }

  componentDidUpdate(prevProps) {
    const { value, optionValue_version } = this.props;
    if (prevProps.value !== value || prevProps.optionValue_version !== optionValue_version) {
      this.getRelevantSuggestions();
    }
  }

  render() {
    const { coloursJSON, value } = this.props;
    const { activeSuggestionIndex, relevantSuggestions, suggestionSelected } = this.state;

    return (
      <React.Fragment>
        <input type="text" value={value} onChange={this.handleChange} onKeyDown={this.handleKeyDown} onFocus={this.onFocus} onClick={this.onFocus} />
        <table className={"blockToAddSuggestions"} style={{ display: suggestionSelected || relevantSuggestions.length === 0 ? "none" : "table" }}>
          <tbody>
            {relevantSuggestions.map((suggestion, suggestionIndex) => (
              <tr
                className={suggestionIndex === activeSuggestionIndex ? "blockToAddSuggestion blockToAddSuggestion_active" : "blockToAddSuggestion"}
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
