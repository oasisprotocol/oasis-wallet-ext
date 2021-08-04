import cx from "classnames";
import React, { Component } from "react";
import pwd_error from "../../../assets/images/pwd_error.png";
import pwd_right from "../../../assets/images/pwd_right.png";
import "./index.scss";
export default class CustomInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeLine: false
        };
    }
    onFocus = () => {
        this.setState({
            activeLine: true
        })
    }
    onBlur = () => {
        this.setState({
            activeLine: false
        })
    }
    renderErrorTip = () => {
        let { errorTipShow, showTip, isTipRight } = this.props
        if (!showTip) {
            return
        }
        let imgSource = !errorTipShow ? pwd_right : pwd_error

        return (
            <div className={
                cx({
                    "error-tip-container-show": showTip
                })
            }>
                <img className={"error-tip-img"} src={imgSource} />
                <p className={cx({
                    "error-tip": true,
                    "error-tip-text": !errorTipShow,
                    "error-tip-error": errorTipShow
                })}>{showTip}</p>
            </div>
        )
    }
    render() {
        let { propsClass, wrapPropClass } = this.props
        let params = {}
        if(this.props.readOnly){
            params.readOnly = "readonly"
        }
        return (
            <div className={
                cx({
                    'input-wrapper-1': true,
                    [wrapPropClass]: !!wrapPropClass
                })
            }>
                <div className={"lable-container"}>
                    <p className="pwd-lable-1">{this.props.label}</p>
                    <p className="pwd-lable-desc-1">{this.props.descLabel}</p>
                    {this.props.rightComponent}
                </div>
                <div className={"input-wrapper-row-1"}>
                    <input
                        className={
                            cx("create-input-1", {
                                [propsClass]: !!propsClass,
                                "create-input-readOnly": this.props.readOnly
                            })}
                        onChange={this.props.onTextInput}
                        placeholder={this.props.placeholder}
                        value={"" || this.props.value}
                        spellCheck={false}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        {...params}
                    />
                </div>
                {this.renderErrorTip()}
            </div>
        );
    }
}
