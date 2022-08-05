import BigNumber from "bignumber.js";
import cx from "classnames";
import React from "react";
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { connect } from "react-redux";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import node_stake_icon from "../../../assets/images/node_stake_icon.png";
import { getNodeStakeInfo } from "../../../background/api";
import { SEND_PAGE_TYPE_STAKE } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateNodeDetail, updateSendPageType } from "../../../reducers/cache";
import { addressSlice, copyText } from "../../../utils/utils";
import { DEFAULT_VALIDATOR_ICON } from "../../../utils/validator";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
class StakeNodeDetail extends React.Component {
    constructor(props) {
        super(props);
        let nodeDetail = props.nodeDetail ? props.nodeDetail : {}
        let address = nodeDetail.validatorAddress || nodeDetail.entityAddress
        let nodeDetailList = props.nodeDetailList ? props.nodeDetailList : {}
        let currentNodeDetail = nodeDetailList[address] || {}
        this.state = {
            nodeDetail,
            nodeTotalSupply: currentNodeDetail.nodeTotalSupply || 0,
            nodeSelfSupply: currentNodeDetail.nodeSelfSupply || 0,
            nodeOtherSupply: currentNodeDetail.nodeOtherSupply || 0,
            stakeNumber: currentNodeDetail.stakeNumber || 0,
            commission: nodeDetail.commission || currentNodeDetail.commission,
            showLoading: !nodeDetailList[address],
            entityId: currentNodeDetail.entityId || ""
        };
        this.isUnMounted = false;
    }
    componentDidMount() {
        this.fetchData()
    }
    fetchData = () => {
        let address = this.props.nodeDetail.validatorAddress || this.props.nodeDetail.entityAddress
        getNodeStakeInfo(address).then((data) => {
            if (data && data.code === 0) {
                let realData = data.data
                this.callSetState({
                    nodeTotalSupply: realData.escrowSharesStatus.total,
                    nodeSelfSupply: realData.escrowSharesStatus.self,
                    nodeOtherSupply: realData.escrowSharesStatus.other,
                    stakeNumber: realData.delegators,
                    entityId: realData.entityId,
                    commission: realData.commission,
                    showLoading: false
                }, () => {
                    this.props.updateNodeDetail({
                        address,
                        nodeTotalSupply: this.state.nodeTotalSupply,
                        nodeSelfSupply: this.state.nodeSelfSupply,
                        nodeOtherSupply: this.state.nodeOtherSupply,
                        stakeNumber: this.state.stakeNumber,
                        commission: realData.commission,
                        entityId: realData.entityId,
                    })
                })

            }
        })
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

    onCopy = (title, content) => {
        copyText(content).then(() => {
            Toast.info(getLanguage(title + " " + getLanguage('copySuccess')))
        })
    }
    renderTopItem = (title, content,realContent) => {
        return (<div className={'node-stake-detail-item click-cursor'} onClick={() => this.onCopy(title, realContent)}>
            <p className={"node-stake-detail-content"}>{title}</p>
            <p className={"node-stake-detail-content"}>{content}</p>
        </div>)
    }
    renderTopDetail = () => {
        let nodeDetail = this.props.nodeDetail
        let address = nodeDetail.validatorAddress || nodeDetail.entityAddress
        let showAddress = addressSlice(address)
        let entityId = addressSlice(this.state.entityId)
        let validatorName = nodeDetail.validatorName || nodeDetail.name || addressSlice(address, 6)
        let statusText = nodeDetail.commission || this.state.commission || 0
        statusText = new BigNumber(statusText).multipliedBy(100).toFixed(1, 1) + "%"
        let icon = nodeDetail.icon || DEFAULT_VALIDATOR_ICON
        return (
            <div className={"node-detail-top-detail"}>
                <div className={"node-base-info-container"}>
                    <div className={"node-base-info"}>
                        <img className={"node-icon"} src={icon} />
                        <p className={"node-validator-name"}>{validatorName}</p>
                    </div>
                    <div className={"node-commission-container"}>
                        <p className={"node-commission-title"}>{getLanguage('stakeCommission')}:</p>
                        <p className={"node-commission-content"}>{statusText}</p>
                    </div>
                </div>
                <div className={"stake-info-divided"} />
                {this.renderTopItem(getLanguage('address'), showAddress,address)}
                {this.renderTopItem("EntityID", entityId,this.state.entityId)}
            </div>
        )
    }
    renderNodeTokenDetailItem = (propsColor, title, content) => {
        return (<div className={"node-token-detail-item"}>
            <div className={cx("node-token-detail-indicator", {
                [propsColor]: !!propsColor
            })} />
            <div className={"node-token-detail-right"}>
                <p className={"node-token-detail-title"}>{title}</p>
                <p className={"node-token-detail-content"}>{content}</p>
            </div>
        </div>)
    }
    renderNodeTokenDetail = () => {
        const percent = new BigNumber(this.state.nodeSelfSupply).dividedBy(this.state.nodeTotalSupply).multipliedBy(100).toNumber()
        return (
            <div className={"validator-node-detail-container"}>
                <div className={'circle-con'}>
                    <CircularProgressbarWithChildren styles={buildStyles({
                        textSize: '18px',
                        pathColor: '#73DEB3',
                        trailColor: `#73A0FA`,
                        strokeLinecap: 'butt',
                    })} strokeWidth={10} value={percent}>
                        <div className={"validator-node-container"}>
                            <p className={'validator-node-total-title'}>{getLanguage('nodeTotalStake')}</p>
                            <p className={'validator-node-total'}>{this.state.nodeTotalSupply}</p>
                        </div>
                    </CircularProgressbarWithChildren>
                </div>

                <div className={"circle-right "}>
                    {this.renderNodeTokenDetailItem("node-token-indicator-self", getLanguage('nodeSelfStake'), this.state.nodeSelfSupply)}
                    {this.renderNodeTokenDetailItem("node-token-indicator-other", getLanguage('nodeOtherStake'), this.state.nodeOtherSupply)}
                    <div className={"stake-node-person-container"}>
                        <img src={node_stake_icon} className={"stake-node-icon-little"} />
                        <p className={"stake-node-people-title"}>{getLanguage('nodeStakeNumber')}</p>
                        <p className={'stake-node-people-count'}>{this.state.stakeNumber}</p>
                    </div>
                </div>
            </div>
        )
    }
    renderUserDetailItem = (content, title) => {
        return (
            <div className={"user-detail-container"}>
                <p className={"user-detail-staked"}>{title}</p>
                <p className={"user-detail-staked-content"}>{content}</p>
            </div>
        )
    }
    getStakeInfo = () => {
        const { nodeDetail } = this.props
        let stakeInfo = nodeDetail?.stakeInfo || {}
        return stakeInfo
    }
    goToPage = (type) => {
        this.props.history.push({
            pathname: "/send_page",
        })
        this.props.updateSendPageType(type)
    }
    renderBtnGroup = () => {
        return (
            <div className={"node-bottom-container bottom-group"}>
                <Button
                    key="0"
                    content={getLanguage('AddEscrow')}
                    propsClass={"stake-common-btn"}
                    onClick={() => this.goToPage(SEND_PAGE_TYPE_STAKE)}
                />
            </div>
        )
    }
    renderLoading = () => {
        return (<div className={"home-loading-container"}>
            <img className={"confirm-loading-img"} src={loadingCommon} />
        </div>)
    }
    renderInfoData = () => {
        if (this.state.showLoading) {
            return this.renderLoading()
        }
        return (
            <div>
                {this.renderNodeTokenDetail()}
            </div>
        )
    }
    render() {
        return (<CustomView
            title={getLanguage('nodeDetail')}
            history={this.props.history}>
            <div className="node-info-container">
                {this.renderTopDetail()}
                {this.renderInfoData()}
            </div>
            {this.renderBtnGroup()}
        </CustomView>)
    }
}

const mapStateToProps = (state) => ({
    currentAccount: state.accountInfo.currentAccount,
    accountInfo: state.accountInfo,
    nodeDetail: state.cache.currentNodeDetail,
    netConfig: state.network,
    nodeDetailList: state.cache.nodeDetailList,
});

function mapDispatchToProps(dispatch) {
    return {
        updateSendPageType: (type) => {
            dispatch(updateSendPageType(type))
        },
        updateNodeDetail: (detail) => {
            dispatch(updateNodeDetail(detail))
        },

    };
}

export default connect(mapStateToProps, mapDispatchToProps)(StakeNodeDetail);
