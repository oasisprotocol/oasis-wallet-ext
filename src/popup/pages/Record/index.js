import BigNumber from "bignumber.js";
import cx from "classnames";
import extension from 'extensionizer';
import React from "react";
import { connect } from "react-redux";
import { cointypes } from '../../../../config';
import pending from "../../../assets/images/pending.png";
import record_arrow from "../../../assets/images/record_arrow.png";
import success from "../../../assets/images/success.png";
import txFailed from "../../../assets/images/txFailed.png";
import { FROM_BACK_TO_RECORD, TX_SUCCESS } from '../../../constant/types';
import { TRANSACTION_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { openTab } from '../../../utils/commonMsg';
import { copyText, getExplorerUrl, isNumber } from "../../../utils/utils";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";

const DECIMALS = cointypes.decimals
class Record extends React.Component {
  constructor(props) {
    super(props);
    let txDetail = props.location.params?.txDetail;
    this.state = {
      txStatus: txDetail.status,
      txDetail
    };
    this.isUnMounted = false;
  }
  componentDidMount() {
    this.startListener()
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
  startListener = () => {
    extension.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      const { type, action, data } = message;
      if (type === FROM_BACK_TO_RECORD && action === TX_SUCCESS) {
        this.callSetState({
          txStatus: data.status
        })
        sendResponse();
      }
      return true;
    });
  }

  onCopy = (title, content) => {
    copyText(content).then(() => {
      Toast.info(title + " " + getLanguage('copySuccess'))
    })
  }
  renderDetailItem = (title, content) => {
    if(!title){
      return(<></>)
    }
    return (
      <div onClick={() => this.onCopy(title, content)} className="record-detail-item">
        <p className="record-detail-title">{title}</p>
        <p className="record-detail-content  click-cursor">{content}</p>
      </div>
    )
  }
  renderDetail = () => {
    let receive = this.state.txDetail.to || String(this.state.txDetail.receiver)
    let senderAddress = this.state.txDetail.from || String(this.state.txDetail.sender)
    let symbol = this.props.netConfig.currentSymbol
    let timestamp = this.state.txDetail.timestamp || 0
    let time = new Date(parseInt(timestamp) * 1000).toJSON()
    let amount = this.state.txDetail.amount
    let method = this.state.txDetail.method
    return (
      <div className="record-detail-container">
        {!!method && this.renderDetailItem(getLanguage('txType'), method)}
        {this.renderDetailItem(getLanguage('amount'), amount + " " + symbol)}
        {this.renderDetailItem(getLanguage('toAddress'), receive)}
        {this.renderDetailItem(getLanguage('fromAddress'), senderAddress)}
        {this.renderDetailItem(getLanguage('fee'), this.state.txDetail.fee + " " + symbol)}
        {isNumber(this.state.txDetail.nonce) && this.renderDetailItem("Nonce", String(this.state.txDetail.nonce))}
        {!!timestamp && this.renderDetailItem(getLanguage('recordTime'), time)}
        {this.renderDetailItem("txHash", this.state.txDetail.txHash || this.state.txDetail.hash)}
      </div>
    )
  }
  goToExplorer = () => {
    let hash = this.state.txDetail.txHash || this.state.txDetail.hash
    let url = getExplorerUrl() + "transactions/" + hash
    openTab(url)
  }
  renderDetailExplorer = () => {
    return (
      <div className={"record-bottom"} onClick={this.goToExplorer} >
        <div className={"record-explorer-inner-container  click-cursor"}>
          <p className={"record-explorer-title"}>{getLanguage('getDetailInExplorer')}</p>
          <img className={"record-arrow"} src={record_arrow} />
        </div>
      </div>
    )
  }

  getStatusSource = () => {
    let status = {
      source: pending,
      text: getLanguage('txPending'),
      className: "tx-pending-title"
    }
    if (typeof this.state.txStatus === "boolean") {
      if (this.state.txStatus) {
        status.source = success,
          status.text = getLanguage('backup_success_title')
        status.className = "tx-success-title"
      } else {
        status.source = txFailed,
          status.text = getLanguage('txFailed')
        status.className = "tx-failed-title"
      }
    }
    return status
  }

  render() {
    let status = this.getStatusSource()
    let imgSource = status.source
    let txStatusTitle = status.text
    const onBack = this.props.location.params?.onGoBack;
    return (
      <CustomView
        onGoBack={onBack ?? null}
        propsClassName={'record-background'}
        history={this.props.history}>
        <div className="record-container">
          <div className={"record-content"}>
            <div className={"record-status-container"}>
              <img className={"record-status-img"} src={imgSource}></img>
            </div>
            <p className={
              cx({
                "tx-common-title": true,
              })
            }>{txStatusTitle}</p>
            <div className={'divided-line-container'}>
              <div className={"record-circle record-left-circle"}></div>
              <div className="record-status-dividedline"></div>
              <div className={"record-circle record-right-circle"}></div>
            </div>
            {this.renderDetail()}
            {this.renderDetailExplorer()}
          </div>
        </div>
      </CustomView>
    )
  }
}

const mapStateToProps = (state) => ({
  netConfig: state.network,
});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Record);
