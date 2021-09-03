import React from "react";
import { connect } from "react-redux";
import { WALLET_IMPORT_OBSERVE_ACCOUNT } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { updateEntryWhichRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import { trimSpace } from "../../../utils/utils";
import { addressValid } from "../../../utils/validator";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
class ImportObserve extends React.Component {
    constructor(props) {
        super(props);
        let accountName = props.location.params?.accountName || ""
        this.state = {
            btnClick: false,
            inputAddress: "",
            accountName
        };
        this.isUnMounted = false;
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
    goToCreate = () => {
        let address = this.state.inputAddress
        address = trimSpace(address)
        if (!addressValid(address)) {
            Toast.info(getLanguage('sendAddressError'))
            return
        }
        sendMsg({
            action: WALLET_IMPORT_OBSERVE_ACCOUNT,
            payload: {
                address: address,
                accountName: this.state.accountName
            }
        }, (account) => {
            if (account.error) {
                if (account.type === "local") {
                    Toast.info(getLanguage(account.error))
                } else {
                    Toast.info(account.error)
                }
                return
            } else {
                this.props.updateCurrentAccount(account)
                setTimeout(() => {
                    this.props.history.replace({
                        pathname: "/account_manage",
                    })
                }, 300);
            }
        })
    };

    handleTextareaChange = (e) => {
        let value = e.target.value
        this.callSetState({
            inputAddress: value
        }, () => {
            if (this.state.inputAddress.length > 0) {
                this.callSetState({
                    btnClick: true
                })
            } else {
                this.callSetState({
                    btnClick: false
                })
            }
        })
    }
    renderInput = () => {
        return (
            <div className={"import-input-container"}>
                <textarea
                    className={"text-area-input"}
                    value={this.state.inputAddress}
                    onChange={this.handleTextareaChange} />
            </div>
        )
    }
    renderDescContainer = (content1, content2) => {
        return (<div className={"import-input-container-desc"}>
            <p className={"import-title-account"}>{content1}</p>
            <p className={"import-title-account"}>{content2}</p>
        </div>)
    }
    renderBottom = () => {
        return (
            <div className="bottom-container">
                <Button
                    disabled={!this.state.btnClick}
                    content={getLanguage('confirm_1')}
                    onClick={this.goToCreate}
                />
            </div>
        )
    }
    renderContentContainer = (content) => {
        return (<div className={"import-input-container"}>
            <p className={"import-title"}>{content}</p>
        </div>)
    }
    render() {
        return (
            <CustomView
                title={getLanguage('observeAccount')}
                history={this.props.history}>
                <div className="import-account-container">
                    {this.renderContentContainer(getLanguage('inputObserveAddress'))}
                    {this.renderInput()}
                </div>
                {this.renderBottom()}
            </CustomView>
        )
    }

}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
    return {
        updateEntryWhichRoute: (index) => {
            dispatch(updateEntryWhichRoute(index));
        },
        updateCurrentAccount: (account) => {
            dispatch(updateCurrentAccount(account))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportObserve);
