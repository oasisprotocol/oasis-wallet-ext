import React from "react";
import { connect } from "react-redux";
import { ACCOUNT_NAME_FROM_TYPE, ACCOUNT_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateAccountType } from "../../../reducers/cache";
import CustomList from "../../component/CustomList";
import CustomView from "../../component/CustomView";
import "./index.scss";

class ImportPage extends React.Component {
  constructor(props) {
    super(props);
    const title = props.location.params?.title ?? ""
    const content = props.location.params?.content ?? ""
    this.state = {
      title,
      content
    };
    this.routeList=[{
      name: getLanguage('importOasisKey'),
      callback: this.importPrivateKey,
    },
    {
      name: getLanguage('importOEvmKey'),
      callback: ()=>this.importPrivateKey(ACCOUNT_TYPE.WALLET_OUTSIDE_SECP256K1),
    },
    {
      name: getLanguage('observeAccount'),
      callback: this.importObserve,
    }
    ]
  }
  importPrivateKey = (type) => {
    this.props.updateAccountType(ACCOUNT_NAME_FROM_TYPE.OUTSIDE,type)
    this.props.history.push({
      pathname: "/account_name",
    });
  }
  importObserve = () => {
    this.props.updateAccountType(ACCOUNT_NAME_FROM_TYPE.OBSERVE)
    this.props.history.push({
      pathname: "/account_name",
    });
  }
  renderImportOption = () => {
    return (<CustomList list={this.routeList} history={this.props.history} />)
  }
  render() {
    return (
      <CustomView
        title={getLanguage('importAccount')}
        history={this.props.history}>
        <div className={"security-page-container"}>
          {this.renderImportOption()}
        </div>
      </CustomView>)
  }
}

const mapStateToProps = (state) => ({});

function mapDispatchToProps(dispatch) {
  return {
    updateAccountType: (fromType,accountType) => {
      dispatch(updateAccountType(fromType,accountType));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportPage);
