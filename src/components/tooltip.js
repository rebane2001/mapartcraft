import React, { Component } from "react";

import "./tooltip.css";

class Tooltip extends Component {
  state = {
    hovering: false,
  };

  handleMouseOver = () => {
    this.setState({ hovering: true });
  };

  handleMouseOut = () => {
    this.setState({ hovering: false });
  };

  render() {
    const tooltipStyle = {
      display: this.state.hovering ? "unset" : "none",
    };
    return (
      <div className="tooltipContainer">
        <div
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
        >
          {this.props.children}
        </div>
        <div>
          <p className="tooltipText" style={tooltipStyle}>
            {this.props.tooltipText}
          </p>
        </div>
      </div>
    );
  }
}

export default Tooltip;
