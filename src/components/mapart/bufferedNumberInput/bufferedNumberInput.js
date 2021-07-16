import { Component } from "react";

import "./bufferedNumberInput.css";

class BufferedNumberInput extends Component {
  state = { buffer: null };

  constructor(props) {
    super(props);
    this.state.buffer = props.value;
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      this.setState({ buffer: value });
    }
  }

  onInputChange = (e) => {
    const { validators, onValidInput } = this.props;
    const newValue_buffer = e.target.value;
    const newValue_int = parseInt(newValue_buffer);
    this.setState({ buffer: newValue_buffer }, () => {
      if (
        validators.every((validator) => {
          return validator(newValue_int);
        })
      ) {
        onValidInput(newValue_int);
      }
    });
  };

  render() {
    const { min, max, step, style, disabled } = this.props;
    const { buffer } = this.state;
    return <input type="number" min={min} max={max} step={step} value={buffer} onChange={this.onInputChange} disabled={disabled} style={style} />;
  }
}

export default BufferedNumberInput;
