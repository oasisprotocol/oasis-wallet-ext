import React from "react";
import { connect } from "react-redux";
import setting_active from "../../../assets/images/setting_active.png";
import setting_common from "../../../assets/images/setting_common.png";
import staking_active from "../../../assets/images/stake_active.png";
import staking_common from "../../../assets/images/stake_common.png";
import home_active from "../../../assets/images/wallet_active.png";
import home_common from "../../../assets/images/wallet_common.png";
import paratime_active from "../../../assets/images/paratime_active.svg";
import paratime_common from "../../../assets/images/paratime_common.svg";
import { getLanguage } from "../../../i18n";
import { updateCurrentAccount } from "../../../reducers/accountReducer";

import { updateHomeIndex } from "../../../reducers/tabRouteReducer";
import Tabs from "../../component/Tabs";
import Setting from "../Setting";
import Staking from "../Staking";
import Wallet from "../Wallet";
import Paratime from "../Paratime";
import "./index.scss";



class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
  }
  onChangeRouteIndex = (index) => {
    this.props.updateHomeIndex(index)
  }

  render() {
    let { tabRoute } = this.props
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
        <Tabs currentActiveIndex={tabRoute.homePageRouteIndex} onChangeIndex={this.onChangeRouteIndex}>
          <div label={getLanguage('wallet')}
            activeSource={home_active}
            commonSource={home_common}
          >
            <Wallet params={this.props} />
          </div>
          <div label={getLanguage('staking')}
            activeSource={staking_active}
            commonSource={staking_common}
          >
            <Staking params={this.props} />
          </div>
          <div label={getLanguage('paratime')}
            activeSource={paratime_active}
            commonSource={paratime_common}>
            <Paratime params={this.props} />
          </div>
          <div
            label={getLanguage('setting')}
            activeSource={setting_active}
            commonSource={setting_common}
          >
            <Setting params={this.props} />
          </div>
        </Tabs>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  tabRoute: state.tabRouteConfig,
  currentAccount: state.accountInfo.currentAccount,
});

function mapDispatchToProps(dispatch) {
  return {
    updateHomeIndex: (index) => {
      dispatch(updateHomeIndex(index));
    },
    updateCurrentAccount: (account) => {
      dispatch(updateCurrentAccount(account))
    },

  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
