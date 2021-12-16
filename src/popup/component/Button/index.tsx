import cx from "classnames";
import React, { Component } from "react";
import "./index.scss";

export const BUTTON_TYPE_CANCEL = "BUTTON_TYPE_CANCEL"
export const BUTTON_TYPE_CONFIRM = "BUTTON_TYPE_CONFIRM"
export const BUTTON_TYPE_HOME_BUTTON = "BUTTON_TYPE_HOME_BUTTON"
export const BUTTON_TYPE_COMMON_BUTTON = "BUTTON_TYPE_COMMON_BUTTON"



export const BUTTON_TYPE_SMALL = "BUTTON_TYPE_SMALL"
export default class Button extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let { content, onClick, disabled, propsClass, buttonType, imgLeft } = this.props
        let currentClassName = ""
        switch (buttonType) {
            case BUTTON_TYPE_COMMON_BUTTON:
            default:
                currentClassName = cx("click-cursor",{
                    "common-button": true,
                    [propsClass]: true,
                    "click-cursor": !disabled,
                    "click-cursor-disable": disabled,
                })
                break;
        }
        return (
            <button
                disabled={disabled}
                className={currentClassName}
                onClick={onClick}>
                {imgLeft ? this.props.children : <></>}
                {content}
                {!imgLeft ? this.props.children : <></>}
            </button>
        );
    }
}