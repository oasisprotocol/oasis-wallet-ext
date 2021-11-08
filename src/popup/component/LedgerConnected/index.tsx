import PropTypes from 'prop-types';
import React from 'react';
import connectedIcon from "../../../assets/images/connected.png";
import { getLanguage } from "../../../i18n";
import ledgerWallet from "../../../assets/images/ledger_logo.png";
import ledger_title from "../../../assets/images/ledger_title.png";
import './index.scss';
import { Trans } from 'react-i18next';
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

  renderTips = () => {
    return (<div className={'ledger-connect-tip-container'}>
      {
        this.props.tips.map((tip, index) => {
          return <div key={index + ""} className={"wallet-tip-description"}>
            <Trans
              i18nKey={tip}
              components={{ bold: <strong /> }}
            />
          </div>
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