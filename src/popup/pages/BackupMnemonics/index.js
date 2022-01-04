import cx from "classnames";
import React from "react";
import { connect } from "react-redux";
import { WALLET_GET_CREATE_MNEMONIC, WALLET_NEW_HD_ACCOUNT } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";
import { ENTRY_WHICH_ROUTE, updateEntryWhichRoute } from "../../../reducers/entryRouteReducer";
import { sendMsg } from "../../../utils/commonMsg";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import Toast from "../../component/Toast";
import "./index.scss";
class BackupMnemonics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mnemonic: "",
      list: [],
      selectList: [],
    };
    this.isUnMounted = false;
  }
  componentDidMount() {
    sendMsg({
      action: WALLET_GET_CREATE_MNEMONIC,
      payload: false
    }, (mnemonic) => {
      let mneList = mnemonic.split(" ")
      for (let i = 0; i < mneList.length; i++) {
        const index = Math.floor(Math.random() * mneList.length);
        [mneList[i], mneList[index]] = [mneList[index], mneList[i]];
      }
      let list = mneList.map((v) => {
        return {
          name: v,
          selected: false,
        };
      })
      this.callSetState({
        mnemonic: mnemonic,
        list
      })
    })
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
  compareList = () => {
    const { selectList, mnemonic } = this.state;
    let mneList = mnemonic.split(" ")
    return selectList.map((v) => v.name).join("") == mneList.join("");
  };
  goToNext = () => {
    const { list } = this.state;
    let bool = this.compareList();
    if (bool) {
      sendMsg({
        action: WALLET_NEW_HD_ACCOUNT,
        payload: {
          mne: this.state.mnemonic,
        }
      },
        async (currentAccount) => {
          this.props.updateCurrentAccount(currentAccount)
          this.props.updateEntryWhichRoute(ENTRY_WHICH_ROUTE.HOME_PAGE)
          this.props.history.push({
            pathname: "/backup_success",
          })
        })
    } else {
      Toast.info(getLanguage("seed_error"))
      this.callSetState({
        selectList: [],
        list: list.map(v => {
          v.selected = false;
          return v;
        })
      })
    }
    return

  };
  onClickTopItem = (v, i) => {
    const { list, selectList } = this.state;
    const bool = v.selected;
    if (bool) {
      const index = list.findIndex((item) => item.name == v.name);
      list[index].selected = !bool;
      selectList.splice(i, 1);
      this.callSetState({
        list,
        selectList,
      })
    }
  };
  onClickBottomItem = (v, i) => {
    const { list, selectList } = this.state;
    const bool = v.selected;
    if (!bool) {
      list[i].selected = !bool;
      selectList.push(v);
      this.callSetState({
        list,
        selectList,
      })
    }
  };
  renderSelectedMne = () => {
    return (<div className="mne-container mne-select-container">
      {this.state.selectList.map((item, index) => {
        return (<p
          key={index + ""}
          onClick={() => this.onClickTopItem(item, index)}
          className={"mne-item-common mne-item  mne-item-clicked click-cursor"}>{index + 1 + ". " + item.name}</p>)
      })}
    </div>)
  }
  renderMneList = () => {
    return (
      <div className={"mne-container"}>
        {this.state.list.map((item, index) => {
          return (
            <div
              key={index + ""}
              onClick={() => this.onClickBottomItem(item, index)}
              className={cx({
                "mne-item-select": item.selected,
              })}
            ><p className={"mne-item-record mne-item-noSelect click-cursor"}>{item.name}</p></div>)
        })
        }
      </div>)
  }
  renderBottomBtn = () => {
    return (
      <div className="bottom-container">
        <Button
          content={getLanguage('confirm')}
          onClick={this.goToNext}
          disabled={this.state.selectList.length !== 24}
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
          <p className={"mne-description"}>{getLanguage('backInputDesc')}</p>
          {this.renderSelectedMne()}
          {this.renderMneList()}
        </div>
        {this.renderBottomBtn()}
      </CustomView>
    )
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {
    updateEntryWhichRoute: (index) => {
      dispatch(updateEntryWhichRoute(index));
    },
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BackupMnemonics);
