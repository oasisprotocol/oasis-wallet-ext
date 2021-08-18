import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import home_logo from "../../../assets/images/home_logo.png";
import { get } from "../../../background/storage/storageService";
import {
  changeLanguage,
  default_language,

  getLanguage,
  languageOption
} from "../../../i18n";
import { setLanguage } from "../../../reducers/appReducer";
import { setWelcomeNextRoute } from "../../../reducers/cache";
import { openCurrentRouteInPersistentTab } from '../../../utils/popup';
import Button from "../../component/Button";
import Select from "../../component/Select";
import "./index.scss";
class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newAccount: false,
      isGotoProtocol: true
    }
    this.isUnMounted = false;
  }

  componentDidMount() {
    openCurrentRouteInPersistentTab();
    this.initLocal()
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

  initLocal = () => {
    get(null).then(dataObj => {
      if (dataObj && !dataObj.keyringData) {
        this.callSetState({
          newAccount: true
        })
      }
    })
  }
  handleChange = (item) => {
    let value = item.key
    this.props.setLanguage(value);
    changeLanguage(value);
  };
  renderLanMenu = () => {
    let defaultValue = languageOption.filter((item, index) => {
      return item.key === default_language
    })
    return (
      <Select
        options={languageOption}
        defaultValue={defaultValue[0].value}
        onChange={this.handleChange}
        selfInputProps={"select-lang-selfInput"}
        selectArrowProps={"select-lang-selectArrow"}
        optionsProps={"select-lang-options"}
        itemProps={"select-lang-item"}
      />
    )
  }
  goToPage = async (nextRoute) => {
    this.props.setWelcomeNextRoute(nextRoute)
    this.props.history.push({
      pathname: "/createpassword",
    })
  };

  render() {
    return (<div className="welcome_container">
      <div className={"welcome-top-container"}>
        <img src={home_logo} className={"welcome-logo"} />
        <p className={"welcome-wallet-name"}>{"Oasis Wallet"}</p>
        {this.renderLanMenu()}
      </div>
      <div className={'welcome-button-container'}>
        <Button
          content={getLanguage('createWallet')}
          onClick={() => { this.goToPage("/backup_tips") }}
          propsClass={'welcome-create-button'}
        >
        </Button>

        <Button
          content={getLanguage('restoreWallet')}
          onClick={() => { this.goToPage("/restore_account") }}
          propsClass={'welcome-restore-button'}
        >
        </Button>
      </div>
      <div className={'welcome-tip-container'}>
        <p className="bottomTip" >Powered by Bit Cat</p>
      </div>
    </div>)
  }
}

const mapStateToProps = (state) => ({
  language: state.appReducer.language,
});

function mapDispatchToProps(dispatch) {
  return {
    setLanguage: (lan) => {
      dispatch(setLanguage(lan));
    },
    setWelcomeNextRoute: (nextRoute) => {
      dispatch(setWelcomeNextRoute(nextRoute))
    },
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Welcome)
);
