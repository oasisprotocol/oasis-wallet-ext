import qrCode from 'qrcode-generator';
import React from "react";
import { connect } from "react-redux";
import copy_address from "../../../assets/images/copy_address.png";
import logo from "../../../assets/images/Rose Wallet Logo Blue cropped.svg";
import { getLanguage } from "../../../i18n";
import { copyText, getPrettyAddress } from '../../../utils/utils';
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";

class ReceivePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  renderQrView = () => {
    let { address } = this.props.currentAccount
    const qrImage = qrCode(4, 'M')
    qrImage.addData(address)
    qrImage.make()
    return (
      <img src={qrImage.createDataURL(4)} alt="QR code"></img>
    )
  }
  onCopy = () => {
    let { address } = this.props.currentAccount
    copyText(address).then(() => {
      Toast.info(getLanguage('copySuccess'))
    })

  }

  renderAddress = () => {
    let { address } = this.props.currentAccount
    let showAddress = getPrettyAddress(address)
    return (<div className="receive-address-container click-cursor" onClick={this.onCopy}>
      <p className={"receive-address-detail"}>{showAddress}</p>
      <img className={'receive-copy-address'} src={copy_address} />
    </div>)
  }

  renderQrTip = () => {
    let symbol =  this.props.netConfig.currentSymbol
    return (<div className={"qr-tip-margin"}>
      <p className={"receive-qr-tip"}>{getLanguage('qrTip')}{symbol} {getLanguage('tokens')}</p>
    </div>)
  }
  renderAddressTip = () => {
    return (<div className={"address-tip-margin"}>
      <p className={"receive-address-tip"}>{getLanguage("walletAddress")}</p>
    </div>)
  }
  render() {
    return (
      <CustomView
        title={getLanguage('receiveTitle')}
        propsClassName={'receive-background'}
        history={this.props.history}>
        <div className={"receive-container"}>
          <img className={'receive-home-logo'} src={logo} />
          <div className={"receive-content-container"}>
            {this.renderQrTip()}
            {this.renderQrView()}
            {this.renderAddressTip()}
            {this.renderAddress()}
          </div>
        </div>
      </CustomView>
    )
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
  netConfig: state.network,
});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceivePage);