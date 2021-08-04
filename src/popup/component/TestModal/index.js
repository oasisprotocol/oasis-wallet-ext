import cx from "classnames";
import React, { Component } from "react";
import modalClose from "../../../assets/images/modalClose.png";
import "./index.scss";
export default class TestModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            confirmModal: false
        };
    }

    setModalVisable = (visable) => {
        const { actionCallback } = this.props
        this.setState({
            confirmModal: visable
        }, () => {
            actionCallback && actionCallback(visable)
        })
    }
    onClickOuter = () => {
        let touchToClose = this.props.touchToClose
        if (touchToClose) {
            this.setModalVisable(false)
        }
    }
    onClickInner = (e) => {
        e.stopPropagation();
    }
    render() {
        return (
            <div className={
                cx({
                    "testmodal-container": true,
                    "testmodal-container-none": !this.state.confirmModal
                })
            }>
                <div onClick={this.onClickOuter} className={"testmodal-modal-inner"}>
                    <div onClick={this.onClickInner} className={cx({ "testmodal-modal": true })}>
                        {this.props.showClose && <img
                            onClick={() => { this.setModalVisable(false) }}
                            className="testmodal-close click-cursor"
                            src={modalClose} />}
                        {this.props.children}
                    </div>
                </div>

            </div>
        )
    }
}
