import React from "react";
import { connect } from "react-redux";
import select_account_ok from "../../../assets/images/select_account_ok.png";
import { changeLanguage, getLanguage, languageOption, LANG_SUPPORT_LIST } from "../../../i18n";
import { setLanguage } from "../../../reducers/appReducer";
import CustomView from "../../component/CustomView";
import "./index.scss";

class LanguageManagementPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: LANG_SUPPORT_LIST.ZH_CN
    };
    this.language = languageOption
  }

  changeLangOption = (item) => {
    if (item.key !== this.props.language) {
      changeLanguage(item.key);
      this.props.setLanguage(item.key);
    }
  }
  renderOptionItem = (item, index) => {
    let showSelect = this.props.language === item.key
    return (
      <div key={index + ""} onClick={() => this.changeLangOption(item)} className={"lang-option-item click-cursor"}>
          <p className={"security-content-title"}>{item.value}</p>
          {showSelect && <img className={'lang-option-img'} src={select_account_ok} />}
      </div>
    )
  }
  renderLangOption = () => {
    return this.language.map((item, index) => {
      return this.renderOptionItem(item,index)
    })
  }

  render() {
    return (
      <CustomView
        title={getLanguage("language")}
        history={this.props.history}>
        <div className="lang-out-container">
          {this.renderLangOption()}
        </div>
      </CustomView>)
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LanguageManagementPage);
