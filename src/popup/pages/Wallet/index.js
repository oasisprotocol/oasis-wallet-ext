import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import noHistory from "../../../assets/images/noHistory.png";
import refreshIcon from "../../../assets/images/refresh.svg";
import txCommonType from "../../../assets/images/txCommonType.svg";
import txReceive from "../../../assets/images/txReceive.svg";
import txSend from "../../../assets/images/txSend.svg";
import wallet_receive from "../../../assets/images/wallet_receive.png";
import wallet_send from "../../../assets/images/wallet_send.png";
import { getBalance, getRpcNonce, getTransactionList } from "../../../background/api";
import { DAPP_ACCOUNT_CONNECT_SITE, DAPP_CHANGE_CONNECTING_ADDRESS, DAPP_DISCONNECT_SITE, DAPP_GET_ALL_APPROVE_ACCOUNT, SEND_PAGE_TYPE_SEND, WALLET_CHANGE_CURRENT_ACCOUNT, WALLET_SEND_RUNTIME_EVM_WITHDRAW } from "../../../constant/types";
import { ACCOUNT_TYPE, TRANSACTION_TYPE } from '../../../constant/walletType';
import { getLanguage } from "../../../i18n";
import { updateAccountTx, updateCurrentAccount, updateNetAccount, updateRpcNonce } from "../../../reducers/accountReducer";
import { setAccountInfo, updateDappConnectList, updateNetConfigRequest, updateSendPageType } from "../../../reducers/cache";
import { updateNetConfigList } from "../../../reducers/network";
import { openTab, sendMsg } from '../../../utils/commonMsg';
import { addressSlice, connectAccountDataFilter, copyText, getExplorerUrl, isNumber } from "../../../utils/utils";
import Button from "../../component/Button";
import Clock from "../../component/Clock";
import TestModal from "../../component/TestModal";
import Toast from "../../component/Toast";
import WalletBar from "../../component/WalletBar";
import "./index.scss";
import oasisIcon from "../../../assets/images/oasisIcon.svg";
import evmIcon from "../../../assets/images/evmIcon.svg";
import blueArrow from "../../../assets/images/blueArrow.svg";

