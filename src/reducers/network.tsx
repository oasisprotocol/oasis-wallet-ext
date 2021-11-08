import { cointypes } from "../../config"
import { NET_CONFIG_TYPE_TEST } from "../constant/types"

const UPDATE_NET_CONFIG = "UPDATE_NET_CONFIG"



/**
 * Change network configuration
 * @param {*} data
 */
export function updateNetConfigList(data) {
    return {
        type: UPDATE_NET_CONFIG,
        data
    };
}

const initState = {
    netList: [],
    currentConfig:{},


    totalNetList:[],
    currentNetList:[],
    currentSymbol:"",
    currentNetType:""
};

const network = (state = initState, action) => {
    switch (action.type) {
        case UPDATE_NET_CONFIG:
            let totalNetList = action.data.totalNetList
            let currentNetList = action.data.currentNetList
            let symbol = ""
            let currentNetType = ""
            for (let index = 0; index < currentNetList.length; index++) {
                const netConfig = currentNetList[index];
                if(netConfig.isSelect){
                    symbol =netConfig.netType === NET_CONFIG_TYPE_TEST?cointypes.testNetSymbol :cointypes.symbol
                    currentNetType = netConfig.netType
                }
            }
            return {
                ...state,
                currentSymbol:symbol,
                currentNetType:currentNetType,
                totalNetList,
                currentNetList,
            }
        default:
            return state;
    }
};

export default network;
