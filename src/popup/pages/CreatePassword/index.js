import React from "react";
import { connect } from "react-redux";
import { WALLET_CREATE_PWD } from "../../../constant/types";
import { getLanguage } from "../../../i18n";
import { setLanguage } from "../../../reducers/appReducer";
import { sendMsg } from "../../../utils/commonMsg";
import { matchList } from "../../../utils/validator";
import Button from "../../component/Button";
import CustomView from "../../component/CustomView";
import TextInput from "../../component/TextInput";
import "./index.scss";

import select_account_no from "../../../assets/images/select_account_no.svg";
import select_account_ok from "../../../assets/images/select_account_ok.svg";
class CreatePassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inputPwd: "",
      confirmPwd: "",
      errorTip: "",
      btnClick: false,
      matchList: matchList,
      isSelect:false
    };
    this.isUnMounted = false;
  }
  componentWillUnmount() {
    this.isUnMounted = true;
    let newMatchList =this.state.matchList
    this.callSetState({
      matchList: newMatchList.map(v => {
        v.bool = false;
        return v;
      })
    })
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
  setBtnStatus = () => {
    let errList = this.state.matchList.filter(v => {
      if (!v.bool) {
        return v
      }
    })
    if (
      errList.length <= 0
      && this.state.confirmPwd.length > 0
      && !this.state.errorTip
      && this.state.isSelect) {
      this.callSetState({
        btnClick: true,
      })
    } else {
      this.callSetState({
        btnClick: false,
      })

    }
  };
  goToCreate = () => {
    let { welcomeNextRoute } = this.props.cache
    sendMsg({
      action: WALLET_CREATE_PWD,
      payload: {
        pwd: this.state.confirmPwd,
      }
    }, (res) => { })
    let nextRoute = welcomeNextRoute
    this.props.history.push({
      pathname: nextRoute,
      params: {
        "pwd": this.state.confirmPwd,
      },
    })

  };
  onPwdInput = (e) => {
    const { value } = e.target;
    let { matchList } = this.state
    this.callSetState({
      inputPwd: value,
    }, () => {
      this.callSetState({
        matchList: matchList.map(v => {
          if (v.expression.test(value)) {
            v.bool = true;
          } else {
            v.bool = false;
          }
          return v;
        })
      }, () => {
        this.checkConfirmStatus()
      })
    })
  }
  checkConfirmStatus=()=>{
    if (this.state.confirmPwd.length > 0 && this.state.inputPwd !== this.state.confirmPwd) {
      this.callSetState({
        errorTip: getLanguage('passwordDifferent')
      }, () => {
        this.setBtnStatus()
      })
    } else {
      this.callSetState({
        errorTip: ""
      }, () => {
        this.setBtnStatus()
      })
    }
  }
  onPwdConfirmInput = (e) => {
    const { value } = e.target;
    this.callSetState({
      confirmPwd: value,
    }, () => {
      this.checkConfirmStatus()
    })
  }
  onSubmit = (event) => {
    event.preventDefault();
  }
  onClickSelect=()=>{
    this.callSetState({
      isSelect : !this.state.isSelect
    }, () => {
      this.setBtnStatus()
    })
  }
  render() {
    let imgSource = this.state.isSelect ? select_account_ok : select_account_no
    let selectTip = getLanguage('password_tip')
    return (
      <CustomView
        propsClassName={"create-route-container"}
        history={this.props.history}>
        <form onSubmit={this.onSubmit}>
          <div className={"common-container"}>
            <p className={'desc-title'}>{getLanguage('createPassword')}</p>
            <div className="create_container">
              <TextInput
                value={this.state.inputPwd}
                label={getLanguage('inputPassword')}
                onTextInput={this.onPwdInput}
                showErrorTag={true}
                matchList={this.state.matchList}
              />
              <TextInput
                value={this.state.confirmPwd}
                label={getLanguage('confirmPassword')}
                onTextInput={this.onPwdConfirmInput}
                errorTip={this.state.errorTip}
              />
            </div>

          </div>
          <div className="bottom-container">
            <div className={"create-select-container click-cursor"} onClick={this.onClickSelect}>
              <img src={imgSource} className={"account-item-select "} />
              <p className={"create-select-content"}>{selectTip}</p>
            </div>
            <Button
              disabled={!this.state.btnClick}
              content={getLanguage('next')}
              onClick={this.goToCreate}
            />
          </div>
        </form>

      </CustomView>
    )
  }
}

const mapStateToProps = (state) => ({
  cache: state.cache
});

function mapDispatchToProps(dispatch) {
  return {
    setLanguage: (lan) => {
      dispatch(setLanguage(lan));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePassword);
