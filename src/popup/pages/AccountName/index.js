import React from "react";
import { connect } from "react-redux";
import { WALLET_CREATE_HD_ACCOUNT } from "../../../constant/types";
import { ACCOUNT_NAME_FROM_TYPE, ACCOUNT_TYPE_FROM } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { updateAccountType } from "../../../reducers/cache";
import { sendMsg } from "../../../utils/commonMsg";
import { checkLedgerConnect } from "../../../utils/ledger";
import { nameLengthCheck } from "../../../utils/utils";
import Button from "../../component/Button";
import CustomInput from "../../component/CustomInput";
import CustomView from "../../component/CustomView";
import "./index.scss";

class AccountName extends React.Component {
  constructor(props) {
    super(props);

    let placeholderText = ""
    let fromType = props.cache.fromType
    let accountCount = this.getAccountLength(fromType)
    if (fromType === ACCOUNT_NAME_FROM_TYPE.OUTSIDE) {
      placeholderText = "Import Account "
    } else if (fromType === ACCOUNT_NAME_FROM_TYPE.LEDGER) {
      placeholderText = "Ledger Account "
    } else if (fromType === ACCOUNT_NAME_FROM_TYPE.OBSERVE) {
      placeholderText = "Watch Account "
    } else {
      placeholderText = "Account "
    }
    this.state = {
      accountName: "",
      btnClick: true,
      accountCount,
      errorTipShow: false,
      placeholderText: placeholderText + parseInt(accountCount)
    };
    this.isClicked = false
    this.isUnMounted = false;
  }
  getAccountTypeIndex = (list) => {
    if (list.length === 0) {
      return 1
    } else {
      return parseInt(list[list.length - 1].typeIndex) + 1
    }
  }
  getAccountLength = (type) => {
    const { accountList } = this.props
    let accountTypeList = accountList.filter((item, index) => {
      return item.type === ACCOUNT_TYPE_FROM[type]
    })
    return this.getAccountTypeIndex(accountTypeList)
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
  onAccountInput = (e) => {
    let name = e.target.value
    this.callSetState({
      accountName: name
    }, () => {
      let checkResult = nameLengthCheck(this.state.accountName)
      if (checkResult) {
        this.callSetState({
          btnClick: true,
          errorTipShow: false
        })
      } else {
        this.callSetState({
          btnClick: false,
          errorTipShow: true
        })
      }
    })
  }
  goToNext = async () => {
    if (this.isClicked) {
      return
    }
    setTimeout(() => {
      this.isClicked = false
    }, 500)
    this.isClicked = true
    let accountText = ""
    if (this.state.accountName.length <= 0) {
      accountText = this.state.placeholderText
    } else {
      accountText = this.state.accountName
    }
    let fromType = this.props.cache.fromType
    if (fromType === ACCOUNT_NAME_FROM_TYPE.OUTSIDE) {
      this.props.history.push({
        pathname: "/import_account",
        params: {
          "accountName": accountText
        },
      })
    } else if (fromType === ACCOUNT_NAME_FROM_TYPE.LEDGER) {
      await checkLedgerConnect()
      this.props.history.replace({
        pathname: "/ledger_import",
        params: {
          "accountName": accountText
        },
      })
    } else if (fromType === ACCOUNT_NAME_FROM_TYPE.OBSERVE) {
      this.props.history.push({
        pathname: "/import_observe",
        params: {
          "accountName": accountText
        },
      })
    } else {
      sendMsg({
        action: WALLET_CREATE_HD_ACCOUNT,
        payload: { accountName: accountText }
      }, (account) => {
        this.props.updateCurrentAccount(account)
        this.props.history.replace({
          pathname: "/account_manage",
        })
      })
    }
    this.isClicked = false
  }
  renderBottonBtn = () => {
    let { fromType } = this.props.cache
    let buttonText = fromType === ACCOUNT_NAME_FROM_TYPE.INSIDE ? 'confirm_1' : 'next'
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage(buttonText)}
          onClick={this.goToNext}
          disabled={!this.state.btnClick}
        />
      </div>)
  }
  onSubmit = (event) => {
    event.preventDefault();
  }
  render() {
    return (
      <CustomView
        title={getLanguage("accountName")}
        history={this.props.history}>
        <form onSubmit={this.onSubmit}>
          <div className={"account-name-container"}>
            <CustomInput
              value={this.state.accountName}
              label={getLanguage('accountNameTip')}
              placeholder={this.state.placeholderText}
              errorTipShow={this.state.errorTipShow}
              showTip={getLanguage("accountNameLimit")}
              onTextInput={this.onAccountInput} />
            {this.renderBottonBtn()}
          </div>
        </form>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  cache: state.cache,
  accountList: state.accountInfo.accountList
});

function mapDispatchToProps(dispatch) {
  return {
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
    updateAccountType: (type) => {
      dispatch(updateAccountType(type));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountName);
