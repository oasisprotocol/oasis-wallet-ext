import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import home_logo from "../../../assets/images/home_logo.png";
import { saveLocal } from "../../../background/storage/localStorage";
import { NETWORK_CONFIG } from "../../../constant/storageKey";
import { updateNetConfigRequest } from "../../../reducers/cache";
import { updateNetConfigList } from "../../../reducers/network";
import Select from '../../component/Select';
import AccountIcon from "../AccountIcon";
import "./index.scss";
class WalletBar extends React.Component {
    constructor(props) {
        super(props);
        let newList = this.netConfigAction()
        this.state = {
            netConfigList: newList,
            hideViewStatus: false,
            page:props.page,
        };
        this.isUnMounted = false;
    }
    componentWillUnmount() {
        this.isUnMounted = true;
    }
    componentWillReceiveProps(nextProps) {
        this.callSetState({
            netConfigList: this.netConfigAction(nextProps.netConfig.currentNetList)
        })
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
    handleChange = (item) => {
        const { totalNetList, currentNetList } = this.props.netConfig
        if(item.isSelect){
            return
        }
        let currentList = []
        for (let index = 0; index < currentNetList.length; index++) {
            const netItem = { ...currentNetList[index] };
            if (item.url === netItem.url) {
                netItem.isSelect = true
            } else {
                netItem.isSelect = false
            }
            currentList.push(netItem)
        }
        let config = {
            totalNetList: totalNetList,
            currentNetList: currentList
        }
        saveLocal(NETWORK_CONFIG, JSON.stringify(config))
        this.props.updateNetConfigList(config)
        this.props.updateNetConfigRequest(true)
    }

    netConfigAction = (netList) => {
        let currentNetList = netList ? netList:this.props.netConfig.currentNetList
        let newList = []
        for (let index = 0; index < currentNetList.length; index++) {
            const netItem = currentNetList[index];
            newList.push({
                value: netItem.netType,
                key: netItem.url,
                ...netItem
            })
        }
        return newList
    }

    setViewStatus = () => {
        this.callSetState({
            hideViewStatus: !this.state.hideViewStatus
        })
    }
    renderNetMenu = () => {
        const { currentNetType }=this.props.netConfig
        return (
            <div className={"wallet-net-select-container"}>
                <Select
                    options={this.state.netConfigList}
                    defaultValue={currentNetType}
                    onChange={this.handleChange}
                    optionsProps={"select-net-options"}
                    itemProps={"select-net-item"}
                    selfInputProps={"select-net-selfInput"}
                />
            </div>
        )
    }
    goToPage = (name, params) => {
        this.props.history.push({
            pathname: name,
            params: {
                ...params
            }
        })
    };
    renderMyIcon = () => {
        let { currentAccount } = this.props
        let address = currentAccount.evmAddress ||currentAccount.address
        return (
            <AccountIcon
                address={address}
                diameter={"30"}
            />
        )
    }
    render() {
        const { disableAccountSelect } = this.props
        return (
            <div className={"wallet-top-container"}>
                <img className="wallet-home-left-logo" src={home_logo} />
                {this.renderNetMenu()}
                <div className={cx("wallet-home-wallet", {
                    "click-cursor": !disableAccountSelect
                })} onClick={() => {
                    if (!disableAccountSelect) {
                        this.goToPage("/account_manage")
                    }
                }
                }>
                    {this.renderMyIcon()}
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    currentAccount: state.accountInfo.currentAccount,
    netConfig: state.network,
});

function mapDispatchToProps(dispatch) {
    return {
        updateNetConfigList: (config) => {
            dispatch(updateNetConfigList(config))
        },
        updateNetConfigRequest: (shouldRefresh) => {
            dispatch(updateNetConfigRequest(shouldRefresh))
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletBar);

