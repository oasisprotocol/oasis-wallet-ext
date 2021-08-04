import React from "react";
import { connect } from "react-redux";
import start_backup from "../../../assets/images/start_backup.png";
import { getLanguage } from "../../../i18n";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import "./index.scss";
class BackupTips extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  renderTip = (content) => {
    return (
      <p className="wallet-backup-tip">
        {content}
      </p>
    )
  }
  goToCreate = () => {
    this.props.history.push({
      pathname: "/showmnemonic",
    }
    )
  }
  renderBotton = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('next')}
          onClick={this.goToCreate}
        />
      </div>
    )
  }
  render() {
    return (
      <CustomView
        history={this.props.history}>
        <div className="mne-show-container">
          <div className={"backup-img-container"}>
            <img src={start_backup} className={"backup-top-img"} />
          </div>
          <div className={"backup-title-tip-container"}>
            <p className={"backup-title-tip"}>{getLanguage("backTips_1")}</p>
          </div>
          {this.renderTip(getLanguage("backTips_2"))}
          {this.renderTip(getLanguage("backTips_3"))}
        </div>
        {this.renderBotton()}
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(BackupTips);
