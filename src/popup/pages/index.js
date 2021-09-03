import extension from 'extensionizer';
import React from 'react';
import { connect } from 'react-redux';
import { DAPP_CLOSE_POPUP_WINDOW, FROM_BACK_TO_RECORD, SET_LOCK } from '../../constant/types';
import { languageInit } from '../../i18n';
import { setLanguage } from '../../reducers/appReducer';
import { ENTRY_WHICH_ROUTE, updateEntryWhichRoute } from '../../reducers/entryRouteReducer';
import { updateNetConfigList } from '../../reducers/network';
import LockPage from './Lock';
import HomePage from './Main';
import Welcome from './Welcome';
import ApprovePage from './ApprovePage';
import SignTransaction from './SignTransaction';

class MainRouter extends React.Component {

  async componentDidMount() {
    let lan = languageInit()
    this.props.setLanguage(lan)
    this.startListener()
  }
  startListener = () => {
    extension.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      const { type, action } = message;
      if (type === FROM_BACK_TO_RECORD) {
        switch (action) {
          case SET_LOCK:
            this.props.updateEntryWhichRoute(ENTRY_WHICH_ROUTE.LOCK_PAGE)
            this.props.history.push({
              pathname: "/",
            });
            sendResponse();
            break;
          case DAPP_CLOSE_POPUP_WINDOW:
            if(this.props.entryWhichRoute === ENTRY_WHICH_ROUTE.DAPP_APPROVE_PAGE
              || this.props.entryWhichRoute === ENTRY_WHICH_ROUTE.DAPP_SIGN_PAGE){
                this.props.updateEntryWhichRoute(ENTRY_WHICH_ROUTE.HOME_PAGE)
                this.props.history.push({
                  pathname: "/",
                });
                sendResponse();
              }
              break;
          default:
            break;
        }
      }
      return true;
    });
  }
  render() {
    switch (this.props.entryWhichRoute) {
      case ENTRY_WHICH_ROUTE.WELCOME:
        return <Welcome history={this.props.history} />;
      case ENTRY_WHICH_ROUTE.HOME_PAGE:
        return <HomePage history={this.props.history} />;
      case ENTRY_WHICH_ROUTE.LOCK_PAGE:
        return <LockPage history={this.props.history} />;
      case ENTRY_WHICH_ROUTE.DAPP_APPROVE_PAGE:
        return <ApprovePage history={this.props.history} />;
      case ENTRY_WHICH_ROUTE.DAPP_SIGN_PAGE:
        return <SignTransaction history={this.props.history} />;
      default:
        return <></>
    }
  }
}

const mapStateToProps = (state) => ({
  entryWhichRoute: state.entryRouteReducer.entryWhichRoute,
});

function mapDispatchToProps(dispatch) {
  return {
    updateEntryWhichRoute: (index) => {
      dispatch(updateEntryWhichRoute(index));
    },
    updateNetConfigList: (config) => {
      dispatch(updateNetConfigList(config))
    },
    setLanguage: (lan) => {
      dispatch(setLanguage(lan));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MainRouter);
