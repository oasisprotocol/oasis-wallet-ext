import BigNumber from "bignumber.js";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { cointypes, network_config } from "../../../../config";
import address_book from "../../../assets/images/address_book.png";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import record_arrow from "../../../assets/images/record_arrow.png";
import { getBalance, getRpcNonce } from "../../../background/api";
import { saveLocal } from "../../../background/storage/localStorage";
import { sendReclaimTransaction, sendStakeTransaction, sendTransaction } from "../../../background/api/txHelper";
import { NET_WORK_CONFIG } from "../../../constant/storageKey";
import { SEND_PAGE_TYPE_RECLAIM, SEND_PAGE_TYPE_SEND, SEND_PAGE_TYPE_STAKE, WALLET_CHECK_TX_STATUS, WALLET_SEND_RECLAIM_TRANSACTION, WALLET_SEND_STAKE_TRANSACTION, WALLET_SEND_TRANSACTION } from "../../../constant/types";
import { ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateNetAccount, updateRpcNonce, updateSendRefresh } from "../../../reducers/accountReducer";
import { updateAddressBookFrom, updateNetConfigRequest } from "../../../reducers/cache";
import { updateNetConfigList } from "../../../reducers/network";
import { sendMsg } from "../../../utils/commonMsg";
import { checkLedgerConnect } from "../../../utils/ledger";
import { amountDecimals, getDisplayAmount, getNumberDecimals, isNumber, isTrueNumber, toNonExponential, trimSpace } from "../../../utils/utils";
import { addressValid } from "../../../utils/validator";
import AccountIcon from "../../component/AccountIcon";
import Button from "../../component/Button";
import CustomInput from "../../component/CustomInput";
import CustomView from "../../component/CustomView";
import Loading from "../../component/Loading";
import Select from "../../component/Select";
import TestModal from "../../component/TestModal";
import Toast from "../../component/Toast";
import "./index.scss";

