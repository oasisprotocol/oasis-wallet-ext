import React from "react";
import { connect } from "react-redux";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import noHistory from "../../../assets/images/noHistory.png";
import whiteArrow from "../../../assets/images/whiteArrow.svg";
import { getRpcBalance, getRpcRuntimeList, getRuntimeNameList } from "../../../background/api";
import { SEND_PAGE_TYPE_RUNTIME_DEPOSIT } from "../../../constant/types";
import { ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateRuntimeList, updateRuntimeNameList } from "../../../reducers/accountReducer";
import { updateSendPageType } from "../../../reducers/cache";
import { addressSlice, getRuntimeAddress } from "../../../utils/utils";
import Clock from "../../component/Clock";
import Toast from "../../component/Toast";
import "./index.scss";

class Paratime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            refreshing: false,
            loading: props.runtimeList.length === 0
        }
        this.isUnMounted = false;
        this.isRequest = false
    }
    async componentDidMount() {
        this.fetchData()
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
            newRuntimeList.push({
                ...runtime,
                runtimeAddress,
                allowance
            })
        }
        return newRuntimeList
    }

    fetchData = async () => {
        if (this.isRequest) {
            return
        }
        let { currentAccount } = this.props
        let address = currentAccount.address
        this.isRequest = true
        getRuntimeNameList().then((data) => {
            this.props.updateRuntimeNameList(data)
        })
        let rpcBalance = getRpcBalance(address) 
        let runtimeRequestList = getRpcRuntimeList()
        Promise.all([rpcBalance, runtimeRequestList]).then(async (data) => {
            let rpcAccount = data[0]
            let allowanceList = rpcAccount.allowanceList

            let runtimeList = data[1]
            let newRuntimeList = await this.getRuntimeDetail(runtimeList, allowanceList)
            this.props.updateRuntimeList(newRuntimeList)
            this.callSetState({
                refreshing: false,
                loading: false
            }, () => {
                this.isRequest = false
            })
        }).catch((error) => {
            this.callSetState({
                refreshing: false,
                loading: false
            }, () => {
                this.isRequest = false
            })
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
    goToPage = (name, params) => {
        this.props.params.history.push({
            pathname: name,
            params: {
                ...params
            }
        })
    };
 
    onClickDeposit = (item) => {
        let { currentAccount  } = this.props
        if (currentAccount.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
          Toast.info(getLanguage('ledgerNotSupportTip'))
          return
        }
        this.props.updateSendPageType(SEND_PAGE_TYPE_RUNTIME_DEPOSIT)
        this.goToPage("/send_page", {
            runtimeId: item.runtimeId,
            allowance:item.allowance,
            runtimeName:this.getRuntimeName(item)
        })
    }
    getRuntimeName=(item)=>{
        return item.name
    }
    renderRuntimeItem = (item) => {
        let runtimeName = this.getRuntimeName(item)
        return (<div key={item.runtimeAddress} className={"runtime-item-container"}>
            <div>
                <p className={"runtime-content-name"}>{runtimeName}</p>
                <span className={"runtime-content-id"}>{addressSlice(item.runtimeId)}</span>
            </div>
            <div className={"runtime-item-row"}>
                <div className={"runtime-arrow-container bottom click-cursor"} onClick={() => this.onClickDeposit(item)} >
                    <span className="baseTip tooltip-text">{getLanguage('sendIn')}</span>
                    <img className={"runtime-arrow"} src={whiteArrow} />
                </div>
            </div>
        </div>)
    }
    renderRuntimeList = () => {
        const { runtimeList } = this.props
        if (runtimeList.length === 0) {
            return (<div className={"noParatimeContainer"}>
                <img className={"no-tx-img"} src={noHistory} />
                <p className={"no-tx-content"}>{getLanguage('noRuntime')}</p>
            </div>)
        }
        return <div className={"runtimeListContainer"}>
            {runtimeList.map((item) => {
                return this.renderRuntimeItem(item)
            })}
        </div>
    }
    render() {
        return (<div className="paratime-outer-container">
            <div className={"setting-title-container"}>
                <p className={"tab-common-title"}>{getLanguage('paratime')}</p>
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
        updateRuntimeNameList: (list) => {
            dispatch(updateRuntimeNameList(list))
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Paratime);