import BigNumber from "bignumber.js";
import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import ledgerWallet from "../../../assets/images/ledger_logo.png";
import ledger_title from "../../../assets/images/ledger_title.png";
import loadingCommon from "../../../assets/images/loadingCommon.gif";
import { WALLET_IMPORT_LEDGER } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { sendMsg } from "../../../utils/commonMsg";
import { checkLedgerConnect, requestAccount } from "../../../utils/ledger";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
import LedgerAddressItem from "./LedgerAddressItem";

class LedgerAddresses extends React.Component {
  constructor(props) {
    super(props);
    let params = props.location?.params || {};
    this.state = {
      pageIndex: 0,
      currentList: [],
      selectList: [],
      showLoading: true
    };
    this.accountName = params.accountName

    this.isUnMounted = false;
    this.addressList = []
  }

  async componentDidMount() {
    const { accountList } = this.props

    this.addressList = accountList.map((item) => {
      return item.address
    })
    await this.getLedgerAddress(this.state.pageIndex)
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
  addressFilter = (list) => {
    let newList = []
    let selectList = this.state.selectList.map((item) => {
      return item.address
    })
    for (let index = 0; index < list.length; index++) {
      let ledgerAccount = list[index];
      if (selectList.indexOf(ledgerAccount.address) !== -1) {
        ledgerAccount.isSelect = true
      } else {
        ledgerAccount.isSelect = false
      }
      if (this.addressList.indexOf(ledgerAccount.address) !== -1) {
        ledgerAccount.isSelect = true
        ledgerAccount.isExist = true
      } else {
        ledgerAccount.isExist = false
      }
      newList.push(ledgerAccount)
    }
    return newList
  }
  getLedgerAddress = async (pageIndex = 0, count = 5) => {
    this.callSetState({
      showLoading: true
    }, async () => {
      const { ledgerApp } = await checkLedgerConnect()
      if (ledgerApp) {
        let fromIndex = new BigNumber(pageIndex).multipliedBy(count).toNumber()
        let result = await requestAccount(ledgerApp, fromIndex, count).catch(err => err)
        if (result.length >= 0) {
          let addressList = this.addressFilter(result)
          this.callSetState({
            currentList: addressList,
            showLoading: false
          })
        }
      } else {
        this.callSetState({
          showLoading: false
        })
      }
    })
  }
  renderTopLogo = () => {
    return (
      <div className={"ledger-status-logo-con"}>
        <div className={"ledger-steps-logo-container"}>
          <img src={ledgerWallet} className={"ledger-wallet-logo-connect"} />
          <img src={ledger_title} className={"ledger-wallet-title"} />
        </div>
      </div>
    )
  }
  onClickRow = (item) => {
    let currentList = [...this.state.currentList]
    let selectList = [...this.state.selectList]
    let newSelectList = []
    for (let index = 0; index < this.state.currentList.length; index++) {
      let account = this.state.currentList[index];
      if (item.address === account.address) {
        currentList[index].isSelect = !account.isSelect
        if (currentList[index].isSelect) {
          newSelectList = selectList
          newSelectList.push(currentList[index])
        } else {
          newSelectList = selectList.filter((selectItem) => {
            return selectItem.address !== account.address
          })
        }
      }
    }
    this.callSetState({
      currentList,
      selectList: newSelectList
    })
  }
  renderAddressRow = (item, index) => {
    const { ledgerBalanceList } = this.props
    return (<LedgerAddressItem
      key={index + ""}
      item={item}
      symbol={this.props.netConfig.currentSymbol}
      cacheAccount={ledgerBalanceList[item.address]}
      onClickAccount={() => this.onClickRow(item)} />)
  }
  onClickFirst = () => {
    if (this.state.pageIndex === 0) {
      return
    } else {
      let newIndex = this.state.pageIndex - 1
      if (newIndex >= 0) {
        this.callSetState({
          pageIndex: newIndex
        }, async () => {
          await this.getLedgerAddress(this.state.pageIndex)
        })
      }
    }
  }
  onClickLast = () => {
    let newIndex = this.state.pageIndex + 1
    this.callSetState({
      pageIndex: newIndex
    }, async () => {
      await this.getLedgerAddress(this.state.pageIndex)
    })
  }
  renderContentBtn = () => {
    return (
      <div className={"address-page-button-container"}>
        <p onClick={this.onClickFirst}
          className={cx("address-page-button click-cursor", {
            "address-page-button-unable": this.state.pageIndex === 0,
            "click-cursor-disable": this.state.pageIndex === 0
          })}>
          {"< "+getLanguage("firstPage")}
        </p>
        <p onClick={this.onClickLast} className={"address-page-button click-cursor"}>
          {getLanguage("lastPage")+" >"}
        </p>
      </div>)
  }
  renderContent = () => {
    return (<div className={"content-inner-outer"}>
      {this.state.showLoading && <div className={"address-loading-container"}>
        <img className={"address-loading-img"} src={loadingCommon} />
      </div>}
      <div className={"content-inner"}>
        {this.state.currentList.map((item, index) => {
          return this.renderAddressRow(item, index)
        })}
        <div />
        {this.renderContentBtn()}
      </div>
    </div>)
  }
  renderContentContainer = () => {
    return (<div className={"content-container"}>
      <p className={"content-title"}>
        {getLanguage("selectAccount")}
      </p>
      {this.renderContent()}
    </div>)
  }

  onConfirm = () => {
    sendMsg({
      payload: {
        addressList: this.state.selectList,
        accountName: this.accountName
      },
      action: WALLET_IMPORT_LEDGER
    }, (account) => {
      if (account.error) {
        if (account.type === "local") {
          Toast.info(getLanguage(account.error))
        } else {
          Toast.info(account.error)
        }
      } else {
        this.props.updateCurrentAccount(account)
        this.props.history.go(-2)
      }
    })

  }
  onCancel = () => {
    this.props.history.go(-2)
  }
  renderBottomConfirm = () => {
    return (<div className={'bottom-button-container'}>
      <Button
        content={getLanguage('cancel')}
        propsClass={"ledger-address-common-btn account-common-btn-cancel"}
        onClick={this.onCancel}
      />
      <Button
        content={getLanguage('onConfirm')}
        propsClass={"ledger-address-common-btn"}
        onClick={this.onConfirm}
      />
    </div>)
  }
  render() {
    return (
      <CustomView
        title={getLanguage('walletName')}
        propsClassName={'record-background'}
        history={this.props.history}>
        <div className={"ledger-address-container"}>
          {this.renderTopLogo()}
          {this.renderContentContainer()}
          {this.renderBottomConfirm()}
        </div>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  accountList: state.accountInfo.accountList,
  ledgerBalanceList: state.cache.ledgerBalanceList,
  netConfig: state.network,
});

function mapDispatchToProps(dispatch) {
  return {
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LedgerAddresses);
