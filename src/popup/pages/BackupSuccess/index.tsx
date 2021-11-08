import React from "react";
import { connect } from "react-redux";
import walletSuccess from "../../../assets/images/walletSuccess.png";
import { getLanguage } from "../../../i18n";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import "./index.scss";

class BackupSuccess extends React.Component {
  constructor(props) {
    super(props);
    let type = props.location.params?.type ?? "";
    let nextRoute = props.location.params?.nextRoute ?? "";
    let showTip = ""
    if (type === "restore") {
      showTip = "backup_success_restore"
    } else if (type === "ledger") {
      showTip = "ledgerSuccessTip"
    } else {
      showTip = "backup_success"
    }
    this.state = {
      showTip,
      nextRoute
    }
  }

  renderTip = (name) => {
    return (
      <p className="backup-success-tips"
      >{getLanguage(this.state.showTip)}</p>
    );
  };
  goToNext = () => {
    if (this.state.nextRoute) {
      this.props.history.replace({
        pathname: this.state.nextRoute,
      })
    } else {
      this.props.history.push({
        pathname: "/homepage",
      })
    }

  };
  renderBottomBtn = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('startHome')}
          onClick={this.goToNext}
          propsClass={'small-btn'}
        />
      </div>
    )
  }
  render() {
    return (
      <CustomView
        noBack={true}
        history={this.props.history}>
        <div className="backup-success-container">
          <img className={"backup-success-img"} src={walletSuccess}></img>
          {this.renderTip()}
        </div>
        {this.renderBottomBtn()}
      </CustomView>
    )
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
  accountInfo: state.accountInfo,
});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(BackupSuccess);
