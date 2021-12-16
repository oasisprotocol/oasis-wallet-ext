import React from "react";
import { connect } from "react-redux";
import { WALLET_IMPORT_HD_ACCOUNT } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { updateEntryWhichRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
class ImportAccount extends React.Component {
  constructor(props) {
    super(props);
    let accountName = props.location.params?.accountName || ""
    this.state = {
      btnClick: false,
      privateKey: "",
      accountName
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
  onPrivKeyInput = (e) => {
    let privateKey = e.target.value;
    if (privateKey.length >= 0) {
      this.callSetState({
        privateKey: privateKey.replace(/\s/g, ' '),
        btnClick: true
      })
    } else {
      this.callSetState({
        privateKey: privateKey,
        btnClick: false
      })
    }

  };
  goToCreate = () => {
    const accountType = this.props.accountType
    sendMsg({
      action: WALLET_IMPORT_HD_ACCOUNT,
      payload: {
        privateKey: this.state.privateKey.replace(/[\r\n]/g, ""),
        accountName: this.state.accountName,
        accountType:accountType
      }
    }, (account) => {
      if (account.error) {
        if (account.type === "local") {
          Toast.info(getLanguage(account.error))
        } else {
          Toast.info(account.error)
        }
        return
      } else {
        this.props.updateCurrentAccount(account)
        setTimeout(() => {
          this.props.history.replace({
            pathname: "/account_manage",
          })
        }, 300);
      }
    })
  };

  handleTextareaChange = (e) => {
    let value = e.target.value
    this.callSetState({
      privateKey: value
    }, () => {
      if (this.state.privateKey.length > 0) {
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
      <div className={"import-input-container"}>
        <textarea
          className={"text-area-input"}
          placeholder={getLanguage('inputPrivateKey')}
          value={this.state.privateKey}
          onChange={this.handleTextareaChange} />
      </div>
    )
  }
  renderDescContainer = (content1, content2) => {
    return (<div className={"import-input-container-desc"}>
      <p className={"import-title-account"}>{content1}</p>
      <p className={"import-title-account"}>{content2}</p>
    </div>)
  }
  renderBottom = () => {
    return (
      <div className="bottom-container">
        <Button
          disabled={!this.state.btnClick}
          content={getLanguage('confirm_1')}
          onClick={this.goToCreate}
        />
      </div>
    )
  }
  renderContentContainer = (content) => {
    return (<div className={"import-input-container"}>
      <p className={"import-title"}>{content}</p>
    </div>)
  }
  render() {
    return (
      <CustomView
        title={getLanguage('importAccount_1')}
        history={this.props.history}>
        <div className="import-account-container">
          {this.renderInput()}
        </div>
        {this.renderBottom()}
      </CustomView>
    )
  }

}

const mapStateToProps = (state) => ({
  accountType:state.cache.accountType
});

function mapDispatchToProps(dispatch) {
  return {
    updateEntryWhichRoute: (index) => {
      dispatch(updateEntryWhichRoute(index));
    },
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportAccount);
