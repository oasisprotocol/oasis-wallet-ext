import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import logo from "../../../assets/images/Rose Wallet Logo Blue cropped.svg";
import txFailed from "../../../assets/images/txFailed.png";
import { clearLocalExcept, getLocal } from "../../../background/storage/localStorage";
import { NETWORK_CONFIG } from "../../../constant/storageKey";
import { RESET_WALLET, WALLET_APP_SUBMIT_PWD } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { resetWallet } from "../../../reducers";
import { hideNewExtensionWarning } from "../../../reducers/appReducer";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { updateNetConfigList } from "../../../reducers/network";
import { sendMsg } from "../../../utils/commonMsg";
import { trimSpace } from "../../../utils/utils";
import Button from "../../component/Button";
import ConfirmModal from "../../component/ConfirmModal";
import CustomInput from "../../component/CustomInput";
import CustomView from "../../component/CustomView";
import TestModal from "../../component/TestModal";
import TextInput from "../../component/TextInput";
import Toast from "../../component/Toast";
import { NewExtensionWarning } from "../../component/NewExtensionWarning"
import "./index.scss";
class LockPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: "",
            btnClick: false,
            confirmText: "",
            deleteTagStatus: false
        };
        this.isUnMounted = false;
        this.modal = React.createRef();
    }
    componentWillUnmount() {
        this.isUnMounted = true;
    }
    callSetState = (data, callback) => {
        if (!this.isUnMounted) {
            this.setState({
                ...data
            }, () => {
                callback && callback()
            })
        }
    }
    goToConfirm = async () => {
        const { onClickUnLock } = this.props
        let pwd = this.state.password.trim()
        sendMsg({
            action: WALLET_APP_SUBMIT_PWD,
            payload: pwd
        },
            (account) => {
                if (account.error) {
                    if (account.type === "local") {
                        Toast.info(getLanguage(account.error))
                    } else {
                        Toast.info(account.error)
                    }
                } else {
                    this.props.updateCurrentAccount(account)
                    onClickUnLock && onClickUnLock()
                    if (!this.props.onDappConfirm) {
                        this.props.history.push({
                            pathname: "/homepage",
                        })
                    }
                }
            })
    }

    onPwdInput = (e) => {
        let value = e.target.value
        this.callSetState({
            password: value
        }, () => {
            if (this.state.password.length > 0) {
                this.callSetState({
                    btnClick: true,
                })
            } else {
                this.callSetState({
                    btnClick: false,
                })
            }
        })
    }
    onSubmit = (event) => {
        event.preventDefault();
    }
    renderPwdInput = () => {
        return (
            <form onSubmit={this.onSubmit} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}>
                <div className={"lock-inner-container"}>
                    {this.renderWelcome()}
                    <TextInput
                        value={this.state.password}
                        label={getLanguage("inputPassword")}
                        onTextInput={this.onPwdInput}
                    />
                    {this.renderConfirm()}
                </div>
            </form>
        )
    }
    renderConfirm = () => {
        return (
            <div className="lock-button-container">
                <Button
                    disabled={!this.state.btnClick}
                    content={getLanguage('lockButton')}
                    onClick={this.goToConfirm}
                />
            </div>
        )
    }
    renderWelcome = () => {
        return (
            <p className={'lock-welcome-content'}>{getLanguage("welcomeBack")}</p>
        )
    }
    onTextInput = (e) => {
        if (!this.isUnMounted) {
            this.callSetState({
                confirmText: e.target.value,
            }, () => {
                this.checkDeleteTagStatus()
            })
        }
    }
    renderInput = () => {
        return (
            <div className="change-input-wrapper">
                <CustomInput
                    value={this.state.confirmText}
                    onTextInput={this.onTextInput}
                />
            </div>)
    }
    renderActionBtn = () => {
        return (
            <div className={"account-info-btn-container"}>
                <Button
                    content={getLanguage('confirm')}
                    onClick={this.onConfirmReset}
                    propsClass={"account-common-btn account-common-btn-danger"}
                    disabled={!this.state.deleteTagStatus}
                />
                <Button
                    content={getLanguage('cancel')}
                    propsClass={"account-common-btn account-common-btn-cancel"}
                    onClick={this.onCloseModal}
                />
            </div>
        )
    }
    renderChangeModal = () => {
        return (<TestModal
            ref={this.modal}>
            <div className={'account-change-name-container'}>
                <div className={"account-change-title-container"}>
                    <p className={
                        cx({ "account-change-name-title": true })
                    }>{getLanguage('confirm_reset_tip')}</p>
                </div>
                {this.renderInput()}
                {this.renderActionBtn()}
            </div>
        </TestModal>)
    }
    checkDeleteTagStatus = () => {
        let realText = trimSpace(this.state.confirmText)
        let deleteTag = getLanguage("deleteTag")
        let checkStatus = realText === deleteTag
        this.callSetState({
            deleteTagStatus: checkStatus
        })
    }
    onConfirmReset = () => {
        if (this.state.deleteTagStatus) {
            sendMsg({
                action: RESET_WALLET,
            }, () => {
                //1, delete extension storage
                //2, delete local storage except net-config
                clearLocalExcept(NETWORK_CONFIG)
                //3, clear all redux
                this.props.resetWallet()
                //4, get network config and update net-reducer
                let netConfig = getLocal(NETWORK_CONFIG)
                if (netConfig) {
                    netConfig = JSON.parse(netConfig)
                    this.props.updateNetConfigList(netConfig)
                }
                this.props.history.go(0); // Reload
            })
        }
    }
    showConfirmModal = () => {
        this.modal.current.setModalVisible(true)
    }
    onCloseModal = () => {
        this.modal.current.setModalVisible(false)
    }
    onClickRestore = () => {
        let title = getLanguage('prompt')
        let cancelText = getLanguage('cancelReset')
        let confirmText = getLanguage('confirmReset')
        let tipImgSrc = txFailed
        let content = [
            getLanguage('reset_tip_1'),
            getLanguage('reset_tip_2'),]
        ConfirmModal.show({
            title,
            content,
            cancelText,
            confirmText,
            showClose: true,
            tipImgSrc,
            isDangerous: true,
            onConfirm: this.showConfirmModal,
        })
    }
    render() {
        return (<CustomView
            noBack={true}
            isReceive={true}
            history={this.props.history}>
            <div className={"lock-container"}>
                {this.props.showNewExtensionWarning && (
                    <div style={{ marginBottom: '20px', marginTop: '-70px'}}>
                        <NewExtensionWarning handleClick={this.props.hideNewExtensionWarning} />
                    </div>
                )}
                <div className={"lock-logo-container"}>
                    <img className={"lock-home-logo"} src={logo} />
                </div>
                {this.renderPwdInput()}
            </div>
            <div className={"restore-bottom-container"}>
                <p className="restore-bottom" onClick={this.onClickRestore}>{getLanguage('resetWallet')}</p>
            </div>
            <form onSubmit={this.onSubmit}>
                {this.renderChangeModal()}
            </form>
        </CustomView>)
    }
}

const mapStateToProps = (state) => ({
    showNewExtensionWarning: state.appReducer.showNewExtensionWarning,
});

function mapDispatchToProps(dispatch) {
    return {
        updateCurrentAccount: (account) => {
            dispatch(updateCurrentAccount(account))
        },
        resetWallet: () => {
            dispatch(resetWallet())
        },
        updateNetConfigList: (config) => {
            dispatch(updateNetConfigList(config))
        },
        hideNewExtensionWarning: () => {
            dispatch(hideNewExtensionWarning());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LockPage);
