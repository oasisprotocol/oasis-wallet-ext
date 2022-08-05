import BigNumber from "bignumber.js";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { getNodeStakeList } from "../../../background/api";
import { getLanguage } from "../../../i18n";
import { updateCurrentNodeDetail, updateCurrentValidatorList, updateValidatorList } from "../../../reducers/cache";
import { addressSlice } from "../../../utils/utils";
import { DEFAULT_VALIDATOR_ICON } from "../../../utils/validator";
import Clock from "../../component/Clock";
import "./index.scss";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import noHistory from "../../../assets/images/noHistory.png";
class StakeNode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentList: [],
      currentButtonType: "active",
    };
    this.isUnMounted = false;
    this.isRequest = false
  }
  componentDidMount() {
    this.fetchData()
  }
  nodeFilter = (type = "active", list = this.props.validatorList) => {
    return list.filter((item) => {
      if (type === "active") {
        return item.active
      } else {
        return !item.active
      }
    })
  }

  fetchData = () => {
    if (this.isRequest) {
      return
    }
    this.isRequest = true
    getNodeStakeList().then((data) => {
      this.isRequest = false
      if (data && data.code === 0) {
        let realData = data.data
        this.props.updateValidatorList(realData.list)
        let currentList = this.nodeFilter("active", realData.list)
        this.props.updateCurrentValidatorList(currentList)
      } else {
        this.props.updateValidatorList([])
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isRequestValidator && !this.isRequest) {
      this.fetchData()
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
  onClickTab = (type) => {
    this.callSetState({
      currentButtonType: type
    })
    switch (type) {
      case "active":
        this.props.updateCurrentValidatorList(this.nodeFilter("active"))
        break;
      case "candidate":
        this.props.updateCurrentValidatorList(this.nodeFilter("candidate"))
        break;

      default:
        break;
    }
  }
  onClickItem = (item) => {
    this.props.updateCurrentNodeDetail(item)
    this.props.params.history.push({
      pathname: "stake_node_detail",
    })
  }
  renderNodeItem = (item, index) => {
    let showAddress = addressSlice(item.entityAddress, 8)
    let statusText = item.commission || 0
    statusText = new BigNumber(statusText).multipliedBy(100).toFixed(1, 1) + "%"
    let validatorName = item.name || showAddress
    let icon = item.icon || DEFAULT_VALIDATOR_ICON
    let delegators = item.delegators
    return (
      <div key={index + ""} className={"stake-item-container click-cursor"} onClick={() => { this.onClickItem(item) }}>
        <div className={"tx-item-top-container"}>
          <div className={"tx-item-left"}>
            <img className={"node-icon"} src={icon} />
          </div>
          <div className={"stake-validator-info-container"}>
            <div className={"stake-validator-container"}>
              <p className={"stake-validator-name"}>{validatorName}</p>
              <div className={"stake-item-user-container"}>
                <p className={"stake-item-user-title"}>{getLanguage('stakeCommission')+":  "}</p>
                <p className={"stake-item-user-content"}>{statusText}</p>
              </div>
            </div>
            <p className={"stake-validator-address"}>{showAddress}</p>
            <div />
          </div>
        </div>
        <div className={"stake-info-divided"} />
        <div className={"stake-item-user-container-outer"}>
        <div className={"stake-item-user-container"}>
            <p className={"stake-item-user-title"}>{getLanguage('nodeStakeNumber')+":  "}</p>
            <p className={"stake-item-user-content"}>{delegators}</p>
          </div>
          <div className={"stake-item-user-container"}>
            <p className={"stake-item-user-title"}>{getLanguage('nodeTotalStake')+":  "}</p>
            <p className={"stake-item-user-content"}>{item.escrow}</p>
          </div>
        </div>
      </div>)
  }
  renderLoading = () => {
    return (<div className={"home-loading-container"}>
      <img className={"confirm-loading-img"} src={loadingCommon} />
    </div>)
  }
  renderNodeList = () => {
    const { currentValidatorList } = this.props
    if (this.props.isRequestValidator) {
      return this.renderLoading()
    }
    return (
      <div className={"node-list-container"}>
        {currentValidatorList.length > 0 ?
          currentValidatorList.map((item, index) => {
            return this.renderNodeItem(item, index)
          })
          :
          <div className={"no-tx-container-stake"}>
            <img className={"no-tx-img-stake"} src={noHistory} />
            <p className={"no-tx-content"}>{getLanguage('noHistory')}</p>
          </div>
        }
      </div>
    )
  }
  renderButton = (title, callback, type) => {
    return (
      <button
        className={cx("node-button-inactive click-cursor", {
          "node-button-active": this.state.currentButtonType === type,
        })}
        onClick={() => {
          callback && callback(type)
        }}
      >{title}</button>
    )
  }
  render() {
    return (
      <div className="staking-root-common">
        <div className={'node-button-group-outer'}>
          <div className={'node-button-group'}>
            {this.renderButton(getLanguage('activeNode'), this.onClickTab, "active")}
            {this.renderButton(getLanguage('candidateNode'), this.onClickTab, "candidate")}
          </div>
        </div>
        {this.renderNodeList()}
        <Clock schemeEvent={() => { this.fetchData() }} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  validatorList: state.cache.validatorList,
  currentValidatorList: state.cache.currentValidatorList,
  shouldRefresh: state.accountInfo.shouldRefresh,
  isRequestValidator: state.cache.isRequestValidator
});

function mapDispatchToProps(dispatch) {
  return {
    updateValidatorList: (list) => {
      dispatch(updateValidatorList(list))
    },
    updateCurrentValidatorList: (list) => {
      dispatch(updateCurrentValidatorList(list))
    },
    updateCurrentNodeDetail: (nodeDetail) => {
      dispatch(updateCurrentNodeDetail(nodeDetail))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StakeNode);
