import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import create_wallet from "../../../assets/images/create_wallet.png";
import import_wallet from "../../../assets/images/import_wallet.png";
import ledger_wallet from "../../../assets/images/ledger_wallet.png";
import { DAPP_CHANGE_CONNECTING_ADDRESS, WALLET_CHANGE_CURRENT_ACCOUNT, WALLET_GET_ALL_ACCOUNT, WALLET_SET_UNLOCKED_STATUS } from "../../../constant/types";
import { ACCOUNT_NAME_FROM_TYPE, ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateAccountList, updateCurrentAccount } from "../../../reducers/accountReducer";
import { setAccountInfo, updateAccountType } from "../../../reducers/cache";
import { updateEntryWitchRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import AccountItem from "./AccountItem";
import "./index.scss";

class AccountManagePage extends React.Component {
  constructor(props) {
    super(props);
    let address = props.currentAccount.address
    this.state = {
      accountList: [{}, {}],
      currentAddress: address,
      balanceList: []
    };
    this.isUnMounted = false;
  }

  componentDidMount() {
    sendMsg({
      action: WALLET_GET_ALL_ACCOUNT,
    }, (account) => {
      this.props.updateAccountList(account.accounts)
      this.callSetState({
        accountList: account.accounts,
        currentAddress: account.currentAddress
      })
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

  getAccountTypeIndex = (list) => {
    if (list.length === 0) {
      return 1
    } else {
      return parseInt(list[list.length - 1].typeIndex) + 1
    }
  }
  goToCreate = () => {
    this.props.updateAccountType(ACCOUNT_NAME_FROM_TYPE.INSIDE)
    this.props.history.push({
      pathname: "/account_name",
    });
  }
  goImport = () => {
    this.props.history.push({
      pathname: "/import_page",
    });
  }
  goAddLedger = () => {
    const isLedgerCapable = (!window || window && !window.USB)
    if (isLedgerCapable) {
      Toast.info(getLanguage("ledgerNotSupport"))
      return
    }
    this.props.updateAccountType(ACCOUNT_NAME_FROM_TYPE.LEDGER)
    this.props.history.push({
      pathname: "/account_name",
    });
  }
  onClickAccount = (item) => {
    if (item.address !== this.state.currentAddress) {
      sendMsg({
        action: WALLET_CHANGE_CURRENT_ACCOUNT,
        payload: item.address
      }, (account) => {
        if (account.accountList && account.accountList.length > 0) {
          this.props.updateCurrentAccount(account.currentAccount)
          this.callSetState({
            accountList: account.accountList,
            currentAddress: item.address
          })
          sendMsg({
            action: DAPP_CHANGE_CONNECTING_ADDRESS,
            payload: {
              address: account.currentAccount.address
            }
          }, (status) => {})
        }
      })
    }
  }

  goToAccountInfo = (item) => {
    this.props.setAccountInfo(item)
    this.props.history.push({
      pathname: "/account_info",
    })

  }
  getAccountType = (item) => {
    let typeText = ""
    switch (item.type) {
      case ACCOUNT_TYPE.WALLET_OUTSIDE:
        typeText = getLanguage('accountImport')
        break;
      case ACCOUNT_TYPE.WALLET_LEDGER:
        typeText = "Ledger"
        break;
      case ACCOUNT_TYPE.WALLET_OBSERVE:
        typeText = "Watch"
        break;
      default:
        break;
    }
    return typeText
  }
  renderAccountItem = (item, index) => {
    const { accountBalanceList } = this.props
    let showSelect = this.state.currentAddress === item.address
    let showImport = this.getAccountType(item)
    return (<AccountItem
      key={index + ""}
      item={item}
      showSelect={showSelect}
      showImport={showImport}
      onClickAccount={this.onClickAccount}
      goToAccountInfo={this.goToAccountInfo}
      symbol={this.props.netConfig.currentSymbol}
      cacheAccount={accountBalanceList[item.address]}
    />)
  }
  renderAccountList = () => {
    return (
      <div className={"account-list-container"}>
        {this.state.accountList.map((item, index) => {
          return this.renderAccountItem(item, index)
        })}
      </div>
    )
  }
  renderImgBtn = (title, imgSource, callback, propsClass) => {
    return (
      <div onClick={() => callback && callback()}
        className={cx("account-btn-item click-cursor", {
          [propsClass]: !!propsClass
        })}>
        <img className={"account-btn-img"} src={imgSource} />
        <p className={"account-btn-title"}>{title}</p>
      </div>)
  }

  renderButtomButton = () => {
    return (
      <div className={"account-btn-container"}>
        {this.renderImgBtn(getLanguage('createAccount'), create_wallet, this.goToCreate, "account-btn-item-create")}
        {this.renderImgBtn(getLanguage('importAccount'), import_wallet, this.goImport, "account-btn-item-import")}
        {this.renderImgBtn("Ledger", ledger_wallet, this.goAddLedger, "account-btn-item-ledger")}
      </div>
    )
  }
  onClickLock = () => {
    sendMsg({
      action: WALLET_SET_UNLOCKED_STATUS,
      payload: false
    }, (res) => { })
  }
  renderLockBtn = () => {
    return (
      <div onClick={this.onClickLock} className={"account-lock-container click-cursor"}>
        <p className={"account-lock"}>{getLanguage("lockTitle")}</p>
      </div>)
  }
  render() {
    return (<CustomView
      title={getLanguage('accountManage')}
      backRoute={"/homepage"}
      history={this.props.history}
      rightComponent={this.renderLockBtn()}>
      <div className={"account-manage-container"}>
        {this.renderAccountList()}
      </div>
      {this.renderButtomButton()}
    </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
  netConfig: state.network,
  accountBalanceList: state.cache.accountBalanceList,
});

function mapDispatchToProps(dispatch) {
  return {
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
    setAccountInfo: (account) => {
      dispatch(setAccountInfo(account))
    },
    updateEntryWitchRoute: (index) => {
      dispatch(updateEntryWitchRoute(index));
    },
    updateAccountType: (type) => {
      dispatch(updateAccountType(type));
    },
    updateAccountList: (list) => {
      dispatch(updateAccountList(list))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountManagePage);
