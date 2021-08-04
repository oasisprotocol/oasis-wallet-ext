import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { network_config } from '../../../../config';
import home_logo from "../../../assets/images/home_logo.png";
import { saveLocal } from "../../../background/storage/localStorage";
import { NET_WORK_CONFIG } from "../../../constant/storageKey";
import { updateNetConfigRequest } from "../../../reducers/cache";
import { updateNetConfigList } from "../../../reducers/network";
import Select from '../../component/Select';
import AccountIcon from "../AccountIcon";
import "./index.scss";
class WalletBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            netConfigList: [],
            hideViewStatus: false
        };
        this.isUnMounted = false;
        this.currentNetConfig = {}
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
    handleChange = (item) => {
        const { totalNetList, currentNetList } = this.props.netConfig
        if (this.currentNetConfig.url === item.url) {
            return
        }
        let currentList = []
        for (let index = 0; index < currentNetList.length; index++) {
            const netItem = { ...currentNetList[index] };
            if (item.url === netItem.url) {
                netItem.isSelect = true
                this.currentNetConfig = netItem
            } else {
                netItem.isSelect = false
            }
            currentList.push(netItem)
        }
        let config = {
            totalNetList: totalNetList,
            currentNetList: currentList
        }
        saveLocal(NET_WORK_CONFIG, JSON.stringify(config))
        this.props.updateNetConfigList(config)
        this.props.updateNetConfigRequest(true)
    };

    componentDidMount() {
        this.netConfigAction()
    }

    netConfigAction = () => {
        const { currentNetList } = this.props.netConfig
        let newList = []
        for (let index = 0; index < currentNetList.length; index++) {
            const netItem = currentNetList[index];
            if (netItem.isSelect) {
                this.currentNetConfig = netItem
            }
            newList.push({
                value: netItem.netType,
                key: netItem.url,
                ...netItem
            })
        }
        this.callSetState({
            netConfigList: [...newList]
        })
    }

    setViewStatus = () => {
        this.callSetState({
            hideViewStatus: !this.state.hideViewStatus
        })
    }
    renderNetMenu = () => {
        return (
            <div className={"wallet-net-select-container"}>
                <Select
                    options={this.state.netConfigList}
                    defaultValue={this.currentNetConfig.netType || network_config[0].netType}
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
        let address = currentAccount.address
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

