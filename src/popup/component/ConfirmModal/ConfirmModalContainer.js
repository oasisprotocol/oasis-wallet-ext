import cx from "classnames";
import React, { Component } from "react";
import confirm_tip from "../../../assets/images/confirm_tip.png";
import modalClose from "../../../assets/images/modalClose.png";
import Button, { BUTTON_TYPE_CANCEL } from "../Button";
import "./index.scss";

export default class ConfirmModalContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false
        };
        this.title = ""
        this.content = ""
        this.cancelText = ""
        this.confirmText = ""
        this.showClose = false

        this.onCancel = () => { }
        this.onConfirm = () => { }
        this.touchToClose = false
        this.tipImgSrc = ""
    }

    show = (params) => {
        let { title, content, onCancel, onConfirm, cancelText, confirmText, touchToClose, showClose,tipImgSrc } = params
        this.title = title
        this.content = content
        this.cancelText = cancelText
        this.confirmText = confirmText
        this.showClose = showClose

        this.onCancel = onCancel
        this.onConfirm = onConfirm
        this.touchToClose = touchToClose
        this.tipImgSrc = tipImgSrc
        this.setState({ showModal: true })
    }
    hide = () => {
        this.setState({ showModal: false })
    }
    renderCancelButton = () => {
        return (
            <Button
                buttonType={BUTTON_TYPE_CANCEL}
                content={this.cancelText}
                propsClass={"account-common-btn account-common-btn-cancel"}
                onClick={() => {
                    this.hide()
                    this.onCancel && this.onCancel()
                }}
            />
        )
    }

    renderConfirmButton = () => {
        return (
            <Button
                content={this.confirmText}
                propsClass={"account-common-btn"}
                onClick={() => {
                    this.hide()
                    this.onConfirm && this.onConfirm()
                }}
            />
        )
    }
    render() {
        return (<div className={cx({
            "confirm-container": this.state.showModal,
            "confirm-container-hide": !this.state.showModal,
        })}>
            <div className={"confirm-content-container"}>
                {this.showClose && <img
                    onClick={() => { this.hide() }}
                    className="confirm-close click-cursor"
                    src={modalClose} />}
                <div className={"confirm-img-container"}>
                    <img className={"confirm-img"} src={this.tipImgSrc?this.tipImgSrc:confirm_tip} />
                </div>
                <p className={"confirm-title"}>{this.title}</p>
                {Array.isArray(this.content) ?
                    this.content.map((item, index) => {
                        return <p key={index + ""} className={'confirm-content'}>{item}</p>
                    }) : <p className={'confirm-content'}>{this.content}</p>}
                <div className={
                    cx({
                        "confirm-button-container": this.cancelText,
                        "confirm-button-container-nocancel": !this.cancelText
                    })}>
                    {this.cancelText && this.renderCancelButton()}
                    {this.renderConfirmButton()}
                </div>
            </div>
        </div>)
    }
}