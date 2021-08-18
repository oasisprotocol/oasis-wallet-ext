import * as oasis from '@oasisprotocol/client';
import BigNumber from "bignumber.js";
import React from "react";
import { connect } from "react-redux";
import dapp_default_icon from "../../../assets/images/dapp_default_icon.svg";
import { getLedgerSigner } from "../../../background/api/txHelper";
import { DAPP_ACTION_SEND_TRANSACTION, DAPP_GET_APPROVE_ACCOUNT, GET_SIGN_PARAMS } from "../../../constant/types";
import { ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateNetAccount, updateRpcNonce } from "../../../reducers/accountReducer";
import { updateDAppOpenWindow } from "../../../reducers/cache";
import { ENTRY_WITCH_ROUTE, updateEntryWitchRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import { checkLedgerConnect } from "../../../utils/ledger";
import { addressSlice, amountDecimals, getQueryStringArgs, hex2uint, isNumber, trimSpace, uint2hex } from "../../../utils/utils";
import { addressValid } from "../../../utils/validator";
import AccountIcon from "../../component/AccountIcon";
import Button from "../../component/Button";
import Loading from "../../component/Loading";
import Toast from "../../component/Toast";
import LockPage from '../Lock';
import "./index.scss";

const STAKE_MIN_AMOUNT = 100
class SignTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      site: {},
      params: {},
      currentAccount: {},
      lockStatus: false,
      sendAction: ""
    }
    this.isUnMounted = false;
    this.webIconRef = React.createRef();
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

  componentDidMount() {
    sendMsg({
      action: GET_SIGN_PARAMS
    }, (res) => {
      this.callSetState({
        sendAction: res.params.method
      })
      sendMsg({
        action: DAPP_GET_APPROVE_ACCOUNT,
        payload: {
          siteUrl: res.site,
          address: res.params.from
        }
      }, (account) => {
        this.callSetState({
          site: res.site,
          params: res.params,
          currentAccount: account
        })
      })
    })
  }


  onConfirm = async () => {
    let { params, currentAccount } = this.state
    if (currentAccount.type === ACCOUNT_TYPE.WALLET_OBSERVE) {
      Toast.info(getLanguage('observeAccountTip'))
      return
    }
    let toAddress = trimSpace(params.to)
    if (!addressValid(toAddress)) {
      Toast.info(getLanguage('sendAddressError'))
      return
    }
    let amount = trimSpace(params.amount)
    if (!isNumber(amount) || !new BigNumber(amount).gt(0)) {
      Toast.info(getLanguage('amountError'))
      return
    }

    if (this.state.sendAction === oasis.staking.METHOD_ADD_ESCROW) {
      if (!isNumber(amount) || (parseInt(amount) < parseInt(STAKE_MIN_AMOUNT))) {
        Toast.info(getLanguage('minStakeAmout') + " " + STAKE_MIN_AMOUNT)
        return
      }
    }
    this.clickNextStep()

  }

  clickNextStep = async () => {
    let { currentAccount } = this.state
    Loading.show()
    if (currentAccount.type === ACCOUNT_TYPE.WALLET_LEDGER) {
      try {
        let app = await checkLedgerConnect()
        let signer = await getLedgerSigner(currentAccount.ledgerHdIndex)
        let winParams = this.getParams()

        let context = winParams.context
        let message = winParams.message
        message = hex2uint(message)
        let address = winParams.address
        const signature = await signer.sign(context, message);
        let signatureHex = uint2hex(signature)
        Loading.hide()

        sendMsg({
          action: DAPP_ACTION_SEND_TRANSACTION,
          payload: {
            isConfirmed: true,
            ledgerSignatureHex: signatureHex,
            ledgerWallet: true
          },
        }, async (params) => {
          this.goToHome()
        })
      } catch (error) {
        Loading.hide()
        sendMsg({
          action: DAPP_ACTION_SEND_TRANSACTION,
          payload: {
            isConfirmed: true,
            ledgerWallet: true,
            ledgerError: error
          },
        }, async (params) => {
          this.goToHome()
        })
      }
    } else {
      sendMsg({
        action: DAPP_ACTION_SEND_TRANSACTION,
        payload: { isConfirmed: true },
      }, async (params) => {
        this.goToHome()
      })
    }
  }
  goToHome = () => {
    let url = this.props.dappWindow?.url
    if (url) {
      this.props.updateEntryWitchRoute(ENTRY_WITCH_ROUTE.HOME_PAGE)
    }
    this.props.updateDAppOpenWindow({})
  }
  renderActionBtn = () => {
    return (
      <div className={"sign-button-container"}>
        <Button
          content={getLanguage('cancel')}
          propsClass={"account-common-btn account-common-btn-cancel"}
          onClick={() => {
            sendMsg({
              action: DAPP_ACTION_SEND_TRANSACTION,
              payload: { isConfirmed: false },
            }, async (params) => {
              this.goToHome()
            })
          }}
        />
        <Button
          content={getLanguage('onConfirm')}
          propsClass={"account-common-btn"}
          onClick={async () => {
            this.onConfirm()
          }}
        />
      </div>
    );
  };

  onClickUnLock = () => {
    this.callSetState({
      lockStatus: true
    })
  }
  renderMyIcon = () => {
    let { currentAccount } = this.state;
    let address = currentAccount.address;
    if (!address) {
      return (<div />)
    }
    return <AccountIcon address={address} diameter={"20"} className={"sign-page-icon-top"} />;
  };
  renderAccountInfo = () => {
    let showAddress = addressSlice(this.state.currentAccount.address, 6)
    let netName = this.props.netConfig.currentNetType
    return (
      <div className={'sign-page-top-con'}>
        <div className={"sign-page-top-left"}>
          {this.renderMyIcon()}
          <p className={"sign-page-top-address"}>{showAddress}</p>
        </div>
        <p className={"sign-page-top-netName"}>{netName}</p>
      </div>
    )
  }
  renderWebInfo = (winParams) => {
    let webIcon = winParams.siteIcon
    return (
      <div className={'sign-page-icon-con'}>
        <img
          ref={this.webIconRef}
          className="sign-page-icon" src={webIcon}
          onError={() => {
            if (this.webIconRef.current) {
              this.webIconRef.current.src = dapp_default_icon
            }
          }}
        />
        <p className={'sign-page-url'}>{winParams.siteUrl}</p>
      </div>
    )
  }
  renderSendItem = (item, index) => {
    return (
      <div className="sign-detail-item" key={index + ""}>
        <p className="sign-detail-title">{item.title}</p>
        <p className="sign-detail-content">{item.content}</p>
      </div>
    )
  }
  chainLabel = (chainContext) => {
    switch (chainContext) {
      case '53852332637bacb61b91b6411ab4095168ba02a50be4c3f82448438826f23898':
        return 'Oasis Protocol Foundation Mainnet - Cobalt'
      case '5ba68bc5e01e06f755c4c044dd11ec508e4c17f1faf40c0e67874388437a9e55':
        return 'Oasis Protocol Foundation Testnet - 2021-04-13'
      default:
        return getLanguage('unknownChain')
    }
  }
  renderSendContent = () => {
    let { params } = this.state
    let txNonce = params.nonce
    let currentSymbol = this.props.netConfig.currentSymbol;
    let toTitle = this.state.sendAction === oasis.staking.METHOD_ADD_ESCROW ? getLanguage('stakeNodeName') : getLanguage('toAddress')
    let itemList = [
      {
        title: getLanguage('chainLabel'),
        content: this.chainLabel(params.chainContext),
      },
      {
        title: getLanguage('chainContext'),
        content: params.chainContext,
      },
      {
        title: getLanguage('txType'),
        content: params.method
      },
      {
        title: toTitle,
        content: params.to
      },
      {
        title: "Nonce",
        content: txNonce
      },
    ]
    if (isNumber(params.amount)) {
      let amountShow = amountDecimals(params.amount)
      itemList.push({
        title: getLanguage('amount'),
        content: amountShow + " " + currentSymbol
      })
    } else {
      itemList.push({
        title: "Shares",
        content: params.shares
      })
    }
    if (params.amendment) {
      itemList.push({
        title: getLanguage('amendment'),
        content: params.amendment
      })
    }
    if (params.beneficiary) {
      itemList.push({
        title: getLanguage("beneficiary"),
        content: params.beneficiary
      })
    }
    if (params.amountChange) {
      let amountChange = amountDecimals(params.amountChange)
      itemList.push({
        title: getLanguage("amountChange"),
        content: amountChange
      })
    }
    return (
      <div>
        {itemList.map((item, index) => {
          return this.renderSendItem(item, index)
        })}
      </div>)
  }
  getParams = () => {
    let url = this.props.dappWindow?.url || window.location?.href || ""
    return getQueryStringArgs(url)
  }
  render() {
    let winParams = this.getParams()
    if (winParams.isUnlocked == '0' && !this.state.lockStatus) {
      return <LockPage onDappConfirm={true} onClickUnLock={this.onClickUnLock} history={this.props.history} />;
    }
    if (this.state.loading) {
      return null
    }
    return (
      <div className={'sign-page-container'}>
        {this.renderAccountInfo()}
        {this.renderWebInfo(winParams)}
        {this.renderSendContent(winParams)}
        {this.renderActionBtn()}
      </div>)

  }
}

const mapStateToProps = (state) => ({
  accountInfo: state.accountInfo,
  netConfig: state.network,
  dappWindow: state.cache.dappWindow,
});

function mapDispatchToProps(dispatch) {
  return {
    updateRpcNonce: (nonce) => {
      dispatch(updateRpcNonce(nonce))
    },
    updateNetAccount: (netAccount) => {
      dispatch(updateNetAccount(netAccount))
    },
    updateDAppOpenWindow: (window) => {
      dispatch(updateDAppOpenWindow(window))
    },
    updateEntryWitchRoute: (route) => {
      dispatch(updateEntryWitchRoute(route))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignTransaction);
