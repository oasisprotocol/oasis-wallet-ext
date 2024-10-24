import './background/index'
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import extension from './mockWebextension';
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { network_config } from "../config";
import { getLocal, saveLocal } from "./background/storage/localStorage";
import { QUERY_TAB_TYPE } from "./constant/specifyType";
import { NETWORK_CONFIG } from "./constant/storageKey";
import { DAPP_GET_CURRENT_OPEN_WINDOW, NET_CONFIG_TYPE_MAIN, NET_CONFIG_TYPE_TEST, WALLET_GET_CURRENT_ACCOUNT } from "./constant/types";
import "./i18n";
import App from "./popup/App";
import rootReducer from "./reducers";
import { updateCurrentAccount } from "./reducers/accountReducer";
import { updateCurrentActiveTab, updateDAppOpenWindow } from "./reducers/cache";
import { ENTRY_WHICH_ROUTE, updateEntryWhichRoute } from "./reducers/entryRouteReducer";
import { updateNetConfigList } from "./reducers/network";
import { getActiveTab, sendMsg } from "./utils/commonMsg";
import { getOriginFromUrl } from "./utils/utils";

/**
 * Initialize network parameters
 * @param {*} store
 */
function getLocalNetConfig(store) {
  let localNetConfig = getLocal(NETWORK_CONFIG)
  let config
  if (!localNetConfig) {
    let testNetData = {}
    let mainNetData = {}
    let list = []
    let currentList = []

    for (let index = 0; index < network_config.length; index++) {
      let netConfig = network_config[index];
      netConfig.isSelect = false
      list.push(netConfig)
      if (!mainNetData.url && netConfig.netType == NET_CONFIG_TYPE_MAIN) {
        mainNetData = netConfig
        currentList.push(mainNetData)
      }
      if (!testNetData.url && netConfig.netType == NET_CONFIG_TYPE_TEST) {
        testNetData = netConfig
        currentList.push(testNetData)
      }
    }


    currentList[0].isSelect = true

    config = {
      totalNetList: list,
      currentNetList: currentList
    }
    store.dispatch(updateNetConfigList(config))
    saveLocal(NETWORK_CONFIG, JSON.stringify(config))
  } else {
    store.dispatch(updateNetConfigList(JSON.parse(localNetConfig)))
  }
}
async function getLocalStatus(store) {
  sendMsg({
    action: WALLET_GET_CURRENT_ACCOUNT,
  },
    async (currentAccount) => {
      if (currentAccount && currentAccount.localAccount && currentAccount.localAccount.keyringData) {
        if (currentAccount.isUnlocked) {
          store.dispatch(updateCurrentAccount(currentAccount))
          store.dispatch(updateEntryWhichRoute(ENTRY_WHICH_ROUTE.HOME_PAGE))
        } else {
          store.dispatch(updateEntryWhichRoute(ENTRY_WHICH_ROUTE.LOCK_PAGE))
        }
      } else {
        store.dispatch(updateEntryWhichRoute(ENTRY_WHICH_ROUTE.WELCOME))
      }
    })
}

async function appOpenListener(store){
  let tabs = await getActiveTab(QUERY_TAB_TYPE.GET_CURRENT_ACTIVE_TAB)
  if(tabs.length>0){
    let tab = tabs[0]
   if(tab.url){
    let webOrigin =  getOriginFromUrl(tab.url)
    store.dispatch(updateCurrentActiveTab(webOrigin))
   }
  }
}


export const applicationEntry = {
  async run() {
    if (window.location.hash !== '#/ledger_connect') {
      window.history.pushState(null, '', '#/')
    }
    this.createReduxStore();
    this.appInit(this.reduxStore)
    this.render();
  },

  async appInit(store) {
    appOpenListener(store)
    await getLocalStatus(store)
    getLocalNetConfig(store)
  },
  createReduxStore() {
    this.reduxStore = configureStore({
      reducer: rootReducer,
      middleware: [...getDefaultMiddleware(),
      ],
    });
  },
  render() {
    ReactDOM.render(
      <React.StrictMode>
        <Provider store={this.reduxStore}>
          <App />
        </Provider>
      </React.StrictMode>,
      document.getElementById("root")
    );
  },
};

applicationEntry.run();
