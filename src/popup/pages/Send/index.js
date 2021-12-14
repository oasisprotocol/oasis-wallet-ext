import BigNumber from "bignumber.js";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { cointypes, network_config } from "../../../../config";
import address_book from "../../../assets/images/address_book.png";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import record_arrow from "../../../assets/images/record_arrow.png";
import { getBalance, getRpcNonce, getRuntimeBalance } from "../../../background/api";
import { saveLocal } from "../../../background/storage/localStorage";
import { undelegateTransaction, delegateTransaction, sendTransaction} from "../../../background/api/txHelper";
import { NETWORK_CONFIG } from "../../../constant/storageKey";
import { SEND_PAGE_TYPE_RECLAIM, SEND_PAGE_TYPE_RUNTIME_DEPOSIT, SEND_PAGE_TYPE_SEND, SEND_PAGE_TYPE_STAKE, SEND_PAGE_TYPE_RUNTIME_WITHDRAW, WALLET_CHECK_TX_STATUS, WALLET_SEND_RECLAIM_TRANSACTION, WALLET_SEND_RUNTIME_DEPOSIT, WALLET_SEND_STAKE_TRANSACTION, WALLET_SEND_TRANSACTION, WALLET_SEND_RUNTIME_WITHDRAW, WALLET_SEND_RUNTIME_EVM_WITHDRAW } from "../../../constant/types";
import { ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateNetAccount, updateRpcNonce, updateSendRefresh } from "../../../reducers/accountReducer";
import { updateAddressBookFrom, updateNetConfigRequest } from "../../../reducers/cache";
import { updateNetConfigList } from "../../../reducers/network";
import { sendMsg } from "../../../utils/commonMsg";
import { checkLedgerConnect } from "../../../utils/ledger";
import { addressSlice, amountDecimals, getDisplayAmount, getNumberDecimals, isNumber, isTrueNumber, toNonExponential, trimSpace } from "../../../utils/utils";
import { addressValid, evmAddressValid } from "../../../utils/validator";
import AccountIcon from "../../component/AccountIcon";
import Button from "../../component/Button";
import CustomInput from "../../component/CustomInput";
import CustomView from "../../component/CustomView";
import Loading from "../../component/Loading";
import Select from "../../component/Select";
import TestModal from "../../component/TestModal";
import Toast from "../../component/Toast";
import "./index.scss";
import { RUNTIME_ACCOUNT_TYPE } from "../../../constant/paratimeConfig";
 
