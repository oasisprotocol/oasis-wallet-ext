import React from "react";
import { connect } from "react-redux";
import dapp_default_icon from "../../../assets/images/dapp_default_icon.svg";
import { getBalance } from "../../../background/api";
import { DAPP_ACTION_CLOSE_WINDOW, DAPP_ACTION_GET_ACCOUNT, DAPP_GET_APPROVE_ACCOUNT, WALLET_GET_ALL_ACCOUNT } from "../../../constant/types";
import { ERROR_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateAccountList, updateNetAccount } from "../../../reducers/accountReducer";
import { updateDAppOpenWindow, updateDappSelectList } from "../../../reducers/cache";
import { ENTRY_WITCH_ROUTE, updateEntryWitchRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import { getQueryStringArgs } from "../../../utils/utils";
import Button from "../../component/Button";
import Toast from "../../component/Toast";
import LockPage from '../Lock';
import ApproveAccountItem from "./ApproveAccountItem";
import "./index.scss";

class ApprovePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lockStatus: false,
    };
    this.firstRequest = true
    this.isUnMounted = false;
    this.webIconRef = React.createRef();
  }
  componentWillUnmount() {
    this.isUnMounted = true;
  }
  componentDidMount() {
    let params = this.getParams()
    if (params.isUnlocked == '1' ) {
      this.getAccountData()
    }
  }

  getAccountData=()=>{
  sendMsg({
    action: WALLET_GET_ALL_ACCOUNT,
    payload:true
  }, (account) => {
    let list = account.accounts.map((item)=>{
      if(item.address === account.currentAddress){
        item.isConnected = true
      }
      return item
    })
    this.props.updateDappSelectList(list)
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
  fetchData = (address) => {
    getBalance(address).then((account) => {
      if (account.error && account.error !== ERROR_TYPE.CanceRequest) {
        Toast.info(getLanguage('nodeError'))
      } else if (account && account.address) {
        this.firstRequest = false
        this.props.updateNetAccount(account)
      }
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentAccount.address && this.firstRequest) {
      this.fetchData(nextProps.currentAccount.address)
    }
  }
  renderTip = () => {
    return <p className="wallet-tip-description">{this.state.content}</p>;
  };
  getSelectDAppAccount = () => {
    const { dappAccountList } = this.props
    let selectList = []
    for (let index = 0; index < dappAccountList.length; index++) {
      const dappAccount = dappAccountList[index];
      if (dappAccount.isConnected) {
        selectList.push(dappAccount)
      }
    }
    return selectList
  }

  renderActionBtn = () => {
    let { currentAccount } = this.props;
    return (
      <div className={"approve-button-container"}>
        <Button
          content={getLanguage('cancel')}
          propsClass={"account-common-btn account-common-btn-cancel"}
          onClick={() => {
            sendMsg({
              action: DAPP_ACTION_GET_ACCOUNT,
              payload:{
                selectAccount:[],
                currentAddress:currentAccount.address,
                resultOrigin: this.getParams().siteUrl,
              },
            }, async (params) => {
              this.goToHome()
             })
          }}
        />
        <Button
          content={getLanguage('onConfirm')}
          propsClass={"account-common-btn"}
          onClick={async () => {
            let selectAccount = this.getSelectDAppAccount()
            if (selectAccount.length > 0) {
              sendMsg({
                action: DAPP_ACTION_GET_ACCOUNT,
                payload: {
                  selectAccount,
                  currentAddress:currentAccount.address,
                  resultOrigin: this.getParams().siteUrl,
                 },
              }, (params) => {
                this.goToHome()
               })
            } else {
              Toast.info(getLanguage('selectFirst'))
            }
          }}
        />
      </div>
    );
  };
  goToHome=()=>{
      let url = this.props.dappWindow?.url
      if(url){
        this.props.updateEntryWitchRoute(ENTRY_WITCH_ROUTE.HOME_PAGE)
      }
      this.props.updateDAppOpenWindow({})
  }
  onClickUnLock = async () => {
    let params = this.getParams()
    let siteUrl = params.siteUrl || ""
    sendMsg({
      action: DAPP_GET_APPROVE_ACCOUNT,
      payload: { siteUrl: siteUrl }
    }, async (approveAccount) => {
      if (approveAccount && approveAccount.length>0) {
        sendMsg({
          action: DAPP_ACTION_CLOSE_WINDOW,
          payload: {
            page: "approve_page",
            account: approveAccount,
            resultOrigin: this.getParams().siteUrl,
          },
        }, (params) => { })
      } else {
        this.getAccountData()
        this.callSetState({
          lockStatus: true
        })
      }
    })
  }
  onClickRow = (account) => {
    const { dappAccountList } = this.props
    let newList = []
    for (let index = 0; index < dappAccountList.length; index++) {
      let dappAccount = { ...dappAccountList[index] };
      if (account.address === dappAccount.address) {
        dappAccount.isConnected = !account.isConnected
      }
      newList.push(dappAccount)
    }
    this.props.updateDappSelectList(newList)
  }
  renderAccountView = () => {
    let currentSymbol = this.props.netConfig.currentSymbol;
    const { ledgerBalanceList, dappAccountList } = this.props
    let listLength = dappAccountList.length
    return (
      <div className={"approve-page-item-container"}>
        {dappAccountList.map((item, index) => {
          return (
            <ApproveAccountItem
              key={index + ""}
              account={item}
              index={index}
              symbol={currentSymbol}
              cacheAccount={ledgerBalanceList[item.address]}
              onClickAccount={this.onClickRow}
              listLength={listLength}
            />
          )
        })}
      </div>)
  }
  getParams=()=>{
    let url = this.props.dappWindow?.url || window.location?.href || ""
    return getQueryStringArgs(url)
  }
  render() {
    let params = this.getParams()
    if (params.isUnlocked == '0' && !this.state.lockStatus) {
      return <LockPage onDappConfirm={true} onClickUnLock={this.onClickUnLock} history={this.props.history} />;
    }
    let webIcon = params.siteIcon
    return (
      <div className="approve-page-container">
        <div className={'approve-page-icon-con'}>
          <img
            ref={this.webIconRef}
            className="approve-page-icon" src={webIcon}
            onError={() => {
              if (this.webIconRef.current) {
                this.webIconRef.current.src = dapp_default_icon
              }
            }}
          />
          <p className={'approve-page-url'}>{params.siteUrl}</p>
          <p className={'approve-page-title'}>{getLanguage('walletConnect')}</p>
        </div>
        {this.renderAccountView()}

        {this.renderActionBtn()}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
  liquid_balance: state.accountInfo.liquid_balance,
  netConfig: state.network,
  accountBalanceList: state.cache.accountBalanceList,
  ledgerBalanceList: state.cache.ledgerBalanceList,
  dappAccountList: state.cache.dappAccountList,
  dappWindow: state.cache.dappWindow,
});

function mapDispatchToProps(dispatch) {
  return {
    updateNetAccount: (netAccount) => {
      dispatch(updateNetAccount(netAccount))
    },
    updateAccountList: (list) => {
      dispatch(updateAccountList(list))
    },
    updateDappSelectList: (list) => {
      dispatch(updateDappSelectList(list))
    },
    updateDAppOpenWindow: (window) => {
      dispatch(updateDAppOpenWindow(window))
    },
    updateEntryWitchRoute: (route) => {
      dispatch(updateEntryWitchRoute(route))
    },

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ApprovePage);
