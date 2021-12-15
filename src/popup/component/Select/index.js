import cx from "classnames";
import React, { Component } from "react";
import downArrow from "../../../assets/images/downArrow.png";
import "./index.scss";

export default class Select extends Component {
  constructor(props) {
    super(props);
    this.state = { isOpen: false };
    this.toggleContainer = React.createRef();
  }
  componentDidMount() {
    window.addEventListener("click", this.onClickOutsideHandler);
  }

  componentWillUnmount() {
    window.removeEventListener("click", this.onClickOutsideHandler);
  }

  onClickHandler = () => {
    this.setState(currentState => ({
      isOpen: !currentState.isOpen
    }));
  };

  onClickOutsideHandler = event => {
    if (
      this.state.isOpen &&
      !this.toggleContainer.current.contains(event.target)
    ) {
      this.setState({ isOpen: false });
    }
  };

  onChange = item => {
    this.setState({
      isOpen: false
    });
    this.props.onChange(item);
  };
  render() {
    const { isOpen } = this.state;
    const { label, options, defaultValue } = this.props;
    const { selfInputProps, selectArrowProps, optionsProps, itemProps } = this.props;
    return (
      <div className="select-box">
        {label && <label className="label">{label}:</label>}

        <div className="select" ref={this.toggleContainer}>
          <div
            onClick={this.onClickHandler}
            className={cx({
              "self-input": true,
              "input-hover": isOpen,
              "click-cursor": true,
              [selfInputProps]: !!selfInputProps
            })}>
            <p className={"self-input-item"}>
              {defaultValue}
            </p>
          </div>
          <img
            onClick={this.onClickHandler}
            className={cx("click-cursor", {
              "select-arrow": true,
              up: isOpen,
              down: !isOpen,
              [selectArrowProps]: !!selectArrowProps
            })} src={downArrow}></img>
          <div
            className={cx("options", {
              "options-hidden": !isOpen,
              [optionsProps]: !!optionsProps
            })}
          >
            {options &&
              options.map((item) => {
                return (
                  <div
                    key={item.key}
                    className={cx("item click-cursor", {
                      [itemProps]: !!itemProps
                    })}
                    onClick={this.onChange.bind(this, item)}
                  >
                    {item.value}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    );
  }
}
