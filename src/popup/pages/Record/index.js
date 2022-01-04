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
import { getRuntimeTxDetail } from "../../../background/api";
import { FROM_BACK_TO_RECORD, TX_SUCCESS } from '../../../constant/types';
import { TRANSACTION_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { openTab } from '../../../utils/commonMsg';
import { addressSlice, copyText, getExplorerUrl, isNumber } from "../../../utils/utils";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
import Loading from "../../component/Loading";

const DECIMALS = cointypes.decimals
class Record extends React.Component {
  constructor(props) {
    super(props);
    let txDetail = props.location.params?.txDetail;
    let isEvmTx = txDetail.type && txDetail.type === "regular"
    let status = isEvmTx ? txDetail.result :txDetail.status
    this.state = {
      txStatus: status,
      txDetail,
      isEvmTx,
      evmTxDetail:txDetail.ctx ? txDetail:{}
    };
    this.isUnMounted = false;
  }
  componentDidMount() {
    const {isEvmTx,txDetail} = this.state
    this.startListener()
    if(isEvmTx && txDetail.code !== 0 ){
      Loading.show()
      this.getTransactionDetail(txDetail.txHash,txDetail.runtimeId)
    }
  }
  getTransactionDetail=(hash,id)=>{
    getRuntimeTxDetail(hash,id).then((detail)=>{
      if(detail && detail.ctx){
        this.callSetState({
          evmTxDetail:detail
        })
      }
      Loading.hide()
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
  startListener = () => {
    extension.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      const { type, action, data } = message;
      if (type === FROM_BACK_TO_RECORD && action === TX_SUCCESS && data.txHash === this.state.txDetail.txHash) {
        if(data.runtimeId){
          this.callSetState({
            txStatus: data.result,
            evmTxDetail:data.ctx ? data : {} 
          })
        }else{
          this.callSetState({
            txStatus: data.status
          })
        }
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
        {this.renderDetailItem(getLanguage('fromAddress'), senderAddress)}
        {this.renderDetailItem(getLanguage('toAddress'), receive)}
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

  renderEvmLoadingDetail=()=>{
    let runtimeId = this.state.txDetail.runtimeName + "("+addressSlice(this.state.txDetail.runtimeId)+")"
    let timestamp = this.state.txDetail.timestamp || 0
    let time = new Date(parseInt(timestamp) * 1000).toJSON()
    return (
      <div className="record-detail-container">
        {this.renderDetailItem("Runtime ID", runtimeId)}
        {!!timestamp && this.renderDetailItem(getLanguage('recordTime'), time)}
        {this.renderDetailItem("txHash", this.state.txDetail.txHash || this.state.txDetail.hash)}
      </div>
    )
  }
  renderEvmDetail=()=>{
    if(!this.state.evmTxDetail.ctx){
      return this.renderEvmLoadingDetail()
    }
    let receive = this.state.evmTxDetail.ctx.to
    let senderAddress = this.state.evmTxDetail.ctx.from
    let symbol = this.props.netConfig.currentSymbol
    let timestamp = this.state.txDetail.timestamp || 0
    let time = new Date(parseInt(timestamp) * 1000).toJSON()
    let amount = this.state.evmTxDetail.ctx.amount
    let method = this.state.evmTxDetail.ctx.method
    let nonce = this.state.evmTxDetail.ctx.nonce
    return (
      <div className="record-detail-container">
        {!!method && this.renderDetailItem(getLanguage('txType'), method)}
        {this.renderDetailItem(getLanguage('amount'), amount + " " + symbol)}
        {this.renderDetailItem(getLanguage('fromAddress'), senderAddress)}
        {this.renderDetailItem(getLanguage('toAddress'), receive)}
        {isNumber(nonce) && this.renderDetailItem("Nonce", String(nonce))}
        {!!timestamp && this.renderDetailItem(getLanguage('recordTime'), time)}
        {this.renderDetailItem("txHash", this.state.txDetail.txHash || this.state.txDetail.hash)}
      </div>
    )
  }
  renderTransactionDetail=()=>{
    if(this.state.isEvmTx){
      return this.renderEvmDetail()
    }else{
      return this.renderDetail()
    }
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
              <div className="record-status-divided-line"></div>
              <div className={"record-circle record-right-circle"}></div>
            </div>
            {this.renderTransactionDetail()}
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