const STAKE_MIN_AMOUNT = 100
class SendPage extends React.Component {
  constructor(props) {
    super(props);
    let type = props.sendPageType
    let pageConfig = this.getPageConfig(type)
    this.state = {
      toAddress: pageConfig.toAddressShowValue,
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
      reclaimShare:"",
      pageTitle:pageConfig.pageTitle,
      maxWithdrawAmount:0
    };
    this.modal = React.createRef();
    this.isUnMounted = false;
    this.currentNetConfig = {}
    this.isRequest = false
    this.pageConfig = pageConfig
  }
  componentWillUnmount() {
    this.isUnMounted = true;
  }
  getPageConfig=(type)=>{
    const {nodeDetail,addressDetail,accountInfo,currentAccount,location} = this.props
    let params = location?.params || {}

    let pageTitle = ""

    let maxCanUseAmount = accountInfo.liquid_balance
    let isReclaim = false 

    let toAddressTitle= ""
    let toAddressCanInput = false
    let toAddressPlaceHolder=""
    let toAddressValue = ""
    let toAddressShowValue= "" 
    let showAddressBook = false
    let toAddressCanInputDefaultValue = ""
    
    let runtimeId = params.runtimeId||""
    let currentAllowance = params.allowance|| 0
    let runtimeType = params.accountType||""
    let runtimeDecimals = params.decimals||cointypes.decimals
    let isWithdraw = false
    

    let confirmTitle = ""
    let confirmToAddressTitle = ""

    let sendAction = "" 


    let stakeAddress =  nodeDetail.validatorAddress || nodeDetail.entityAddress
    let stakeShowAddress = nodeDetail.validatorName || nodeDetail.name || nodeDetail.validatorAddress || nodeDetail.entityAddress
    
    switch (type) {
      case SEND_PAGE_TYPE_RUNTIME_DEPOSIT:
        if(runtimeId){

          if(runtimeType === RUNTIME_ACCOUNT_TYPE.EVM){
            toAddressPlaceHolder = "0x..."
            toAddressCanInput = true
          }else{
            toAddressPlaceHolder = currentAccount.address || ""
            toAddressCanInput = true
            toAddressCanInputDefaultValue = currentAccount.address
          }
        }
        
        sendAction = WALLET_SEND_RUNTIME_DEPOSIT


        pageTitle = getLanguage('send')  
        toAddressTitle=getLanguage('toAddress')
        confirmTitle = getLanguage('sendDetail')
        confirmToAddressTitle = getLanguage('toAddress')
        break
      case SEND_PAGE_TYPE_RUNTIME_WITHDRAW:
        maxCanUseAmount = 0 
        if(runtimeId){

          if(runtimeType === RUNTIME_ACCOUNT_TYPE.EVM){
            toAddressPlaceHolder = "oasis..."
            toAddressCanInput = true
            sendAction = WALLET_SEND_RUNTIME_EVM_WITHDRAW
          }else{
            toAddressPlaceHolder = currentAccount.address || ""
            toAddressCanInput = true
            toAddressCanInputDefaultValue = currentAccount.address
            sendAction = WALLET_SEND_RUNTIME_WITHDRAW
          }
        }

        pageTitle = getLanguage('send')  
        toAddressTitle=getLanguage('toAddress')
        confirmTitle = getLanguage('sendDetail')
        confirmToAddressTitle = getLanguage('toAddress')

        isWithdraw = true
        break
      case SEND_PAGE_TYPE_STAKE:
        pageTitle = getLanguage('AddEscrow')

        toAddressTitle=getLanguage('stakeNodeName')

        toAddressValue = stakeAddress
        toAddressShowValue = stakeShowAddress

        sendAction = WALLET_SEND_STAKE_TRANSACTION

        confirmTitle = getLanguage('stakeDetail')
        confirmToAddressTitle = getLanguage('stakeNodeName')
        break
      case SEND_PAGE_TYPE_RECLAIM:
        pageTitle = getLanguage('reclaim')
        
        let debondAmount = nodeDetail && nodeDetail.amount || "0"
        maxCanUseAmount = new BigNumber(debondAmount).toNumber()
        isReclaim = true

        toAddressTitle=getLanguage('stakeNodeName')
        toAddressValue = stakeAddress
        toAddressShowValue = stakeShowAddress

        sendAction = WALLET_SEND_RECLAIM_TRANSACTION

        confirmTitle = getLanguage('stakeDetail')
        confirmToAddressTitle = getLanguage('stakeNodeName')
        break

      case SEND_PAGE_TYPE_SEND:
      default:
        pageTitle = getLanguage('send')  

        toAddressTitle=getLanguage('toAddress')
        toAddressCanInput = true
        toAddressPlaceHolder = getLanguage('inputToAddress')

        toAddressValue = addressDetail.address || ""
        toAddressShowValue = toAddressValue

        showAddressBook = true

        sendAction = WALLET_SEND_TRANSACTION

        confirmTitle = getLanguage('sendDetail')
        confirmToAddressTitle = getLanguage('toAddress')
        break
    }
    return {
      pageTitle,
      maxCanUseAmount,
      isReclaim,
      toAddressTitle,
      toAddressValue,
      showAddressBook,
      toAddressCanInput,
      toAddressPlaceHolder,
      toAddressShowValue,
      runtimeType,
      runtimeId,
      confirmTitle,
      confirmToAddressTitle,
      sendAction,
      currentAllowance,
      runtimeDecimals,
      isWithdraw,
      toAddressCanInputDefaultValue
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
  async componentDidMount() {
    let { isWithdraw } = this.pageConfig
    this.netConfigAction()
    if(isWithdraw){
      await this.fetchParatimeData()
    }else{
      await this.fetchData()
    }
  }
  fetchParatimeData= async(isSilent)=>{
    if (this.isRequest) {
      return
    }
    this.isRequest = true
    if(!isSilent){
      Loading.show()
    }
    let { currentAccount } = this.props
    let { runtimeId,runtimeDecimals } = this.pageConfig
    let address = currentAccount.address
    let amount = await getRuntimeBalance(address,runtimeId,runtimeDecimals)
    if(isNumber(amount)){
      this.callSetState({
        maxWithdrawAmount:amount
      })
    }
    this.isRequest = false
    if(!isSilent){
      Loading.hide()
    }
  }
  fetchData = async (isSilent) => {
    if (this.isRequest) {
      return
    }
    if(!isSilent){
      Loading.show()
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
    if(!isSilent){
      Loading.hide()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.refreshAccountCommon && !this.isRequest) {
      let { isWithdraw } = this.pageConfig
      if(isWithdraw){
        this.fetchParatimeData(true)
      }else{
        this.fetchData(true)
      }
    }
  }
  setBtnStatus = () => {
    const {toAddressCanInputDefaultValue} = this.pageConfig
    let toAddress = this.state.toAddress || toAddressCanInputDefaultValue
    if (toAddress.length > 0
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
      return (
        <div className={"send-address-book-container click-cursor"} onClick={this.onGotoAddressBook}>
          <img src={address_book} className={"send-address-book"} />
        </div>
      )
  }
  renderToAddressRightComponent=()=>{
    const {runtimeId,showAddressBook} = this.pageConfig
    if(runtimeId){
      return this.renderRightRuntime()
    }else if(showAddressBook){
      return this.renderAddressBook()
    }
    return <></>
  }
  renderToAddress = () => {
    const {toAddressCanInput,toAddressTitle,toAddressPlaceHolder,toAddressShowValue} = this.pageConfig
    if(toAddressCanInput){
      return (
        <div className={"send-address-container"}>
          <CustomInput
            value={this.state.toAddress}
            label={toAddressTitle}
            placeholder={toAddressPlaceHolder}
            onTextInput={this.onToAddressInput}
            rightComponent={this.renderToAddressRightComponent()}
          />
        </div>)
    }else{
      return (
        <div className={"send-address-container"}>
          <CustomInput
            value={toAddressShowValue}
            label={toAddressTitle}
            readOnly={"readonly"}
            rightComponent={this.renderToAddressRightComponent()}
          />
        </div>)
    }
  }
  renderRightRuntime=()=>{
    if(this.state.stakeType !== SEND_PAGE_TYPE_RUNTIME_DEPOSIT){
      return <></>
    }
    let params = this.props?.location?.params || {}
    let runtimeName = params.runtimeName
    let runtimeId = params.runtimeId
    return(<p className={"runtimeName"}>{runtimeName}<span className={"runtimeId"}>{"("+addressSlice(runtimeId,6)+")"}</span></p>)
  }
  onAmountInput = (e) => {
    let amount = e.target.value;
    let reclaimShare = ""
    if(this.state.stakeType === SEND_PAGE_TYPE_RECLAIM){
      reclaimShare = this.getReclaimShare(amount)
    }
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
    const { runtimeId } = this.pageConfig
    let accountInfo = this.props.accountInfo
    let nonceHolder = isNumber(accountInfo.nonce) ? "Nonce " + accountInfo.nonce : "Nonce "
    return (
      <div className={
        cx({
          "advance-option-show": this.state.isOpenAdvance,
          "advance-option-hide": !this.state.isOpenAdvance,
        })
      }>
        {!runtimeId && <CustomInput
          value={this.state.nonce}
          placeholder={nonceHolder}
          onTextInput={this.onNonceInput}
        />}
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
  checkBalanceEnough=(amount,payFee)=>{
    const { maxCanUseAmount,isWithdraw } = this.pageConfig
    let maxAmount = isWithdraw ? this.state.maxWithdrawAmount:maxCanUseAmount
  
    let checkStatus = true
    let inputAmount = new BigNumber(amount).plus(payFee).toNumber()
    
    if(BigNumber(inputAmount).gt(maxAmount)){
      Toast.info(getLanguage('canUseNotEnough'))
      checkStatus = false
      return 
    }
    if(this.state.stakeType === SEND_PAGE_TYPE_STAKE){
      if(!BigNumber(amount).gte(STAKE_MIN_AMOUNT)){
        Toast.info(getLanguage('minStakeAmount') + " " + STAKE_MIN_AMOUNT)
        checkStatus = false
        return 
      }
    }
    return checkStatus
  }
  onConfirm = async () => {
    let { currentAccount } = this.props
    const { toAddressCanInput,runtimeType,isWithdraw,toAddressCanInputDefaultValue } = this.pageConfig
    if (currentAccount.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
      Toast.info(getLanguage('observeAccountTip'))
      return
    }
    let toAddress = trimSpace(this.state.toAddress) || toAddressCanInputDefaultValue

    if(toAddressCanInput){
      if(runtimeType ===RUNTIME_ACCOUNT_TYPE.EVM && !isWithdraw){
        if(!evmAddressValid(toAddress)){
          Toast.info(getLanguage('sendAddressError'))
          return
        }
      }else{
        if (!addressValid(toAddress)) {
          Toast.info(getLanguage('sendAddressError'))
          return
        }
      }
    }

    let amount = trimSpace(this.state.amount)
    if (!isNumber(amount) || !new BigNumber(amount).gt(0)) {
      Toast.info(getLanguage('amountError'))
      return
    }

    let decimals = getNumberDecimals(amount)
    if (decimals > cointypes.decimals) {
      Toast.info(getLanguage('minAmount', { decimals: cointypes.decimals }))
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


    let checkStatus = this.checkBalanceEnough(amount,payFee)
    if(!checkStatus){
      return
    }
    let nonce = trimSpace(this.state.nonce)
    if (nonce.length > 0 && !isNumber(nonce)) {
      Toast.info(getLanguage('inputNonceError'))
      return
    }

    this.modal.current.setModalVisible(true)
  }
  onCancel = () => {
    this.modal.current.setModalVisible(false)
  }
  ledgerTransfer = async (payload) => {
    try {
      let app = await checkLedgerConnect()
      let ledgerApp = app.ledgerApp

      payload.ledgerApp = ledgerApp
      let sendResult
      if (this.state.stakeType === SEND_PAGE_TYPE_STAKE) {
        sendResult = await delegateTransaction(payload)
      } else if (this.state.stakeType === SEND_PAGE_TYPE_SEND) {
        sendResult = await sendTransaction(payload)
      } else if (this.state.stakeType === SEND_PAGE_TYPE_RECLAIM) {
        sendResult = await undelegateTransaction(payload) 
      }else  if(this.state.stakeType === SEND_PAGE_TYPE_RUNTIME_DEPOSIT || this.state.stakeType === SEND_PAGE_TYPE_RUNTIME_WITHDRAW){
        Toast.info(getLanguage("ledgerNotSupportTip"))
        return 
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
    const { toAddressCanInput,toAddressValue,sendAction,runtimeId,runtimeType,currentAllowance,toAddressCanInputDefaultValue } = this.pageConfig
    let currentAccount = this.props.currentAccount
    let accountInfo = this.props.accountInfo

    let shares = this.state.reclaimShare
    let amount = new BigNumber(this.state.amount).toString()
    amount = toNonExponential(amount)
    let toAddress = ""
    if(toAddressCanInput){
      toAddress = trimSpace(this.state.toAddress)||toAddressCanInputDefaultValue
    } else {
      toAddress = toAddressValue
    }
    let nonce = trimSpace(this.state.nonce) || accountInfo.nonce
    let fromAddress = currentAccount.address

    let feeAmount = trimSpace(this.state.feeAmount)
    let feeGas = trimSpace(this.state.feeGas)

    let depositAddress = ""
    if(runtimeType === RUNTIME_ACCOUNT_TYPE.EVM){
      depositAddress = trimSpace(this.state.toAddress)
    }else if(runtimeType === RUNTIME_ACCOUNT_TYPE.OASIS){
      depositAddress = toAddress
    }

    let allowance = currentAllowance 
    
    let payload = {
      fromAddress,toAddress,amount,feeAmount,feeGas,currentAccount
    }

    if(this.state.stakeType !== SEND_PAGE_TYPE_RUNTIME_WITHDRAW){
      payload.nonce = nonce
    }
    if(this.state.stakeType === SEND_PAGE_TYPE_RECLAIM){ 
      payload.shares = shares
    }
    if(this.state.stakeType === SEND_PAGE_TYPE_RUNTIME_DEPOSIT){
      payload.depositAddress = depositAddress
      payload.allowance = allowance
    }

    if(runtimeId){
      payload.runtimeId = runtimeId
    }
   
    Loading.show()

    this.modal.current.setModalVisible(false)

    if (currentAccount.type === ACCOUNT_TYPE.WALLET_LEDGER) {
      return this.ledgerTransfer(payload)
    }
    sendMsg({
      action: sendAction,
      payload
    }, (data) => {
      Loading.hide()
      this.onSubmitSuccess(data)
    })
  }
  onSubmitRuntime=(data)=>{
    if(data && data.code === 0){
      Toast.info(getLanguage('postSuccess'))
      setTimeout(() => {
        this.props.history.goBack()
      }, 100);
    }else{
      let errMessage =
        data?.message ||
        data?.error?.message ||
        data?.error?.metadata?.['grpc-message'] ||
        getLanguage('postFailed')
      Toast.info(errMessage)
    }
  }
  onSubmitSuccess = (data) => {
    const { runtimeId } = this.pageConfig
    if(runtimeId){
        this.onSubmitRuntime(data)
        return 
    }
    if (data && data.hash) {
      Toast.info(getLanguage('postSuccess'))
      this.props.history.replace({
        pathname: "/record_page",
        params: {
          txDetail: data
        }
      })
    } else {
      let errMessage =
        data?.message ||
        data?.error?.message ||
        data?.error?.metadata?.['grpc-message'] ||
        getLanguage('postFailed')
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
    const {confirmTitle,confirmToAddressTitle,runtimeId,toAddressCanInputDefaultValue} = this.pageConfig
    let accountInfo = this.props.accountInfo
    let netNonce = isNumber(accountInfo.nonce) ? accountInfo.nonce : ""
    let nonce = this.state.nonce ? this.state.nonce : netNonce

    let feeAmount = this.state.feeAmount ? this.state.feeAmount : 0
    feeAmount = toNonExponential(amountDecimals(feeAmount, cointypes.decimals))
    let title = ""
    let toTitle = ""
    if(this.state.confirmModalLoading){
      title = getLanguage("waitLedgerConfirm")
    }else{
      title = confirmTitle
      toTitle = confirmToAddressTitle
    }

    let currentSymbol = this.props.netConfig.currentSymbol
    let toAddressShow = this.state.toAddress || toAddressCanInputDefaultValue
    return (
      <div className={"confirm-modal-container"}>
        <div className={"test-modal-title-container"}><p className={"test-modal-title"}>{title}</p></div>
        {this.renderConfirmItem(getLanguage('amount'), this.state.amount + " " + currentSymbol, true)}
        {this.renderConfirmItem(toTitle, toAddressShow)}
        {this.renderConfirmItem(getLanguage('fromAddress'), this.state.fromAddress)}
        {this.renderConfirmItem(getLanguage('fee'), feeAmount + " " + currentSymbol)}
        {!runtimeId && isNumber(nonce) && this.renderConfirmItem("Nonce", nonce)}
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
    this.modal.current.setModalVisible(false)
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
    const { maxCanUseAmount,isReclaim,isWithdraw } = this.pageConfig
    let { maxWithdrawAmount } = this.state
    let amount = 0
    if(isWithdraw){
      amount = getDisplayAmount(maxWithdrawAmount)
    }else{
      amount = getDisplayAmount(maxCanUseAmount)
    }
    let amountTitle = getLanguage('amount')

    let bottomText = ""
    let showTip = false
    let sendAmountDesc = getLanguage("canUseAmount")  + ": " 

    if(isReclaim ){
      showTip = true
      bottomText = this.state.reclaimShare|| "0"
      sendAmountDesc = getLanguage('canReclaimAmount') + ": "
    } 
    return (
      <div>
        <div className={"send-amount-container"}>
          <div className={"send-amount-top"}>
            <p className={"send-amount-title"}>{amountTitle}</p>
            <div className={"send-amount-desc-container"}>
              <p className={"send-amount-desc"}>{sendAmountDesc}</p>
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
       {bottomText && <div className={"send-amount-share"}>
          <p className={"send-amount-share-content"}>{getLanguage('sendShares')+": "}{bottomText}</p>
        </div>}
      </div>
    )
  }
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
    saveLocal(NETWORK_CONFIG, JSON.stringify(config))
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
    return (<CustomView
      title={this.state.pageTitle}
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
