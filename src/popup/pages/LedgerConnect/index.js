import OasisApp from '@oasisprotocol/ledger';
import cx from "classnames";
import React from "react";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
import ledger_connect_little from "../../../assets/images/ledger_connect_little.png";
import ledgerWallet from "../../../assets/images/ledger_logo.png";
import ledger_open_little from "../../../assets/images/ledger_open_little.png";
import ledger_close_little from "../../../assets/images/ledger_close_little.svg";
import ledger_confirm_little from "../../../assets/images/ledger_confirm_little.svg";
import ledger_title from "../../../assets/images/ledger_title.png";
import { LEDGER_CONNECTED_SUCCESSFULLY } from '../../../constant/types';
import { getLanguage } from "../../../i18n";
import { sendMsg } from '../../../utils/commonMsg';
import { getPort } from "../../../utils/ledger";
import Button from "../../component/Button";
import { LedgerConnected } from "../../component/LedgerConnected";
import "./index.scss";

class LedgerConnect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      opened: false,
      connectCompleted: false
    }
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
  onDisconnected = () => {
    this.callSetState({
      connected: false
    })
  }
  goToNext = async () => {
    let connected = this.state.connected
    let opened = this.state.opened
    try {
      if (this.transport) {
        this.transport.off('disconnect', this.onDisconnected)
        try {
          await this.transport.close()
        } catch (e) {
        }
      }
      this.transport = await getPort()
      connected = true
      this.transport.on('disconnect', this.onDisconnected)
    } catch (e) {
      connected = false
    }

    try {
      this.app = new OasisApp(this.transport)
      const result = await this.app.appInfo()
      if (result.appName === 'Oasis') {
        opened = true
      } else {
        opened = false
      }
    } catch (e) {
      opened = false
    }
    this.callSetState({
      opened,
      connected
    })
    if (opened && connected) {
      sendMsg({
        action: LEDGER_CONNECTED_SUCCESSFULLY,
      },()=>{
        this.transport.close()
        this.transport = null
        this.callSetState({
          connectCompleted: true
        })
      });
    }
  }
  renderCommonStep = (item, index) => {
    return (
      <div key={index + ""} className={cx("ledger-item-container", {
        "ledger-item-container-success": item.bool
      })}>
        <div className={"ledger-step-container-item"}>
          <div className={cx("ledger-item-left", {
            "ledger-item-left-success": item.bool
          })}>
            <p className={"ledger-step-title"}>{item.title}</p>
          </div>
          <div className={"ledger-item-right"}>
            <img className={"ledger-little-icon"} src={item.img} />
            <p className={"ledger-step-content"}>{item.content}</p>
          </div>
        </div>
      </div>)
  }
  renderSteps = () => {
    const steps = [
      {
        title: getLanguage("step1"),
        content: getLanguage('pleaseConnectLedger'),
        bool: this.state.connected,
        img: ledger_connect_little
      },
      {
        title: getLanguage("step2"),
        content: getLanguage('pleaseCloseLedgerLive'),
        bool: this.state.opened,
        img: ledger_close_little
      },
      {
        title: getLanguage("step3"),
        content: getLanguage('pleaseOpenInLedger'),
        bool: this.state.opened,
        img: ledger_open_little
      },
    ]
    return (
      <>
        <div className={"ledger-steps-logo-container"}>
          <img src={ledgerWallet} className={"ledger-wallet-logo"} />
          <img src={ledger_title} className={"ledger-wallet-title"} />
        </div>
        <div className={"ledger-step-container"}>{steps.map((step, index) => {
          return this.renderCommonStep(step, index)
        })}</div>
      </>
    )
  }
  renderBottomBtn = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('next')}
          onClick={this.goToNext}
        />
      </div>)
  }
  render() {
    return (
      <div className={"ledger-container"}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{getLanguage("ledgerConnect")}</title>
          <link rel="canonical" href="./popup.html#/ledger_connect" />
        </Helmet>
        <div>
          {
            this.state.connectCompleted ?
              <LedgerConnected tips={['back2extension']} /> :
              this.renderSteps()
          }
        </div>
        {!this.state.connectCompleted && this.renderBottomBtn()}
      </div>)
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(LedgerConnect);
