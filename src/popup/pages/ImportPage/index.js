import React from "react";
import { connect } from "react-redux";
import { ACCOUNT_NAME_FROM_TYPE } from "../../../constant/walletType";
import { getLanguage } from "../../../i18n";
import { updateAccoutType } from "../../../reducers/cache";
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
      name: getLanguage('privateKey'),
      callback: this.importPrivateKey,
    },
    {
      name: getLanguage('observeAccount'),
      callback: this.importObserve,
    }
    ]
  }
  importPrivateKey = () => {
    this.props.updateAccoutType(ACCOUNT_NAME_FROM_TYPE.OUTSIDE)
    this.props.history.push({
      pathname: "/account_name",
    });
  }
  importObserve = () => {
    this.props.updateAccoutType(ACCOUNT_NAME_FROM_TYPE.OBSERVE)
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
        title={getLanguage('importAccont')}
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
    updateAccoutType: (type) => {
      dispatch(updateAccoutType(type));
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ImportPage);
