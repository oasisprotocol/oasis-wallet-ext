import BigNumber from "bignumber.js";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import noHistory from "../../../assets/images/noHistory.png";
import { getAccountStakeInfo, getUserDebondInfo } from "../../../background/api";
import { SEND_PAGE_TYPE_RECLAIM, SEND_PAGE_TYPE_STAKE } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateDelegationList } from "../../../reducers/accountReducer";
import { updateCurrentNodeDetail, updateSendPageType } from "../../../reducers/cache";
import { addressSlice, getDisplayAmount } from "../../../utils/utils";
import Clock from "../../component/Clock";
import "./index.scss";
class MyStaking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTabList: [
                {
                    title: getLanguage("activeDelegations"),
                    tabIndex: 0,
                    callback: () => { }
                },
                {
                    title: getLanguage("debondingDelegations"),
                    tabIndex: 1,
                    callback: () => { }
                }
            ],
            currentTabIndex: 0
        };
        this.isUnMounted = false;
        this.isRequest = false
    }
    componentDidMount() {
        this.fetchData(this.props.currentAccount.address)
    }
    fetchData = (address) => {
        if (this.isRequest) {
            return
        }
        this.isRequest = true
        Promise.all([getAccountStakeInfo(address), getUserDebondInfo(address)]).then((data) => {
            this.isRequest = false
            let stakeInfo = data[0]
            let debondInfo = data[1]
            let stakeList = []
            let debondList = []
            if (stakeInfo && stakeInfo.code === 0) {
                stakeList = stakeInfo.data && stakeInfo.data.list || []
            }
            if (debondInfo && debondInfo.code === 0) {
                debondList = debondInfo.data && debondInfo.data.list || []
            }
            this.props.updateDelegationList(stakeList, debondList)
        })
    }
    componentWillReceiveProps(nextProps) {
        if ((nextProps.refreshUserStakeLoading || nextProps.refreshUserStakeCommon) && !this.isRequest) {
            this.fetchData(this.props.currentAccount.address)
        }
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
    renderTopInfoItem = (title, content) => {
        return (
            <div className={"top-info-content"}>
                <p>{title} : {content}</p>
            </div>
        )
    }
    getStakePercent = (total_balance, delegations_balance) => {
        let percent = "0"
        if (new BigNumber(total_balance).gt(0)) {
            percent = new BigNumber(delegations_balance).dividedBy(total_balance).multipliedBy(100).toFixed(4, 1)
        }
        percent = percent + "%"
        return percent
    }
    getDebondNumber=(debondList)=>{
        let totalNumber = new BigNumber(0)
        for (let index = 0; index < debondList.length; index++) {
            const debondItem = debondList[index];
            totalNumber = totalNumber.plus(debondItem.shares)
        }
        return totalNumber.toNumber()
    }
    renderTopInfo = () => {
        let { accountInfo } = this.props
        let {
            total_balance,
            delegations_balance,
            debondList,
            stakeList
        } = accountInfo
        let percent = this.getStakePercent(total_balance, delegations_balance)
        let debondNumber = this.getDebondNumber(debondList)
        return (<div className={"stake-top-info"}>
            <div className={"stake-top-container"}>
                <div>
                    <p className={"stake-total-title"}>{getLanguage('stakeTotal')}</p>
                    <p className={"stake-total-count"}>{getDisplayAmount(delegations_balance, 2)}</p>
                </div>
                <div>
                    <p className={"stake-total-title-right"}>{getLanguage('totalBalance')}</p>
                    <p className={"stake-total-count"}>{getDisplayAmount(total_balance, 2)}</p>
                </div>
            </div>
            <div className={"stake-percent-container"}>
                <div className={"stake-percent-progress"}>
                    <div className={"stake-percent-progress-actual"}
                        style={{
                            width: percent
                        }}
                    />
                </div>
            </div>
            <div className={"stake-user-detail-total"}>
                <div className={"stake-user-detail-container"}>
                    <p className={"stake-user-detail-title"}>{getLanguage("stakeValidator")+":  "}</p>
                    <p className={"stake-user-detail-content"}>{stakeList.length}</p>
                </div>
                <div className={"stake-user-detail-container"}>
                    <p className={"stake-user-detail-title"}>{getLanguage('debonding')+":  "}</p>
                    <p className={"stake-user-detail-content"}>{getDisplayAmount(debondNumber)}</p>
                </div>
            </div>
        </div>)
    }
    onClickItem = (item) => {
        this.props.updateCurrentNodeDetail(item)
        this.props.params.history.push({
            pathname: "stake_node_detail",
        })
    }
    renderStakeItem = (item, index, type) => {
        let showBtn = type === "stake"
        let showAddress = addressSlice(item.validatorAddress, 8)
        let validatorName = item.validatorName || showAddress
        let symbol = this.props.netConfig.currentSymbol

        let totalSupply = ""
        let supplyTitle = ""
        if (showBtn) {
            let stakeAmount = item.amount || 0
            let stakeShare = item.shares || 0
            totalSupply = stakeAmount + " " + symbol

            supplyTitle = getLanguage('stakingStatus_1')
        } else {
            let debondAmount = item.shares || 0
            totalSupply = debondAmount + " " + symbol
            supplyTitle = getLanguage('debonding')
        }

        let nodeActive = item.active
        let nodeStatusText = nodeActive ? getLanguage('activeNode') : getLanguage('candidateNode')

        return (<div
            key={index + ""}
            onClick={() => { showBtn && this.onClickItem(item) }}
            className={cx("stake-item-container-2 ", {
                "click-cursor": showBtn
            })} >
            <div className={"stake-validator-container"}>
                <p className={"stake-validator-name"}>{validatorName}</p>
                {showBtn && <p className={cx("stake-validator-status-text", {
                    "stake-validator-status-text-active": nodeActive,
                    "stake-validator-status-text-inactive": !nodeActive,
                })}>{nodeStatusText}</p>}
            </div>
            <p className={"stake-validator-address"}>{showAddress}</p>
            {showBtn ?
                <div className={"stake-item-stake-container"}>
                    <p className={"stake-item-user-title"}>{supplyTitle+":  "}</p>
                    <p className={"stake-item-content-shares"}>{totalSupply}</p>
                </div>
                :
                <div className={"stake-item-user-debond"}>
                    <div className={"stake-item-debond-right"}>
                        <p className={"stake-item-user-title-2"}>{supplyTitle+":  "}</p>
                        <p className={"stake-item-content-shares"}>{totalSupply}</p>
                    </div>
                    <div className={"stake-item-debond-right"}>
                        <p className={"stake-item-user-title-2"}>{getLanguage('debondReleaseTime')}</p>
                        <p className={"stake-item-content-shares"}>{item.epochLeft+" " + getLanguage("timeHour")}</p>
                    </div>
                </div>
            }
            {showBtn &&
                <div className={"stake-item-button-container"}>
                    <p className={"stake-item-escrow"}
                        onClick={(event) => { this.onClickStake(event, item) }}
                    >{getLanguage("escrow")}</p>
                    <p className={"stake-item-reclaim"}
                        onClick={(event) => { this.onClickReclaim(event, item) }}
                    >{getLanguage("reclaim")}</p>
                </div>}
        </div>)
    }
    onClickStake = (event, item) => {
        this.props.updateCurrentNodeDetail(item)
        this.props.updateSendPageType(SEND_PAGE_TYPE_STAKE)
        this.props.params.history.push({
            pathname: "/send_page",
        })
        event.stopPropagation();

    }
    onClickReclaim = (event, item) => {
        this.props.updateCurrentNodeDetail(item)
        this.props.updateSendPageType(SEND_PAGE_TYPE_RECLAIM)
        this.props.params.history.push({
            pathname: "/send_page",
        })
        event.stopPropagation();
    }
    renderStakingList = () => {
        const { stakeList } = this.props.accountInfo
        return (
            <div>
                {stakeList.length <= 0 ?
                    <div className={"no-tx-container-stake"}>
                        <img className={"no-tx-img-stake"} src={noHistory} />
                        <p className={"no-tx-content"}>{getLanguage('noHistory')}</p>
                    </div> :
                    stakeList.map((item, index) => {
                        return this.renderStakeItem(item, index, "stake")
                    })}
            </div>
        )
    }
    renderDebondList = () => {
        const { debondList } = this.props.accountInfo
        return (
            <div>
                {debondList.length <= 0 ?
                    <div className={"no-tx-container-stake"}>
                        <img className={"no-tx-img-stake"} src={noHistory} />
                        <p className={"no-tx-content"}>{getLanguage('noHistory')}</p>
                    </div> :
                    debondList.map((item, index) => {
                        return this.renderStakeItem(item, index, "debond")
                    })}
            </div>
        )
    }
    renderLoading = () => {
        return (<div className={"home-loading-container"}>
            <img className={"confirm-loading-img"} src={loadingCommon} />
        </div>)
    }
    onTabClick = (item, index) => {
        if (item.tabIndex === this.state.currentTabIndex) {
            return
        }
        this.callSetState({
            currentTabIndex: index
        })
    }
    renderBorderButton = (item, index) => {
        return (<div
            key={index + ""}
            onClick={() => this.onTabClick(item, index)}
            className={cx("click-cursor", {
                'stake-node-button-click': this.state.currentTabIndex === item.tabIndex,
                "stake-node-button-common": this.state.currentTabIndex !== item.tabIndex
            })}>
            <p>{item.title}</p>
        </div>)
    }
    renderStakingInfo = () => {
        if (this.props.refreshUserStakeLoading) {
            return this.renderLoading()
        }
        return (
            <div className={"staking-list-info"}>
                <div className={"staking-title-container"}>
                    {this.state.currentTabList.map((item, index) => {
                        return this.renderBorderButton(item, index)
                    })}
                </div>
                {
                    this.state.currentTabIndex === 0 ? this.renderStakingList() : this.renderDebondList()
                }
            </div>
        )
    }
    render() {
        return (
            <div className="staking-root staking-root-pad">
                {this.renderTopInfo()}
                {this.renderStakingInfo()}
                <Clock schemeEvent={() => { this.fetchData(this.props.currentAccount.address) }} />
            </div>)
    }
}

const mapStateToProps = (state) => ({
    currentAccount: state.accountInfo.currentAccount,
    accountInfo: state.accountInfo,
    shouldRefresh: state.accountInfo.shouldRefresh,
    netConfig: state.network,
    refreshUserStakeLoading: state.accountInfo.refreshUserStakeLoading,
});

function mapDispatchToProps(dispatch) {
    return {
        updateDelegationList: (stakeList, debondList) => {
            dispatch(updateDelegationList(stakeList, debondList))
        },
        updateCurrentNodeDetail: (nodeDetail) => {
            dispatch(updateCurrentNodeDetail(nodeDetail))
        },
        updateSendPageType: (type) => {
            dispatch(updateSendPageType(type))
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyStaking);
