const CHANGE_HOME_PAGE_INDEX = "CHANGE_HOME_PAGE_INDEX"
const CHANGE_COIN_DETAIL_TAB_INDEX = "CHANGE_COIN_DETAIL_TAB_INDEX"


/**
 * Update the index of the commissioned page
 */
 const UPDATE_STAKE_ROUTE_INDEX = "UPDATE_STAKE_ROUTE_INDEX"

export function updateHomeIndex(index) {
  return {
    type: CHANGE_HOME_PAGE_INDEX,
    index
  };
}

export function updateCoinDetailIndex(index) {
  return {
    type: CHANGE_COIN_DETAIL_TAB_INDEX,
    index
  };
}


/**
 * Update staking page routing
 * @param {*} index
 * @returns
 */
export function updateStakeRouteIndex(index) {
  return {
    type: UPDATE_STAKE_ROUTE_INDEX,
    index
  };
}

const initState = {
  homePageRouteIndex: 0,
  coin_detail_index: 0
};

const tabRouteConfig = (state = initState, action) => {
  switch (action.type) {
    case CHANGE_HOME_PAGE_INDEX:
      return {
        ...state,
        homePageRouteIndex: action.index,
      };
    case UPDATE_STAKE_ROUTE_INDEX:
      let index = action.index || 0
      return {
        ...state,
        stakeRouteIndex: index
      };
    case CHANGE_COIN_DETAIL_TAB_INDEX:
      return {
        ...state,
        coin_detail_index: action.index,
      };
    default:
      return state;
  }
};

export default tabRouteConfig;
