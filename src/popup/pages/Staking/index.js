import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { getLanguage } from "../../../i18n";
import { updateStakeRouteIndex } from "../../../reducers/tabRouteReducer";
import TabsTop from "../../component/TabsTop";
import "./index.scss";
import MyStaking from "./MyStaking";
import StakeNode from "./StakeNode";
class Staking extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
    this.isUnMounted = false
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
  onChangeRouteIndex = (index) => {
    this.props.updateStakeRouteIndex(index)
  }
  render() {
    return (
      <div className={"stake-page-container"}>
        <TabsTop currentActiveIndex={this.props.stakeRouteIndex} onChangeIndex={this.onChangeRouteIndex}>
          <div label={getLanguage('myStaking')}>
            <MyStaking params={this.props} />
          </div>
          <div label={getLanguage("validatorNode")}>
            <StakeNode params={this.props} />
          </div>
        </TabsTop>
      </div>
    )
  }
}



const mapStateToProps = (state) => ({
  stakeRouteIndex: state.tabRouteConfig.stakeRouteIndex
});

function mapDispatchToProps(dispatch) {
  return {
    updateStakeRouteIndex: (index) => {
      dispatch(updateStakeRouteIndex(index))
    },

  };
}
export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Staking)
);
