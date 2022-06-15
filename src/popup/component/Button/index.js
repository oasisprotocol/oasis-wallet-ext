import cx from "classnames";
import React, { Component } from "react";
import "./index.scss";

export const BUTTON_TYPE_CANCEL = "BUTTON_TYPE_CANCEL"
export const BUTTON_TYPE_CONFIRM = "BUTTON_TYPE_CONFIRM"
export const BUTTON_TYPE_HOME_BUTTON = "BUTTON_TYPE_HOME_BUTTON"
export const BUTTON_TYPE_COMMON_BUTTON = "BUTTON_TYPE_COMMON_BUTTON"
export const BUTTON_TYPE_SMALL = "BUTTON_TYPE_SMALL"

/**
 * @typedef Props
 * @prop {React.ReactNode} content
 * @prop {React.MouseEventHandler<HTMLButtonElement>} onClick
 * @prop {boolean} [disabled]
 * @prop {string} [propsClass]
 * @prop {(
 *  | BUTTON_TYPE_CANCEL
 *  | BUTTON_TYPE_CONFIRM
 *  | BUTTON_TYPE_HOME_BUTTON
 *  | BUTTON_TYPE_COMMON_BUTTON
 *  | BUTTON_TYPE_SMALL
 * )} [buttonType]
 * @prop {boolean} [imgLeft]
 */

/**
 * @extends Component<Props>
 */
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
                currentClassName = cx("common-button", propsClass, {
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