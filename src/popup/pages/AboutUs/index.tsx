import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { VERSION_CONFIG } from "../../../../config";
import home_logo from "../../../assets/images/home_logo.png";
import record_arrow from "../../../assets/images/record_arrow.png";
import { getLanguage } from "../../../i18n";
import { openTab } from "../../../utils/commonMsg";
import CustomView from "../../component/CustomView";
import "./index.scss";
class AboutUs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      changelog: "",
      followUs: [],
      gitRepoName: ""
    };
    this.isUnMounted = false;
  }
  componentDidMount() {
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

  renderTopInfo = () => {
    return (<div className={'about-top-container'}>
      <img src={home_logo} className={"about-home-logo"} />
      <p className={"about-wallet-name"}>{getLanguage('walletName')}</p>
      <p className={"about-wallet-version"}>{VERSION_CONFIG}</p>
    </div>)
  }

  onClick = (url) => {
    openTab(url)
  }

  renderWalletItem = (title, callback) => {
    return (
      <div onClick={() => {
        callback && callback()
      }} className={cx("wallet-item-container", {
        "click-cursor": !!callback
      })}>
        <p className={"wallet-item-title"}>{title}</p>
        <img src={record_arrow} className={"account-item-option"} />
      </div>
    )
  }
  onClickPrivacyPolicy = () => {
    openTab('https://oasisprotocol.org/privacy-policy')
  }
  onClickGithub = () => {
    openTab('https://github.com/oasisprotocol/oasis-wallet-ext/')
  }
  onClickContactUs = () => {
    openTab('mailto:info@oasisprotocol.org')
  }
  renderWalletDetail = () => {
    return (<div className={"wallet-detail-container"}>
      {this.renderWalletItem(getLanguage("userPrivateProtocol"), this.onClickPrivacyPolicy)}
      {this.renderWalletItem(getLanguage("userAgree"))}
      {this.renderWalletItem("GitHub", this.onClickGithub)}
      {this.renderWalletItem(getLanguage("contactUs"), this.onClickContactUs)}
    </div>)
  }
  render() {
    return (
      <CustomView
        propsClassName={"about-outer-container"}
        history={this.props.history}>
        <div className="about-container">
          {this.renderTopInfo()}
          {this.renderWalletDetail()}
        </div>
        <div className="about-tip-container">
          <p className="about-tip">Powered by{' '}
            <a href="https://www.bitcat365.com/" target="_blank">Bit Cat</a>{' '}
            and{' '}
            <a href="https://simply-vc.com.mt/" target="_blank">Simply VC</a>
          </p>
        </div>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(AboutUs);
