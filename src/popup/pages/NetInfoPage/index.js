import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { mainnet_config, testnet_config } from "../../../../config";
import select_account_no from "../../../assets/images/select_account_no.svg";
import select_account_ok from "../../../assets/images/select_account_ok.svg";
import { saveLocal } from "../../../background/storage/localStorage";
import { NETWORK_CONFIG } from "../../../constant/storageKey";
import { NET_CONFIG_ADD, NET_CONFIG_DEFAULT, NET_CONFIG_TYPE_MAIN } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateNetConfigRequest } from "../../../reducers/cache";
import { updateNetConfigList } from "../../../reducers/network";
import { urlValid } from "../../../utils/utils";
import Button from "../../component/Button";
import ConfirmModal from "../../component/ConfirmModal";
import CustomView from "../../component/CustomView";
import TestModal from "../../component/TestModal";
import Toast from "../../component/Toast";
import "./index.scss";

class NetInfoPage extends React.Component {
  constructor(props) {
    super(props);
    const title = props.location.params?.name ?? ""
    const netType = props.location.params?.netType ?? ""
    let list = props.netConfig.totalNetList.filter((item, index) => {
      return item.netType === netType
    })
    let currentConfig = {}
    let globalNetType = ''
    props.netConfig.currentNetList.filter((item, index) => {
      if (item.netType === netType) {
        currentConfig = item
      }
      if (item.isSelect) {
        globalNetType = item.netType
      }
    })
    this.state = {
      title,
      netType,
      netConfigList: list || [],
      currentConfig: currentConfig,
      itemFocusUrl: -1,
      netUrl: ""
    };
    this.modal = React.createRef();
    this.isUnMounted = false;
    this.globalNetType = globalNetType
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
  onMouseEnter = (grpc) => {
    this.callSetState({
      itemFocusUrl: grpc
    })
  }
  onMouseLeave = () => {
    this.callSetState({
      itemFocusUrl: -1
    })
  }

  renderItem = (netItem, index) => {
    let { grpc, nodeType } = netItem
    let isSelect = this.state.currentConfig.grpc === grpc
    let imgUrl = isSelect ? select_account_ok : select_account_no
    let isDefault = nodeType === NET_CONFIG_DEFAULT
    return (
      <div className={'network-item-container click-cursor'}
        onClick={() => this.onSelect(netItem)} key={index + ""}>
        <div className={"network-item-container-left"}>
          {imgUrl && <img onClick={() => this.onSelect(netItem)} className={"network-option-img click-cursor"} src={imgUrl} />}
          <p className={cx("network-item-content", {
            "network-item-content-common": !isSelect
          })}>{grpc}</p>
        </div>
        {!isDefault && <p className={"network-right-delete click-cursor"} onClick={(e) => this.onDelete(e, netItem)}>{getLanguage("netDelete")}</p>}
      </div>)
  }
  renderDefaultNode = () => {
    let list = this.state.netConfigList.filter((item) => item.nodeType === NET_CONFIG_DEFAULT)
    if (list.length <= 0) {
      return <div />
    }
    return (
      <div>
        <p className={"network-title"}>{getLanguage("defaultNetwork")}</p>
        {list.map((item, index) => {
          return this.renderItem(item, index)
        })}
      </div>
    )
  }
  renderCustomNode = () => {
    let list = this.state.netConfigList.filter((item) => item.nodeType !== NET_CONFIG_DEFAULT)
    if (list.length <= 0) {
      return <div />
    }
    return (
      <div className={"network-item-diff"}>
        <p className={"network-title"}>{getLanguage('customNetwork')}</p>
        {list.map((item, index) => {
          return this.renderItem(item, index)
        })}
      </div>
    )
  }
  onSubmit = (event) => {
    event.preventDefault();
  }
  onSetModalVisible = (visible) => {
    if (!visible) {
      setTimeout(() => {
        this.callSetState({
          netUrl: "",
        })
      }, 500);
    }
  }
  onUrlInput = (e) => {
    this.callSetState({
      netUrl: e.target.value
    })
  }
  renderInput = () => {
    return (
      <div className="change-input-wrapper">
        <textarea
          className={"address-text-area-input"}
          placeholder={getLanguage('inputNetAddress')}
          value={this.state.netUrl}
          onChange={this.onUrlInput} />
      </div>)
  }
  isExist = (grpc) => {
    let list = this.props.netConfig.totalNetList
    for (let index = 0; index < list.length; index++) {
      const net = list[index];
      if (net.grpc === grpc) {
        return true
      }
    }
    return false
  }
  onSelect = (netItem) => {
    this.callSetState({
      currentConfig: netItem
    }, () => {
      let totalNetList = this.props.netConfig.totalNetList

      let currentNetList = this.props.netConfig.currentNetList.filter((item, index) => {
        return item.netType !== this.state.netType
      })
      currentNetList.push(netItem)
      totalNetList = this.setTotalNetSelect(totalNetList, currentNetList)
      currentNetList = this.setCurrentNetListSelect(currentNetList)
      let config = {
        totalNetList: [...totalNetList],
        currentNetList: [...currentNetList],
      }
      this.props.updateNetConfigList(config)
      if (this.globalNetType === netItem.netType) {
        this.props.updateNetConfigRequest(true)
      }
      saveLocal(NETWORK_CONFIG, JSON.stringify(config))
    })
  }
  updateLocalConfig = (totalNetList, currentNetList) => {
    let config = {
      totalNetList: [...totalNetList],
      currentNetList: [...currentNetList],
    }
    this.props.updateNetConfigList(config)
    saveLocal(NETWORK_CONFIG, JSON.stringify(config))
  }
  onConfirmDelete = (netItem) => {
    if (netItem.isSelect) {
      let totalList = this.props.netConfig.totalNetList.filter((item, index) => {
        return item.grpc !== netItem.grpc
      })
      let currentList = [...totalList]
      currentList = currentList.filter((item, index) => {
        return item.netType === this.state.netType
      })
      this.callSetState({
        currentConfig: currentList[0],
        netConfigList: currentList
      }, () => {
        let currentNetList = this.props.netConfig.currentNetList.filter((item, index) => {
          return item.netType !== this.state.netType
        })
        currentNetList.push(this.state.currentConfig)
        totalList = this.setTotalNetSelect(totalList, currentNetList)
        currentNetList = this.setCurrentNetListSelect(currentNetList)
        this.updateLocalConfig(totalList, currentNetList)
      })
    } else {
      let totalList = this.props.netConfig.totalNetList.filter((item, index) => {
        return item.grpc !== netItem.grpc
      })
      let currentList = [...totalList]
      currentList = currentList.filter((item, index) => {
        return item.netType === this.state.netType
      })
      this.callSetState({
        netConfigList: currentList
      }, () => {
        totalList = this.setTotalNetSelect(totalList, this.props.netConfig.currentNetList)
        let currentNetList = this.setCurrentNetListSelect(this.props.netConfig.currentNetList)
        this.updateLocalConfig(totalList, currentNetList)

      })

    }

    if (this.globalNetType === netItem.netType) {
      this.props.updateNetConfigRequest(true)
    }
    ConfirmModal.hide()
  }
  onCancel = () => {
  }
  onDelete = (e, netItem) => {
    e.stopPropagation();

    let title = getLanguage('prompt')
    let content = getLanguage("confirmDeleteNode")
    let cancelText = getLanguage('cancel')
    let confirmText = getLanguage('confirm')
    ConfirmModal.show({
      title, content, cancelText, confirmText,
      onConfirm: () => {
        this.onConfirmDelete(netItem)
      },
      onCancel: this.onCancel,
    })
  }
  onAddNetConfig = () => {
    if (!urlValid(this.state.netUrl)) {
      Toast.info(getLanguage("urlError_1"))
      return
    }
    if (this.isExist(this.state.netUrl)) {
      Toast.info(getLanguage('urlError_2'))
      return
    }

    setTimeout(() => {
      this.onCloseModal()
      let netConfig = {}
      if(this.state.netType === NET_CONFIG_TYPE_MAIN){
        netConfig = mainnet_config
      }else{
        netConfig = testnet_config
      }
      let addItem = {
        ...netConfig,
        nodeType: NET_CONFIG_ADD,
        isSelect: true,
        grpc:this.state.netUrl
      }
      let netConfigList = this.state.netConfigList
      let list = [...netConfigList];
      list.push(addItem)

      this.callSetState({
        currentConfig: addItem,
        netConfigList: list,
        netUrl: "",
      }, () => {
        let currentNetList = this.props.netConfig.currentNetList.filter((item, index) => {
          return item.netType !== this.state.netType
        })
        currentNetList.push(addItem)
        let propsTotalNetList = this.props.netConfig.totalNetList
        let totalNetList = [...propsTotalNetList]
        totalNetList.push(addItem)

        totalNetList = this.setTotalNetSelect(totalNetList, currentNetList)
        currentNetList = this.setCurrentNetListSelect(currentNetList)
        this.updateLocalConfig(totalNetList, currentNetList)
        if (this.globalNetType === this.state.netType) {
          this.props.updateNetConfigRequest(true)
        }
      })
    }, 350);
  }
  setTotalNetSelect = (list, selectList) => {
    let newList = []
    for (let index = 0; index < list.length; index++) {
      let netConfig = list[index];
      let isEqual = false
      for (let j = 0; j < selectList.length; j++) {
        const selectConfig = selectList[j];
        if (netConfig.url === selectConfig.url) {
          isEqual = true
          break
        }
      }
      if (isEqual) {
        newList.push({
          ...netConfig,
          isSelect: true
        })
      } else {
        newList.push({
          ...netConfig,
          isSelect: false
        })
      }

    }
    return newList
  }

  setCurrentNetListSelect = (list) => {
    let newList = []
    for (let index = 0; index < list.length; index++) {
      let netConfig = list[index];
      if (this.globalNetType === netConfig.netType) {
        newList.push({
          ...netConfig,
          isSelect: true
        })
      } else {
        newList.push({
          ...netConfig,
          isSelect: false
        })
      }

    }
    return newList
  }
  onCloseModal = () => {
    this.modal.current.setModalVisible(false)
  }
  renderActionBtn = () => {
    return (
      <div className={"account-info-btn-container"}>
        <Button
          content={getLanguage('confirm')}
          onClick={this.onAddNetConfig}
          propsClass={"account-common-btn"}
        />
        <Button
          content={getLanguage('cancel')}
          propsClass={"account-common-btn account-common-btn-cancel"}
          onClick={this.onCloseModal}
        />
      </div>
    )
  }
  renderChangeModal = () => {
    return (<TestModal
      ref={this.modal}
      showClose={true}
      actionCallback={this.onSetModalVisible}
    >
      <div className={'account-change-name-container'}>
        <div className={"account-change-title-container"}>
          <p className={
            cx({ "account-change-name-title": true })
          }>{getLanguage('addNetWork')}</p>
        </div>
        {this.renderInput()}
        {this.renderActionBtn()}
      </div>
    </TestModal>)
  }
  onAdd = (e) => {
    this.modal.current.setModalVisible(true)
  }
  renderBottomBtn = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('addNetWork')}
          onClick={this.onAdd}
        />
      </div>
    )
  }
  render() {
    return (
      <CustomView
        title={this.state.title}
        history={this.props.history}>
        <div className={"network-container"}>
          {this.renderDefaultNode()}
          {this.renderCustomNode()}
          {this.renderBottomBtn()}
        </div>
        <form onSubmit={this.onSubmit}>
          {this.renderChangeModal()}
        </form>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({
  netConfig: state.network,
});

function mapDispatchToProps(dispatch) {
  return {
    updateNetConfigList: (config) => {
      dispatch(updateNetConfigList(config))
    },
    updateNetConfigRequest: (shouldRefresh) => {
      dispatch(updateNetConfigRequest(shouldRefresh))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NetInfoPage);
