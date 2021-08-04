import React from "react";
import { connect } from "react-redux";
import { getLanguage } from "../../../i18n";
import { copyText } from '../../../utils/utils';
import ConfirmModal from '../../component/ConfirmModal';
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
import copy_address from "../../../assets/images/copy_address.png";
class ShowPrivateKeyPage extends React.Component {
  constructor(props) {
    super(props);
    let privateKey = props.location.params?.privateKey ?? ""
    let address = props.location.params?.address ?? ""
    this.state = {
      priKey: privateKey,
      address,
    };
  }

  renderTip = () => {
    return (
      <p className="wallet-tip-description">{getLanguage('privateKeyTip_2')}</p>
    )
  }
  copyAddress = () => {
    copyText(this.state.address).then(() => {
      Toast.info(getLanguage('copySuccess'))
    })
  }
  renderAddress = () => {
    return (<div className={"click-cursor"} onClick={this.copyAddress}>
      <p className="wallet-show-title">{getLanguage('walletAddress')}</p>
      <div className={"wallet-pri-address-container"}>
      <p className="wallet-show-address">{this.state.address}</p>
      </div>
    </div>)
  }
  renderKey = () => {
    return (<p className="wallet-show-prikey">{this.state.priKey}</p>)
  }
  onCopy = () => {
    let title = getLanguage('prompt')
    let content = [getLanguage('copyTipContent'),
    getLanguage('confirmEnv'),
    ]
    let confirmText = getLanguage('copyCancel')
    let cancelText = getLanguage('copyConfirm')
    ConfirmModal.show({
      title, content,
      confirmText, cancelText,
      showClose: true,
      onConfirm: this.onClickRight,
      onCancel: this.onClickLeft
    })
  }
  onClickRight = () => {
  }
  onClickLeft = () => {
    copyText(this.state.priKey).then(() => {
      Toast.info(getLanguage('copySuccess'))
    })
  }
  renderCopy = () => {
    return (
      <div className="copy-to-clip click-cursor"
        onClick={this.onCopy}>
        <p className="copy-to-desc">{getLanguage('copyToClipboard')}</p>
        <img className={'receive-copy-address'} src={copy_address} />
      </div>
    )
  }
  goToNext = () => {
    this.props.history.goBack()
  }

  render() {
    return (
      <CustomView
        title={getLanguage('showPrivateKey')}
        history={this.props.history}>
        <div className="mne-show-container">
          {this.renderAddress()}
          {this.renderKey()}
          {this.renderCopy()}
        </div>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  currentAccount: state.accountInfo.currentAccount,
});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ShowPrivateKeyPage);
