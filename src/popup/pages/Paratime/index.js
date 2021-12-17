import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import noHistory from "../../../assets/images/noHistory.png";
import wallet_send from "../../../assets/images/wallet_send.png";
import sendDisable from "../../../assets/images/wallet_send_disable.svg";
import { getRpcBalance, getRpcRuntimeList, getRuntimeBalanceRaw } from "../../../background/api";
import { SEND_PAGE_TYPE_RUNTIME_DEPOSIT, SEND_PAGE_TYPE_RUNTIME_WITHDRAW } from "../../../constant/types";
import { ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateAccountLoading, updateRuntimeList } from "../../../reducers/accountReducer";
import { updateSendPageType } from "../../../reducers/cache";
import { addressSlice, amountDecimals, getRuntimeAddress } from "../../../utils/utils";
import Button from "../../component/Button";
import Clock from "../../component/Clock";
import Toast from "../../component/Toast";
import WalletBar from "../../component/WalletBar";
import "./index.scss";
class Paratime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            loading: props.runtimeList.length === 0,
            currentShowList: this.getShowRuntimeList()
        }
        this.isUnMounted = false;
        this.isRequest = false
    }
    async componentDidMount() {
        this.fetchData()
    }

    getShowRuntimeList = () => {
        const { currentAccount, evmRuntimeList, runtimeList } = this.props
        if (currentAccount.evmAddress) {
            return evmRuntimeList
        } else {
            return runtimeList
        }
    }
    componentWillUnmount() {
        this.isUnMounted = true;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.refreshAccountLoading && !this.state.loading) {
            this.callSetState({
                loading: true
            }, () => {
                this.fetchData()
            })
        }
        if (nextProps.currentAccount.type !== this.props.currentAccount.type) {
            let list = this.getShowRuntimeList()
            this.callSetState({
                currentShowList: list
            })
        }
    }
    getRuntimeAllowance = (allowanceList, runtimeAddress) => {
        let runtimeAddressLow = runtimeAddress.toLowerCase()
        let allowance = 0
        for (let index = 0; index < allowanceList.length; index++) {
            const allowanceItem = allowanceList[index];
            if (allowanceItem.beneficiary === runtimeAddressLow) {
                allowance = allowanceItem.allowance
                break
            }
        }
        return allowance
    }
    getRuntimeDetail = async (runtimeList, allowanceList) => {
        let newRuntimeList = []
        for (let index = 0; index < runtimeList.length; index++) {
            const runtime = runtimeList[index];
            let runtimeAddress = await getRuntimeAddress(runtime.runtimeId)
            let allowance = this.getRuntimeAllowance(allowanceList, runtimeAddress)
            let balanceInfo
            try {
                balanceInfo = {asString: (await getRuntimeBalanceRaw(this.props.currentAccount.address, runtime.runtimeId)).toString()}
            } catch (error) {
                console.error(error)
                balanceInfo = {error: error.message}
            }
            newRuntimeList.push({
                ...runtime,
                runtimeAddress,
                allowance,
                balanceInfo
            })
        }
        return newRuntimeList
    }

    fetchData = async () => {
        if (this.isRequest) {
            return
        }
        this.isRequest = true
        const { currentAccount } = this.props
        let rpcBalance = getRpcBalance(currentAccount.address)
        let runtimeRequestList = getRpcRuntimeList()
        try {
            const [rpcAccount, runtimeList] = await Promise.all([rpcBalance, runtimeRequestList])
            let allowanceList = rpcAccount.allowanceList
            let newRuntimeList = await this.getRuntimeDetail(runtimeList, allowanceList)
            this.props.updateRuntimeList(newRuntimeList)
        } catch (error) {
            this.callSetState({
                refreshing: false,
                loading: false
            }, () => {
                this.isRequest = false
                this.notifyAccountLoading()
            })
        }
        this.callSetState({
            refreshing: false,
            loading: false,
            currentShowList: this.getShowRuntimeList()
        }, () => {
            this.isRequest = false
            this.notifyAccountLoading()
        })
    }

    notifyAccountLoading = () => {
        const { currentAccount } = this.props
        if (currentAccount.evmAddress) {
            this.props.updateAccountLoading(false)
        }
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
    goToPage = (name, params) => {
        this.props.params.history.push({
            pathname: name,
            params: {
                ...params
            }
        })
    };

    onClickWithdraw = (item) => {
        let { currentAccount } = this.props
        if (currentAccount.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
            Toast.info(getLanguage('ledgerNotSupportTip'))
            return
        }
        this.props.updateSendPageType(SEND_PAGE_TYPE_RUNTIME_WITHDRAW)
        this.goToPage("/send_page", {
            runtimeId: item.runtimeId,
            runtimeName: this.getRuntimeName(item),
            accountType: item.accountType,
            decimals: item.decimals
        })
    }
    onClickDeposit = (item) => {
        let { currentAccount } = this.props
        if (currentAccount.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
            Toast.info(getLanguage('ledgerNotSupportTip'))
            return
        }
        this.props.updateSendPageType(SEND_PAGE_TYPE_RUNTIME_DEPOSIT)
        this.goToPage("/send_page", {
            runtimeId: item.runtimeId,
            allowance: item.allowance,
            runtimeName: this.getRuntimeName(item),
            accountType: item.accountType,
            decimals: item.decimals
        })
    }
    getRuntimeName = (item) => {
        return item.name
    }
    renderRuntimeItem = (item) => {
        let runtimeName = this.getRuntimeName(item)
        let showId = "(" + addressSlice(item.runtimeId) + ")"
        let disableToParatime = item.disableToParatime
        let disableToConsensus = item.disableToConsensus
        return (<div key={item.runtimeAddress} className={"runtime-item-container"}>
            <p className={"runtime-content-name"}>{runtimeName+" "}<span className={"runtime-content-id"}>{showId}</span></p>
            {disableToConsensus ||
                <p className={"runtime-info-container"}>
                    <span className={"runtime-info-title"}>{getLanguage('availableBalance')}{' '}</span>
                    <span className={"runtime-info-content"}>{item.balanceInfo.error ? getLanguage('nodeError') : amountDecimals(item.balanceInfo.asString, item.decimals)}</span>
                </p>
            }
            <div className={"paratime-button-container"}>
                <Button
                    content={getLanguage('toParatime')}
                    disabled={disableToParatime}
                    onClick={() => this.onClickDeposit(item)}
                    propsClass={cx("wallet-common", {
                        "home-send-btn": !disableToParatime,
                        "paratime-disable-btn": disableToParatime
                    })}
                    imgLeft={true}>
                    <img className="wallet-button-img" src={disableToParatime ? sendDisable : wallet_send} />
                </Button>

                <Button
                    content={getLanguage('toConsensus')}
                    onClick={() => this.onClickWithdraw(item)}
                    disabled={disableToConsensus}
                    propsClass={cx("wallet-common", {
                        "home-send-btn": !disableToConsensus,
                        "paratime-disable-btn": disableToConsensus
                    })}
                    imgLeft={true}>
                    <img className="wallet-button-img" src={disableToConsensus ? sendDisable : wallet_send} />
                </Button>
            </div>
        </div>)
    }
    renderRuntimeList = () => {
        const { currentShowList } = this.state
        if (currentShowList.length === 0) {
            return (<div className={"noParatimeContainer"}>
                <img className={"no-tx-img"} src={noHistory} />
                <p className={"no-tx-content"}>{getLanguage('noRuntime')}</p>
            </div>)
        }
        return <div className={"runtimeListContainer"}>
            {currentShowList.map((item) => {
                return this.renderRuntimeItem(item)
            })}
        </div>
    }
    render() {
        return (<div className="paratime-outer-container">
            <div className={"home-wallet-top-container"}>
                <WalletBar history={this.props.params.history} />
            </div>
            {this.state.loading ?
                <div className={"home-loading-container"}>
                    <img className={"confirm-loading-img"} src={loadingCommon} />
                </div>
                : <div className={"staking-root-pad"}>
                    {this.renderRuntimeList()}
                </div>
            }
            <Clock schemeEvent={this.fetchData} />
        </div>)
    }
}

const mapStateToProps = (state) => ({
    runtimeList: state.accountInfo.runtimeList,
    evmRuntimeList: state.accountInfo.evmRuntimeList,
    refreshAccountLoading: state.accountInfo.refreshAccountLoading,
    currentAccount: state.accountInfo.currentAccount,
});

function mapDispatchToProps(dispatch) {
    return {
        updateSendPageType: (type) => {
            dispatch(updateSendPageType(type))
        },
        updateRuntimeList: (list) => {
            dispatch(updateRuntimeList(list))
        },
        updateAccountLoading: (isLoading) => {
            dispatch(updateAccountLoading(isLoading))
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Paratime);