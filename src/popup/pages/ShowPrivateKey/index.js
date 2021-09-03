import React from "react";
import { connect } from "react-redux";
import { getLanguage } from "../../../i18n";
import { copyText } from '../../../utils/utils';
import ConfirmModal from '../../component/ConfirmModal';
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
import copy_address from "../../../assets/images/copy_address.png";
import SecurityPwd from "../../component/SecurityPwd";
import { sendMsg } from "../../../utils/commonMsg";
import { WALLET_GET_PRIVATE_KEY } from "../../../constant/types";
import { SEC_SHOW_PRIVATE_KEY } from "../../../constant/walletType";
class ShowPrivateKeyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      privKey: "",
      showSecurity:true
    };
    this.address = props.location.params?.address ?? ""
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
  renderTip = () => {
    return (
      <p className="wallet-tip-description">{getLanguage('privateKeyTip_2')}</p>
    )
  }
  copyAddress = () => {
    copyText(this.address).then(() => {
      Toast.info(getLanguage('copySuccess'))
    })
  }
  renderAddress = () => {
    return (<div className={"click-cursor"} onClick={this.copyAddress}>
      <p className="wallet-show-title">{getLanguage('walletAddress')}</p>
      <div className={"wallet-pri-address-container"}>
      <p className="wallet-show-address">{this.address}</p>
      </div>
    </div>)
  }
  renderKey = () => {
    return (<p className="wallet-show-privkey">{this.state.privKey}</p>)
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
    copyText(this.state.privKey).then(() => {
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

  onClickCheck=(password)=>{
    sendMsg({
      action: WALLET_GET_PRIVATE_KEY,
      payload: {
        password: password,
        address: this.address
      }
    },
      async (privateKey) => {
        if (privateKey.error) {
          if (privateKey.type === "local") {
            Toast.info(getLanguage(privateKey.error))
          } else {
            Toast.info(privateKey.error)
          }
        } else {
          this.callSetState({
            privKey:privateKey,
            showSecurity:false
          },()=>{
            Toast.info(getLanguage("securitySuccess"))
          })
        }
      })
  }
  render() {
    const {showSecurity} = this.state
    let title = showSecurity? getLanguage('securityPassword'):getLanguage('showPrivateKey')
    return (
      <CustomView
        title={title}
        history={this.props.history}>
        {showSecurity ? <SecurityPwd onClickCheck={this.onClickCheck} action={SEC_SHOW_PRIVATE_KEY}/>:
        <div className="mne-show-container">
          {this.renderAddress()}
          {this.renderKey()}
          {this.renderCopy()}
        </div>}
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
