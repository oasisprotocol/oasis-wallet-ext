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
import { setLanguage, hideNewExtensionWarning } from "../../../reducers/appReducer";
import { setWelcomeNextRoute } from "../../../reducers/cache";
import { openCurrentRouteInPersistentPopup } from '../../../utils/popup';
import Button from "../../component/Button";
import Select from "../../component/Select";
import { NewExtensionWarning } from "../../component/NewExtensionWarning"
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
    openCurrentRouteInPersistentPopup();
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
    this.callSetState({
      newAccount: true
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
      pathname: "/create_password",
    })
  };

  render() {
    return (<div className="welcome_container">
      {this.props.showNewExtensionWarning &&  <NewExtensionWarning handleClick={this.props.hideNewExtensionWarning} />}
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
    </div>)
  }
}

const mapStateToProps = (state) => ({
  language: state.appReducer.language,
  showNewExtensionWarning: state.appReducer.showNewExtensionWarning,
});

function mapDispatchToProps(dispatch) {
  return {
    setLanguage: (lan) => {
      dispatch(setLanguage(lan));
    },
    setWelcomeNextRoute: (nextRoute) => {
      dispatch(setWelcomeNextRoute(nextRoute))
    },
    hideNewExtensionWarning: () => {
      dispatch(hideNewExtensionWarning());
    },
  };
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Welcome)
);
