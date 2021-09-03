/**
 * Update the entry interface
 */
export const ENTRY_WHICH_ROUTE = {
  HOME_PAGE: 'ENTRY_WHICH_ROUTE_HOME_PAGE',
  WELCOME: 'ENTRY_WHICH_ROUTE_WELCOME',
  LOCK_PAGE: 'ENTRY_WHICH_LOCK_PAGE',
  UPDATE_ENTRY_WHICH_ROUTE: "UPDATE_ENTRY_WHICH_ROUTE",


  DAPP_APPROVE_PAGE: 'DAPP_APPROVE_PAGE',
  DAPP_SIGN_PAGE: 'DAPP_SIGN_PAGE',
};



export function updateEntryWhichRoute(entryWhichRoute) {
  return {
    type: ENTRY_WHICH_ROUTE.UPDATE_ENTRY_WHICH_ROUTE,
    entryWhichRoute
  };
}

const initState = {
  entryWhichRoute: ""
};


const entryRouteReducer = (state = initState, action) => {
  switch (action.type) {
    case ENTRY_WHICH_ROUTE.UPDATE_ENTRY_WHICH_ROUTE:
      return {
        entryWhichRoute: action.entryWhichRoute,
      };
    default:
      return state;
  }
};

export default entryRouteReducer;