import { updateHomeIndex } from "../../../reducers/tabRouteReducer";
class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: "0.0000",
      txList: props.txList,
      refreshing: false,
      showConnectedHover: false,
    }
    this.isUnMounted = false;
    this.currentNetConfig = {}
    this.isRequest = true
    this.dappConnectCount = 0
    this.modal = React.createRef();
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
    let { currentAccount } = this.props
    let address = currentAccount.address
    if(!currentAccount.evmAddress){
      this.fetchData(address, true)
    }
    this.getDappConnect()
  }
  getDappConnect() {
    let { currentAccount, currentActiveTabUrl } = this.props
    let address = currentAccount.address
    sendMsg({
      action: DAPP_GET_ALL_APPROVE_ACCOUNT,
      payload: {
        siteUrl: currentActiveTabUrl,
      }
    }, (accountList) => {
      this.dappConnectCount = accountList.length
      if (accountList.length === 0) {
        this.props.updateDappConnectList([])
      } else {
        let newAccountList = this.dappAccountSort(accountList, address)
        let keysList = newAccountList.map((item, index) => {
          return item.address
        })
        if (keysList.indexOf(address) !== -1) {
          this.props.updateDappConnectList(newAccountList)
        } else {
          let current = connectAccountDataFilter(currentAccount)
          this.props.updateDappConnectList([
            current,
            ...newAccountList
          ])
        }
      }
    })
  }

  dappAccountSort = (list, address) => {
    list.map((item, index) => {
      if (item.address === address) {
        list.unshift(list.splice(index, 1)[0]);
      }
    })
    return list
  }

  fetchData = async (address, firstRequest = false) => {
    this.props.updateNetConfigRequest(false)
    if (!firstRequest && this.isRequest) {
      return
    }
    this.isRequest = true

    let balanceRequest = getBalance(address)
    let txRequest = getTransactionList(address)
    await Promise.all([balanceRequest, txRequest]).then((data) => {
      let account = data[0]
      let txList = data[1]
      if (account.error) {
        Toast.info(getLanguage('nodeError'))
      } else if (account && account.address) {
        this.props.updateNetAccount(account)
      }
      this.props.updateAccountTx(txList.list)
      this.isRequest = false
    })
    getRpcNonce(address).then((nonce) => {
      if (isNumber(nonce)) {
        this.props.updateRpcNonce(nonce)
      }
    })
  }
  onRefresh = async () => {
    if (this.state.refreshing) {
      return
    }
    this.callSetState({
      refreshing: true
    })
    await this.fetchData(this.props.currentAccount.address)
    this.callSetState({
      refreshing: false
    })
  }

  onClickAddress = (copyAddress) => {
    copyText(copyAddress).then(() => {
      Toast.info(getLanguage('copySuccess'))
    })

  }

  renderAccountItemInfo = (title, content) => {
    return (<div className={"account-info-item-container"}>
      <p className={"wallet-info-title"}>{title}</p>
      <p className={"wallet-info-content"}>{content}</p>
    </div>)
  }
  onMouseEnter = (grpc) => {
    this.callSetState({
      showConnectedHover: true
    })
  }
  onMouseLeave = () => {
    this.callSetState({
      showConnectedHover: false
    })
  }
  renderModalTitle = () => {
    const { currentActiveTabUrl } = this.props
    return (<div className={''}>
      <p className={'dapp-modal-title'}>
        {currentActiveTabUrl}
      </p>
    </div>)
  }
  renderAccountConnectStatus = (account) => {
    let { currentAccount } = this.props
    let address = currentAccount.address
    let currentDappConnect = getLanguage('changeToAccount')
    if (account.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
      currentDappConnect = getLanguage('observeAccount')
      return (
        <div className={"dapp-connect-current-dis"} >
          <p className={"dapp-connect-dis-content"}>{currentDappConnect}</p>
        </div>
      )
    }
    if (account.address === address) {
      if (account.isConnected) {
        currentDappConnect = getLanguage("currentAccount")
        return (
          <p className={"dapp-connect-current"}>{currentDappConnect}</p>
        )
      } else {
        currentDappConnect = getLanguage('dappDisconnect')
        return (
          <div className={"dapp-connect-current-dis"} >
            <p className={"dapp-connect-dis-content"}>{currentDappConnect}</p>
          </div>
        )
      }
    } else {
      return (
        <div className={'click-cursor'} onClick={() => this.onClickChangeAccount(account)}>
          <p className={"dapp-connect-item-change"}>{currentDappConnect}</p>
        </div>
      )
    }

  }
  /**
   * change current account
   * @param {*} account
   */
  onClickChangeAccount = (account) => {
    sendMsg({
      action: WALLET_CHANGE_CURRENT_ACCOUNT,
      payload: account.address
    }, (account) => {
      if (account.accountList && account.accountList.length > 0) {
        this.props.updateCurrentAccount(account.currentAccount)
        sendMsg({
          action: DAPP_CHANGE_CONNECTING_ADDRESS,
          payload: {
            address: account.currentAccount.address
          }
        }, (status) => {
          this.getDappConnect()
        })

      }
    })
  }
  /**
   * change account connect status
   * @param {*} account
   */
  onClickConnect = (account) => {
    let { currentAccount, currentActiveTabUrl } = this.props
    if (account.isConnected) {
      let address = account.address
      sendMsg({
        action: DAPP_DISCONNECT_SITE,
        payload: {
          siteUrl: currentActiveTabUrl,
          address,
          currentAddress: currentAccount.address
        }
      }, (status) => {
        this.getDappConnect()
        Toast.info(getLanguage('disconnectSuccess'))
      })
    } else {
      sendMsg({
        action: DAPP_ACCOUNT_CONNECT_SITE,
        payload: {
          siteUrl: currentActiveTabUrl,
          account
        }
      }, (status) => {
        this.getDappConnect()
        Toast.info(getLanguage('connectSuccess'))
      })
    }
  }
  renderDAppAccount = (account, index) => {
    let accountName = account.accountName
    let address = addressSlice(account.address, 6)
    let showAddress = " (" + address + ") "
    let statusText = account.isConnected ? getLanguage('disconnect') : getLanguage('connect')
    let showDApp = account.isConnecting
    let isWatchAccount = account.type === ACCOUNT_TYPE.WALLET_OBSERVE
    return (
      <div key={index} className={"dapp-connect-item-container"}>
        <div className={"dapp-connect-item-top"}>
          <div className={"dapp-connect-item-top-inner"}>
            <p className={"dapp-connect-item-name"}>{accountName}</p>
            <p className={"dapp-connect-item-address"}>{showAddress}</p>
            {showDApp && <div className={"dapp-connect-account-container"}>
              <p className={"dapp-connect-item-account"}>DApp</p>
            </div>}
          </div>
          {!isWatchAccount && <div className={"click-cursor"} onClick={() => this.onClickConnect(account)}>
            <p className={"dapp-connect-item-status"}>{statusText}</p>
          </div>}
        </div>
        {this.renderAccountConnectStatus(account)}
      </div>
    )
  }
  renderContent = () => {
    const { dappConnectAccountList } = this.props
    if (dappConnectAccountList.length > 0) {
      return (<div className={"wallet-connect-connect"}>
        <p>{getLanguage('followConnect', { number: this.dappConnectCount })}</p>
        <hr />
        <div className={"wallet-connect-item-container"}>
          {dappConnectAccountList.map((item, index) => {
            return this.renderDAppAccount(item, index)
          })}
        </div>
      </div>)
    } else {
      return (<div className={"wallet-connect-disconnect"}>
        <p className={"wallet-connect-disconnect-content"}>
          {getLanguage('needConnectTip')}
        </p>
      </div>)
    }
  }
  renderChangeModal = () => {
    return (<TestModal
      ref={this.modal}
      showClose={true}
    >
      <div className={'wallet-connect-container'}>
        {this.renderModalTitle()}
        {this.renderContent()}
      </div>
    </TestModal>)
  }
  onClickDappConnect = (e) => {
    this.modal.current.setModalVisible(true)
  }
  onCloseModal = () => {
    this.modal.current.setModalVisible(false)
  }
  renderAccountName=()=>{
    let { currentAccount } = this.props
    let accountName = currentAccount && currentAccount.accountName
    let icon = currentAccount.evmAddress ? evmIcon:oasisIcon
    return(<div className="account-address-container">
    <p className="account-name">{accountName}</p>
    <img className="accountLogo" src={icon} />
  </div>)
  }
  renderAccount = () => {
    let { currentAccount, accountInfo, dappConnectAddressList } = this.props
    let {
      total_balance,
      liquid_balance,
      delegations_balance,
      debonding_delegations_balance
    } = accountInfo
    let address = currentAccount.address
    let total_balance_display = total_balance
    let liquid_balance_display = liquid_balance
    let delegations_balance_display = delegations_balance
    let debonding_delegations_balance_display = debonding_delegations_balance
    let currentConnected = dappConnectAddressList.indexOf(address) !== -1
    let showTip = currentConnected ? getLanguage("dappConnect") : getLanguage("dappDisconnect")
    return (
      <div className="account-container">
        <div className={"account-container-top"}>
          <div>
            {this.renderAccountName()}
            <p className="account-address account-address-margin click-cursor" onClick={()=>this.onClickAddress(currentAccount.address)}>{addressSlice(currentAccount.address)}</p>
          </div>
          <div className={'account-container-top-right'}>
            <div className={"dapp-connect-con"}>
              <img className={cx("click-cursor", {
                "dapp-connect-button-icon": currentConnected,
                "dapp-disconnect-button-icon": !currentConnected,
              })}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onMouseMove={this.onMouseEnter}
                onClick={() => {
                  this.onClickDappConnect()
                }}
              />
              {
                this.state.showConnectedHover
                &&
                <div className={"dapp-connect-button"}>
                  <div className={"dapp-connect-arrow"}></div>
                  <p className={"dapp-connect-content"}>
                    {showTip}
                  </p>
                </div>}
            </div>
            <div className="account-manager click-cursor"
              onClick={() => {
                let { currentAccount } = this.props
                this.props.setAccountInfo(currentAccount)
                this.goToPage("/account_info")
              }}
            />
          </div>
        </div>

        <p className={"account-divided"} />
        <div className={'wallet-balance-container'}>
          {this.renderAccountItemInfo(getLanguage('balance'), total_balance_display)}
          {this.renderAccountItemInfo(getLanguage('availableBalance'), liquid_balance_display)}
          {this.renderAccountItemInfo(getLanguage('activeDelegationsBalance'), delegations_balance_display)}
          {this.renderAccountItemInfo(getLanguage('debonding'), debonding_delegations_balance_display)}
          {this.renderParatimeRow()}
        </div>
      </div>)
  }
  goToPage = (name, params) => {
    this.props.params.history.push({
      pathname: name,
      params: {
        ...params
      }
    })
  };
  renderActionBtn = () => {
    return (<div className={"home-button-container"}>
      <Button
        content={getLanguage('send')}
        onClick={() => {
          this.goToPage("/send_page")
          this.props.updateSendPageType(SEND_PAGE_TYPE_SEND)
        }}
        propsClass={"home-send-btn wallet-common"}
        imgLeft={true}
      >
        <img className="wallet-button-img" src={wallet_send} />
      </Button>
      <Button
        content={getLanguage('receive')}
        onClick={() => this.goToPage("/receive_page")}
        propsClass={"home-receive-btn wallet-common"}
        imgLeft={true}
      >
        <img className="wallet-button-img" src={wallet_receive} />
      </Button>
    </div>)
  }
  goParatimePage=()=>{
    this.props.updateHomeIndex(2)
  }
  renderParatimeRow=()=>{
    let { currentAccount } = this.props
    let isEvm = currentAccount.evmAddress
    return(<div className={
      cx("account-info-title-container click-cursor",{
      "evm-arrow-row": isEvm,
    })} onClick={this.goParatimePage}>
    <p className={"wallet-info-title"}>{getLanguage('paratime')}</p>
   <img src={blueArrow} className={"account-item-option"} />
  </div>)
  }
  renderEvmWalletInfo =()=>{
    let { currentAccount } = this.props
    return (
      <div className="wallet-info">
      <div className="account-container">
        <div className={"account-container-top"}>
          <div>
            {this.renderAccountName()}
            <p className="account-address click-cursor" onClick={()=>this.onClickAddress(currentAccount.address)}>{addressSlice(currentAccount.address)}</p>
            {currentAccount.evmAddress && <p className={"account-evm-address click-cursor"} onClick={()=>this.onClickAddress(currentAccount.evmAddress)}>{addressSlice(currentAccount.evmAddress)}</p>}
          </div>
          <div className={'account-container-top-right'}>
            <div className="account-manager click-cursor"
              onClick={() => {
                let { currentAccount } = this.props
                this.props.setAccountInfo(currentAccount)
                this.goToPage("/account_info")
              }}
            />
          </div>
        </div>
        <p className={"account-divided"} />
        {this.renderParatimeRow()}
      </div>
    </div>)
  }
  renderWalletInfo = () => {
    return (<div className="wallet-info">
      {this.renderAccount()}
      {this.renderActionBtn()}
    </div>)
  }
  getTxSource = (type, isReceive) => {
    if (type === TRANSACTION_TYPE.Transfer) {
      return isReceive ? txReceive : txSend
    }
    return txCommonType
  }
  onClickItem = (item) => {
    this.props.params.history.push({
      pathname: "/record_page",
      params: {
        txDetail: item
      }
    })
  }
  getStatusColor = (item) => {
    let className = "tx-pending-title"
    if (item.status) {
      className = "tx-success-title"
    } else {
      className = "tx-failed-title"
    }
    return className
  }
  onClickGoExplorer = () => {
    let url = getExplorerUrl() + "accounts/detail/" + this.props.currentAccount.address
    openTab(url)
  }
  renderListExplorer = (index) => {
    return (<div key={index + ""} onClick={this.onClickGoExplorer} className={"home-bottom-explorer click-cursor"}>
      <p className={"history-to-explorer"}>{getLanguage('toSeeMore')}</p>
    </div>)
  }
  renderTxList = (item, index) => {
    if (item.showExplorer) {
      return this.renderListExplorer(index)
    }
    let isReceive = true
    let showAddress = item.to
    if (item.method === TRANSACTION_TYPE.Transfer) {
      isReceive = item.to.toLowerCase() === this.props.currentAccount.address.toLowerCase()
    } else if (item.method === TRANSACTION_TYPE.AddEscrow) {
      isReceive = false
    }
    showAddress = addressSlice(showAddress, 8)
    let amount = item.amount
    amount = isReceive ? "+" + amount : "-" + amount

    let status = item.status
    let statusText = status ? getLanguage('backup_success_title') : getLanguage('txFailed')
    let imgSource = this.getTxSource(item.method, isReceive)
    let statusColor = this.getStatusColor(item)
    let time = new Date(parseInt(item.timestamp) * 1000).toJSON()
    return (
      <div key={index + ""} className={"tx-item-container click-cursor"} onClick={() => { this.onClickItem(item) }}>
        <div className={"tx-detail-container"}>
          <div className={"tx-top-container"}>
            <p className="tx-item-address">{showAddress}</p>
            <p className={cx({
              "tx-item-amount": true,
            })}>{amount}</p>
          </div>
          <div className={'tx-bottom-container'}>
            <div className={'tx-bottom-time-container'}>
              <img className={"tx-item-type"} src={imgSource} />
              <p className="tx-item-time">{time}</p>
            </div>
            <p className={cx({
              "tx-item-status": true,
              [statusColor]: true
            })}>{statusText}</p>
          </div>
        </div>
      </div>
    )
  }
  renderHistory = () => {
    let txList = this.props.txList
    if (this.props.refreshAccountLoading) {
      return (<div className={"home-loading-container"}>
        <img className={"confirm-loading-img"} src={loadingCommon} />
      </div>)
    }
    let noTx = txList.length <= 0
    return (
      <div className={"tx-container"}>
        <div className={"tx-row-container"}>
          <p className="tx-title">{getLanguage('history')}</p>
          <div
            className={cx('refresh-icon-con', { 'loading': this.state.refreshing })}
            onClick={this.onRefresh}>
            <img src={refreshIcon} />
          </div>
        </div>
        {noTx ?
          <div className={"no-tx-container"}>
            <img className={"no-tx-img"} src={noHistory} />
            <p className={"no-tx-content"}>{getLanguage('addressNoTx')}</p>
          </div> :
          txList.map((item, index) => {
            return this.renderTxList(item, index)
          })}
      </div>
    )
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.refreshAccountLoading && !this.isRequest) {
      let address = nextProps.currentAccount.address
      this.fetchData(address)
    }
  }
  render() {
    let { currentAccount } = this.props
    return (
      <div className="wallet-page-container">
        <div className={"home-wallet-top-container"}>
          <WalletBar history={this.props.params.history} />
        </div>
        {currentAccount.evmAddress ? this.renderEvmWalletInfo() : this.renderWalletInfo()}
        {!currentAccount.evmAddress && this.renderHistory()}
        {this.renderChangeModal()}
        <Clock schemeEvent={() => { this.fetchData(this.props.currentAccount.address) }} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
  netAccount: state.accountInfo.netAccount,
  balance: state.accountInfo.balance,
  txList: state.accountInfo.txList,
  accountInfo: state.accountInfo,
  netConfig: state.network,
  shouldRefresh: state.accountInfo.shouldRefresh,
  refreshAccountLoading: state.accountInfo.refreshAccountLoading,
  dappConnectAccountList: state.cache.dappConnectAccountList,
  dappConnectAddressList: state.cache.dappConnectAddressList,
  currentActiveTabUrl: state.cache.currentActiveTabUrl,
});

function mapDispatchToProps(dispatch) {
  return {
    updateNetAccount: (netAccount) => {
      dispatch(updateNetAccount(netAccount))
    },
    updateAccountTx: (txList) => {
      dispatch(updateAccountTx(txList))
    },
    setAccountInfo: (account) => {
      dispatch(setAccountInfo(account))
    },
    updateNetConfigList: (config) => {
      dispatch(updateNetConfigList(config))
    },
    updateSendPageType: (type) => {
      dispatch(updateSendPageType(type))
    },
    updateNetConfigRequest: (shouldRefresh) => {
      dispatch(updateNetConfigRequest(shouldRefresh))
    },
    updateRpcNonce: (nonce) => {
      dispatch(updateRpcNonce(nonce))
    },
    updateDappConnectList: (list) => {
      dispatch(updateDappConnectList(list))
    },
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
    updateHomeIndex: (index) => {
      dispatch(updateHomeIndex(index));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Wallet);
