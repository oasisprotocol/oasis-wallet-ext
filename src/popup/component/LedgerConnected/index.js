import PropTypes from 'prop-types';
import React from 'react';
import connectedIcon from "../../../assets/images/connected.png";
import { getLanguage } from "../../../i18n";
import ledgerWallet from "../../../assets/images/ledger_logo.png";
import ledger_title from "../../../assets/images/ledger_title.png";
import './index.scss';
import { specialSplit } from '../../../utils/utils';
export class LedgerConnected extends React.Component {
  static propTypes = {
    tips: PropTypes.array
  }
  renderTopLogo = () => {
    return (
      <div className={"ledger-status-logo-con"}>
        <div className={"ledger-steps-logo-container"}>
          <img src={ledgerWallet} className={"ledger-wallet-logo-connect"} />
          <img src={ledger_title} className={"ledger-wallet-title"} />
        </div>
        <div className={'ledger-connected-status'}>
          <div className={'connected-status'}>
            <img src={connectedIcon} className={'ledger-connected-icon'} />
            {
              getLanguage('connected')
            }
          </div>
          {
            getLanguage('ledgerWallet')
          }
        </div>
      </div>
    )
  }

  renderSpicalStyle = (list,outerIndex) => {
    return (
      <p className={"wallet-tip-description"} key={outerIndex+""}>
        {
          list.map((item, index) => {
            if (item.type === "common") {
              return (<span key={index + ""}>{item.showStr}</span>)
            } else {
              return (<span key={index + ""} className={"tips-spical"}>{item.showStr}</span>)
            }
          })
        }
      </p>
    )
  }
  renderTips = () => {
    return (<div className={'ledger-connect-tip-container'}>
      {
        this.props.tips.map((tip,index) => {
          let realTip = getLanguage(tip)
          let list = specialSplit(realTip)
          return this.renderSpicalStyle(list,index)
        })
      }
    </div>)
  }
  render() {
    return <div className={'ledger-connected-container'}>
      {
        this.renderTopLogo()
      }
      {
        this.renderTips()
      }
    </div>
  }
}