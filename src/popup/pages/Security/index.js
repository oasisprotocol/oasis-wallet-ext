import React from "react";
import { connect } from "react-redux";
import { SEC_SHOW_MNEMONIC } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import CustomList from "../../component/CustomList";
import CustomView from "../../component/CustomView";
import "./index.scss";
class Security extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.settingList = [{
      name: getLanguage('restoreSeed'),
      route: "/reveal_seed_page",
    },
    {
      name: getLanguage('changePassword'),
      route: "/reset_password",
    }
    ]
  }
  onClickItem = (e) => {
    this.props.history.push({
      pathname: e.route,
      params: {
        ...e
      }
    })
  }

  renderMainItem = () => {
    return (<CustomList list={this.settingList} history={this.props.history} />)
  }
  render() {
    return (<CustomView
      title={getLanguage('security')}
      history={this.props.history}>
      <div className={"security-page-container"}>
        {this.renderMainItem()}
      </div>
    </CustomView>)
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Security);
