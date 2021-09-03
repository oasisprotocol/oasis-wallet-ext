import React from "react";
import { connect } from "react-redux";
import ledgerWallet from "../../../assets/images/ledgerWallet.png";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import { LedgerConnected } from "../../component/LedgerConnected";
import "./index.scss";

class LedgerImport extends React.Component {
  constructor(props) {
    let params = props.location?.params || {};
    super(props);
    this.accountName = params.accountName
    this.state = {
    };
  }


  renderTopLogo = () => {
    return (
      <div className={"ledger-logo-container"}>
        <img src={ledgerWallet} className={"ledger-wallet-logo"} />
      </div>
    )
  }
  renderTips = () => {
    return (<div className={'ledger-connect-tip-container'}>
      <p className="wallet-tip-description">{getLanguage('ledgerConnectSuccess')}</p>
      <p className="wallet-tip-description">{getLanguage('ledgerImportTip')}</p>
    </div>)
  }
  goToNext = async () => {
    this.props.history.push({
      pathname: "ledger_address_page",
      params: {
        "accountName": this.accountName
      },
    })
  }
  renderBottomBtn = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('importAccount')}
          onClick={this.goToNext}
        />
      </div>)
  }
  render() {
    return (
      <CustomView
        title={getLanguage('walletName')}
        history={this.props.history}>
        <LedgerConnected tips={['ledgerImportTip']} />
        {this.renderBottomBtn()}
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LedgerImport);