const STAKE_MIN_AMOUNT = 100
class SendPage extends React.Component {
  constructor(props) {
    super(props);
    let type = props.sendPageType
    let addressDetail = props.addressDetail ?? {};
    let toAddress = ""
    if (type !== SEND_PAGE_TYPE_SEND) {
      let stakeAddress = props.nodeDetail.validatorName || props.nodeDetail.name
        || props.nodeDetail.validatorAddress || props.nodeDetail.entityAddress
      toAddress = stakeAddress
    } else {
      if (addressDetail.address) {
        toAddress = addressDetail.address
      }
    }
    this.state = {
      toAddress: toAddress,
      amount: "",
      fee: "",
      addressErr: "",
      amountErr: "",
      feeErr: "",
      btnClick: false,
      confirmModal: false,
      isOpenAdvance: false,
      feeAmount: "",
      nonce: "",
      fromAddress: props.currentAccount.address,
      confirmModalLoading: false,
      feeGas: "",
      stakeType: type,
      netConfigList: [],
      reclaimShare:""
    };
    this.modal = React.createRef();
    this.isUnMounted = false;
    this.currentNetConfig = {}
    this.isRequest = false
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
  async componentDidMount() {
    this.fetchData()
    this.netConfigAction()
  }
  fetchData = async () => {
    if (this.isRequest) {
      return
    }
    this.isRequest = true
    let { currentAccount } = this.props
    let address = currentAccount.address
    let account = await getBalance(address)
    let nonce = await getRpcNonce(address)
    if (isNumber(nonce)) {
      this.props.updateRpcNonce(nonce)
    }
    this.isRequest = false
    this.props.updateSendRefresh()
    if (account.address) {
      this.props.updateNetAccount(account)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refreshAccountCommon && !this.isRequest) {
      let address = this.props.currentAccount.address
      this.fetchData(address)
    }
  }
  setBtnStatus = () => {
    if (this.state.toAddress.length > 0
      && this.state.amount.length > 0) {
      this.callSetState({
        btnClick: true
      })
    } else {
      this.callSetState({
        btnClick: false
      })
    }
  }


  onToAddressInput = (e) => {
    let address = e.target.value;
    this.callSetState({
      toAddress: address
    }, () => {
      this.setBtnStatus()
    })
  }
  renderAddressBook = () => {
    if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      return (
        <div className={"send-address-book-container click-cursor"} onClick={this.onGotoAddressBook}>
          <img src={address_book} className={"send-address-book"} />
        </div>
      )
    }
    return (<></>)
  }
  renderToAddress = () => {
    if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      return (
        <div className={"send-address-container"}>
          <CustomInput
            value={this.state.toAddress}
            label={getLanguage('toAddress')}
            placeholder={getLanguage('inputToAddress')}
            onTextInput={this.onToAddressInput}
            rightComponent={this.renderAddressBook()}
          />
        </div>)
    } else {
      let toAddress = this.state.toAddress
      return (
        <div className={"send-address-container"}>
          <CustomInput
            value={toAddress}
            label={getLanguage('stakeNodeName')}
            onTextInput={this.onToAddressInput}
            readOnly={"readonly"}
          />
        </div>)
    }

  }
  onAmountInput = (e) => {
    let amount = e.target.value;
    let reclaimShare = this.getReclaimShare(amount)
    this.callSetState({
      amount: amount,
      reclaimShare
    }, () => {
      this.setBtnStatus()
    })
  }
  onOpenAdvance = () => {
    this.callSetState({
      isOpenAdvance: !this.state.isOpenAdvance
    })
  }

  onFeeInput = (e) => {
    let fee = e.target.value
    this.callSetState({
      feeAmount: fee
    }, () => {
      this.setBtnStatus()
    })
  }
  onNonceInput = (e) => {
    let nonce = e.target.value
    this.callSetState({
      nonce: nonce
    })
  }
  onFeeGasInput = (e) => {
    let fee = e.target.value
    this.callSetState({
      feeGas: fee
    }, () => {
      this.setBtnStatus()
    })
  }
  renderAdvanceOption = () => {
    let accountInfo = this.props.accountInfo
    let nonceHolder = isNumber(accountInfo.nonce) ? "Nonce " + accountInfo.nonce : "Nonce "
    return (
      <div className={
        cx({
          "advance-option-show": this.state.isOpenAdvance,
          "advance-option-hide": !this.state.isOpenAdvance,
        })
      }>
        <CustomInput
          value={this.state.nonce}
          placeholder={nonceHolder}
          onTextInput={this.onNonceInput}
        />
        <CustomInput
          value={this.state.feeAmount}
          placeholder={"Fee Amount"}
          onTextInput={this.onFeeInput}
        />
        <CustomInput
          value={this.state.feeGas}
          placeholder={"Fee Gas"}
          onTextInput={this.onFeeGasInput}
        />
      </div>
    )
  }
  renderAdvance = () => {
    const { isOpenAdvance } = this.state;
    return (
      <div
        onClick={this.onOpenAdvance}
        className="advancer-container click-cursor">
        <p className="advance-content">{getLanguage('advanceMode')}</p>
        <img className={cx({
          "down-normal": true,
          "up-advance": isOpenAdvance,
          "down-advance": !isOpenAdvance
        })} src={record_arrow}></img>
      </div>)
  }

  renderConfirm = () => {
    return (
      <div className="bottom-container">
        <Button
          disabled={!this.state.btnClick}
          content={getLanguage('next')}
          onClick={this.onConfirm}
        />
      </div>)
  }
  renderConfirmItem = (title, content, isAmount) => {
    return (
      <div className={"confirm-item-container"}>
        <div>
          <p className={"confirm-item-title"}>{title}</p>
        </div>
        <p className={
          cx({
            "confirm-item-content": true,
          })
        }>{content}</p>
      </div>
    )
  }
  onConfirm = async () => {
    let { accountInfo, currentAccount, nodeDetail } = this.props
    if (currentAccount.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
      Toast.info(getLanguage('observeAccountTip'))
      return
    }
    let balance = accountInfo.liquid_balance

    if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      let toAddress = trimSpace(this.state.toAddress)
      if (!addressValid(toAddress)) {
        Toast.info(getLanguage('sendAddressError'))
        return
      }
    }

    let amount = trimSpace(this.state.amount)
    if (!isNumber(amount) || !new BigNumber(amount).gt(0)) {
      Toast.info(getLanguage('amountError'))
      return
    }

    let feeAmount = trimSpace(this.state.feeAmount)
    if (feeAmount.length > 0 && !isTrueNumber(feeAmount)) {
      Toast.info(getLanguage('inputFeeError'))
      return
    }
    let feeGas = trimSpace(this.state.feeGas)
    if (feeGas.length > 0 && !isTrueNumber(feeGas)) {
      Toast.info(getLanguage('inputGasError'))
      return
    }

    feeAmount = feeAmount || 0
    feeGas = feeGas || 0
    let payFee = new BigNumber(amountDecimals(feeAmount)).multipliedBy(feeGas).toString()

    let decimals = getNumberDecimals(amount)
    if (decimals > cointypes.decimals) {
      Toast.info(getLanguage('minAmount', { decimals: cointypes.decimals }))
      return
    }

    if (this.state.stakeType === SEND_PAGE_TYPE_STAKE) {
      if (!isNumber(amount) || (parseInt(amount) < parseInt(STAKE_MIN_AMOUNT))) {
        Toast.info(getLanguage('minStakeAmout') + " " + STAKE_MIN_AMOUNT)
        return
      }
      let totalStakeAmount = new BigNumber(amount).plus(payFee).toString()
      let restStakeBalance = new BigNumber(balance).minus(totalStakeAmount).toString()
      if (!BigNumber(restStakeBalance).gte(0)) {
        Toast.info(getLanguage('canUseNotEnough'))
        return
      }

    } else if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      let totalSendAmount = new BigNumber(amount).plus(payFee).toString()
      let restSendBalance = new BigNumber(balance).minus(totalSendAmount).toString()
      if (!BigNumber(restSendBalance).gte(0)) {
        Toast.info(getLanguage("canUseNotEnough"))
        return
      }
    } else {
      let debondAmount = nodeDetail && nodeDetail.amount || "0"
      debondAmount = new BigNumber(debondAmount).toNumber()
      if (!isNumber(amount) || new BigNumber(amount).gt(debondAmount)) {
        Toast.info(getLanguage('maxWithdraw'))
        return
      }
      if (!BigNumber(balance).gte(payFee)) {
        Toast.info(getLanguage('canUseNotEnough'))
        return
      }
    }

    let nonce = trimSpace(this.state.nonce)
    if (nonce.length > 0 && !isNumber(nonce)) {
      Toast.info(getLanguage('inputNonceError'))
      return
    }

    this.modal.current.setModalVisable(true)
  }
  onCancel = () => {
    this.modal.current.setModalVisable(false)
  }
  ledgerTransfer = async (payload) => {
    try {
      let app = await checkLedgerConnect()
      let ledgerApp = app.ledgerApp

      payload.ledgerApp = ledgerApp
      let sendResult
      if (this.state.stakeType === SEND_PAGE_TYPE_STAKE) {
        sendResult = await sendStakeTransaction(payload)
      } else if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
        sendResult = await sendTransaction(payload)
      } else if (this.state.stakeType === SEND_PAGE_TYPE_RECLAIM) {
        sendResult = await sendReclaimTransaction(payload)
      }
      sendMsg({
        action: WALLET_CHECK_TX_STATUS,
        payload: {
          hash: sendResult.hash
        }
      }, (data) => { })
      Loading.hide()
      this.onSubmitSuccess(sendResult)
    } catch (error) {
      Loading.hide()
      this.onSubmitSuccess(error)
    }
  }
  clickNextStep = async () => {
    let currentAccount = this.props.currentAccount
    let accountInfo = this.props.accountInfo

    let shares = this.state.reclaimShare
    let amount = new BigNumber(this.state.amount).toString()
    amount = toNonExponential(amount)
    let toAddress = ""
    if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      toAddress = trimSpace(this.state.toAddress)
    } else {
      toAddress = this.props.nodeDetail.validatorAddress || this.props.nodeDetail.entityAddress
    }
    let nonce = trimSpace(this.state.nonce) || accountInfo.nonce
    let fromAddress = currentAccount.address

    let feeAmount = trimSpace(this.state.feeAmount)
    let feeGas = trimSpace(this.state.feeGas)

    let payload = {
      fromAddress, toAddress, amount, nonce, feeAmount, feeGas, currentAccount,shares
    }
    Loading.show()


    this.modal.current.setModalVisable(false)

    if (currentAccount.type === ACCOUNT_TYPE.WALLET_LEDGER) {
      return this.ledgerTransfer(payload)
    }

    if (this.state.stakeType === SEND_PAGE_TYPE_STAKE) {
      sendMsg({
        action: WALLET_SEND_STAKE_TRANSACTION,
        payload
      }, (data) => {
        Loading.hide()
        this.onSubmitSuccess(data)
      })
    } else if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      sendMsg({
        action: WALLET_SEND_TRANSACTION,
        payload
      }, (data) => {
        Loading.hide()
        this.onSubmitSuccess(data)
      })
    } else {
      sendMsg({
        action: WALLET_SEND_RECLAIM_TRANSACTION,
        payload
      }, (data) => {
        Loading.hide()
        this.onSubmitSuccess(data)
      })
    }


  }
  onSubmitSuccess = (data) => {
    if (data && data.hash) {
      Toast.info(getLanguage('postSuccess'))
      this.props.history.replace({
        pathname: "/record_page",
        params: {
          txDetail: data
        }
      })
    } else {
      let errMessage = data && data.message || getLanguage('postFailed')
      Toast.info(errMessage)
      return
    }

  }
  renderConfirmButton = () => {
    return (
      <div className={"send-confirm-container"}>
        <Button
          content={getLanguage('confirm')}
          onClick={this.clickNextStep}
          propsClass={"account-common-btn"}
        />
      </div>
    )
  }
  renderConfirmView = () => {
    let accountInfo = this.props.accountInfo
    let netNonce = isNumber(accountInfo.nonce) ? accountInfo.nonce : ""
    let nonce = this.state.nonce ? this.state.nonce : netNonce

    let feeAmount = this.state.feeAmount ? this.state.feeAmount : 0
    feeAmount = toNonExponential(amountDecimals(feeAmount, cointypes.decimals))
    let title = this.state.confirmModalLoading ? "waitLedgerConfirm" : "sendDetail"
    if (this.state.stakeType !== SEND_PAGE_TYPE_SEND) {
      title = getLanguage('stakeDetail')
    }
    let amountTitle = ""
    let toTitle = getLanguage('stakeNodeName')

    if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      amountTitle = getLanguage('amount')
      toTitle = getLanguage('toAddress')
    } else if (this.state.stakeType === SEND_PAGE_TYPE_STAKE) {
      amountTitle = getLanguage('stakeAmount')
    } else {
      amountTitle = getLanguage('reclaimAmount')
    }
    let currentSymbol = this.props.netConfig.currentSymbol
    return (
      <div className={"confirm-modal-container"}>
        <div className={"testModa-title-container"}><p className={"testModa-title"}>{getLanguage(title)}</p></div>
        {this.renderConfirmItem(getLanguage('amount'), this.state.amount + " " + currentSymbol, true)}
        {this.renderConfirmItem(toTitle, this.state.toAddress)}
        {this.renderConfirmItem(getLanguage('fromAddress'), this.state.fromAddress)}
        {this.renderConfirmItem(getLanguage('fee'), feeAmount + " " + currentSymbol)}
        {isNumber(nonce) && this.renderConfirmItem("Nonce", nonce)}
        {this.renderConfirmButton()}
      </div>
    )
  }

  renderLoadingView = () => {
    return (
      <div className={"confirm-loading"}>
        <p className={"confirm-loading-desc"}>{getLanguage('confirmInfoLedger')}</p>
        <img className={"confirm-loading-img"} src={loadingCommon} />
      </div>)
  }
  onCloseModal = () => {
    this.modal.current.setModalVisable(false)
  }
  renderConfirmModal = () => {

    return (<TestModal
      ref={this.modal}
      touchToClose={true}
      showClose={!this.state.confirmModalLoading}
    >
      {this.state.confirmModalLoading ? this.renderLoadingView() : this.renderConfirmView()}
    </TestModal>)
  }
  onClickFee = (item, index) => {
    this.callSetState({
      fee: item.fee
    })
  }

  onSubmit = (event) => {
    event.preventDefault();
  }
  onGotoAddressBook = () => {
    this.props.updateAddressBookFrom("send")
    this.props.history.push({
      pathname: "/address_book",
    })
  }

  getReclaimShare=(inputAmount = 0)=>{
    if(!isNumber(inputAmount) || !BigNumber(inputAmount).gt(0)){
      return 0
    }
    const {amount ,shares} = this.props.nodeDetail
    let sharePerAmount = new BigNumber(shares).dividedBy(amount).toString()
    let realShare = new BigNumber(inputAmount).multipliedBy(sharePerAmount).toFixed(4,1).toString()
    realShare = toNonExponential(realShare)
    return realShare
  }

  onClickAll=()=>{
    let {  nodeDetail } = this.props
    nodeDetail && nodeDetail.amount || "0"
    this.callSetState({
      amount:nodeDetail && nodeDetail.amount || "0",
      reclaimShare:nodeDetail && nodeDetail.shares || "0",
    },()=>{
      this.setBtnStatus()
    })
  }
  renderSendAmount = () => {
    let { accountInfo, nodeDetail } = this.props
    let amount = 0
    let amountTitle = getLanguage('amount')
    let amountDesc = getLanguage("canUseAmount") + ":"
    let bottomText = ""
    let showTip = false
    if (this.state.stakeType === SEND_PAGE_TYPE_STAKE || this.state.stakeType === SEND_PAGE_TYPE_SEND) {
      amount = accountInfo.liquid_balance
    } else {
      showTip = true
      amount = nodeDetail && nodeDetail.amount || "0"
      amountDesc = getLanguage('canReclaimAmount') + ":"
      bottomText = this.state.reclaimShare||"0"
    }
    amount = getDisplayAmount(amount)
    return (
      <div>
        <div className={"send-amount-container"}>
          <div className={"send-amount-top"}>
            <p className={"send-amount-title"}>{amountTitle}</p>
            <div className={"send-amount-desc-container"}>
              <p className={"send-amount-desc"}>{amountDesc}</p>
              <p className={"send-amount-desc-amount"}>{amount}</p>
            </div>

          </div>
          <div className={"send-input-con"}>
          <input
            className="send-input"
            type={"text"}
            onChange={this.onAmountInput}
            placeholder={"0"}
            value={"" || this.state.amount}
          />
          {showTip && <p onClick={this.onClickAll} className={"send-amount-all click-cursor"}>{getLanguage('all')}</p>}
          </div>
        </div>
       {showTip&& <div className={"send-amount-share"}>
          <p className={"send-amount-share-content"}>{getLanguage('sendShares')+": "}{bottomText}</p>
        </div>}
      </div>
    )
  }
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
  render() {
    let title = ""
    if (this.state.stakeType === SEND_PAGE_TYPE_STAKE) {
      title = getLanguage('AddEscrow')
    } else if (this.state.stakeType === SEND_PAGE_TYPE_RECLAIM) {
      title = getLanguage('reclaim')
    } else {
      title = getLanguage('send')
    }
    return (<CustomView
      title={title}
      middleComponent={this.renderNetMenu()}
      rightComponent={this.renderMyIcon()}
      disableAccountSelect={true}
      history={this.props.history}>
      <form onSubmit={this.onSubmit}>
        {this.renderSendAmount()}
        {this.renderToAddress()}
        {this.renderAdvance()}
        {this.renderAdvanceOption()}
      </form>
      {this.renderConfirm()}
      {this.renderConfirmModal()}
    </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
  netAccount: state.accountInfo.netAccount,
  accountInfo: state.accountInfo,
  nodeDetail: state.cache.currentNodeDetail,
  sendPageType: state.cache.sendPageType,
  addressDetail: state.cache.addressDetail,
  shouldRefresh: state.accountInfo.shouldRefresh,
  netConfig: state.network,
  refreshAccountCommon: state.accountInfo.refreshAccountCommon,
});

function mapDispatchToProps(dispatch) {
  return {
    updateNetAccount: (netAccount) => {
      dispatch(updateNetAccount(netAccount))
    },
    updateAddressBookFrom: (from) => {
      dispatch(updateAddressBookFrom(from))
    },
    updateNetConfigList: (config) => {
      dispatch(updateNetConfigList(config))
    },
    updateNetConfigRequest: (shouldRefresh) => {
      dispatch(updateNetConfigRequest(shouldRefresh))
    },
    updateSendRefresh: () => {
      dispatch(updateSendRefresh())
    },
    updateRpcNonce: (nonce) => {
      dispatch(updateRpcNonce(nonce))
    },

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendPage);
