import React from "react";
import { connect } from "react-redux";
import { WALLET_GET_CREATE_MNEMONIC } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { sendMsg } from "../../../utils/commonMsg";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import "./index.scss";
class ShowMnemonic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mnemonic: "",
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
  componentDidMount() {
    sendMsg({
      action: WALLET_GET_CREATE_MNEMONIC,
      payload: true
    }, (mnemonic) => {
      this.callSetState({
        mnemonic: mnemonic
      })
    })
  }

  showMne = () => {
    return (
      <div className={"mne-container"}>
        {this.state.mnemonic.split(" ").map((item, index) => {
          return <p key={index + ""} className="mne-item mne-item-common">{index + 1 + ". " + item}</p>;
        })}
      </div>
    );
  };
  goToNext = () => {
    this.props.history.push({
      pathname: "/backup_mnemonic",
    })
  };
  renderBottomBtn = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('show_seed_button')}
          onClick={this.goToNext}
        />
      </div>
    )
  }
  render() {
    return (
      <CustomView
        history={this.props.history}>
        <div className="mne-show-container">
          <p className={'desc-title'}>{getLanguage('backTips_title')}</p>
          <p className={"mne-description"}>{getLanguage("show_seed_content")}</p>
          {this.showMne()}
        </div>
        {this.renderBottomBtn()}
      </CustomView>
    )
  }
}

const mapStateToProps = (state) => ({
});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowMnemonic);
