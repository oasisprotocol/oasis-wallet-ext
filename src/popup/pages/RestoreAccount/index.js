import React from "react";
import { connect } from "react-redux";
import { WALLET_NEW_HD_ACCOUNT } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { ENTRY_WHICH_ROUTE, updateEntryWhichRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import { trimSpace } from "../../../utils/utils";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
import * as bip39 from 'bip39';
class RestoreAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      btnClick: false,
      mnemonic: ""
    };
    this.isUnMounted = false;
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
  goToCreate = () => {
    let mnemonic = this.state.mnemonic
    mnemonic = trimSpace(mnemonic)
    mnemonic = mnemonic.toLowerCase()
    let mneList = mnemonic.split(" ")
    mneList = mneList.filter((item,index)=>{
      return !!item
    })
    mnemonic = mneList.join(" ")
    if (mneList.length !== 12 && mneList.length !== 24) {
      Toast.info(getLanguage('seedLengthError'))
      return
    }
    let mnemonicValid = bip39.validateMnemonic(mnemonic)
    if (!mnemonicValid) {
      Toast.info(getLanguage('inputValidSeed'))
      return
    }
    sendMsg({
      action: WALLET_NEW_HD_ACCOUNT,
      payload: {
        mne: mnemonic
      }
    },
      async (currentAccount) => {
        this.props.updateCurrentAccount(currentAccount)
        this.props.updateEntryWhichRoute(ENTRY_WHICH_ROUTE.HOME_PAGE)
        this.props.history.push({
          pathname: "/backup_success",
          params: { type: "restore" }
        })
      })
  };

  onMneInput = (e) => {
    let mnemonic = e.target.value;
    let _mnemonic = mnemonic.replace(/\s/g, ' ');
    _mnemonic = _mnemonic.replace(/[\r\n]/g, "")
    this.callSetState({
      mnemonic: _mnemonic
    }, () => {
      if (mnemonic.length > 0) {
        this.callSetState({
          btnClick: true
        })
      } else {
        this.callSetState({
          btnClick: false
        })
      }
    })
  }
  renderInput = () => {
    return (
      <textarea
        className={"text-area-input"}
        value={this.state.privateKey}
        onChange={this.onMneInput}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    )
  }
  renderBottom = () => {
    return (
      <div className="bottom-container">
        <Button
          disabled={!this.state.btnClick}
          content={getLanguage('confirm')}
          onClick={this.goToCreate}
        />
      </div>
    )
  }
  onSubmit = (event) => {
    event.preventDefault();
  }
  render() {
    return (
      <CustomView
        propsClassName={"create-route-container"}
        history={this.props.history}
      >
        <form onSubmit={this.onSubmit} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}>
          <div className="import-container">
            <p className={'desc-title'}>{getLanguage('restoreWallet')}</p>
            <p className={"import-title"}>{getLanguage("inputSeed")}</p>
            {this.renderInput()}
          </div>
          {this.renderBottom()}
        </form>
      </CustomView>
    )
  }

}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {
    updateEntryWhichRoute: (index) => {
      dispatch(updateEntryWhichRoute(index));
    },
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RestoreAccount);
