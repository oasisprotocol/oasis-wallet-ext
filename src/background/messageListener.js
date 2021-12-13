import {
  WALLET_APP_SUBMIT_PWD,
  WALLET_GET_CURRENT_ACCOUNT,
  WALLET_NEW_HD_ACCOUNT,
  WALLET_CREATE_PWD,
  WALLET_SET_UNLOCKED_STATUS,
  WALLET_GET_ALL_ACCOUNT,
  WALLET_CREATE_HD_ACCOUNT,
  WALLET_IMPORT_HD_ACCOUNT,
  WALLET_CHANGE_CURRENT_ACCOUNT,
  WALLET_CHANGE_ACCOUNT_NAME,
  WALLET_CHANGE_DELETE_ACCOUNT,
  WALLET_CHECKOUT_PASSWORD,
  WALLET_GET_MNE,
  WALLET_GET_PRIVATE_KEY,
  WALLET_CHANGE_SEC_PASSWORD,
  WALLET_SEND_TRANSACTION,
  WALLET_SEND_STAKE_TRANSACTION,
  WALLET_CHECK_TX_STATUS,
  WALLET_IMPORT_LEDGER,
  WALLET_GET_CREATE_MNEMONIC,
  WALLET_SEND_RECLAIM_TRANSACTION,
  WALLET_IMPORT_OBSERVE_ACCOUNT,
  WALLET_RESET_LAST_ACTIVE_TIME,
  WALLET_OPEN_ROUTE_IN_PERSISTENT_POPUP,
  GET_SIGN_PARAMS,
  DAPP_GET_APPROVE_ACCOUNT,
  DAPP_GET_CONNECT_STATUS,
  DAPP_DISCONNECT_SITE,
  DAPP_GET_ALL_APPROVE_ACCOUNT,
  DAPP_ACCOUNT_CONNECT_SITE,
  DAPP_DELETE_ACCOUNT_CONNECT_HIS,
  DAPP_CHANGE_CONNECTING_ADDRESS, DAPP_GET_CURRENT_OPEN_WINDOW, GET_APP_LOCK_STATUS,
  FRAME_GET_APPROVE_ACCOUNT, FRAME_GET_ACCOUNT_PUBLIC_KEY, FRAME_GET_ACCOUNT_SIGNER, FRAME_SEND_TRANSFER, RESET_WALLET, WALLET_SEND_RUNTIME_WITHDRAW, WALLET_SEND_RUNTIME_DEPOSIT, WALLET_SEND_RUNTIME_EVM_WITHDRAW
} from "../constant/types";
import extension from 'extensionizer'
import apiService from "./service/APIService";
import extDappService from "./service/ExtDappService";
import { openPopupWindow } from '../utils/popup';

function internalMessageListener(message, sender, sendResponse) {
  const { messageSource, action, payload } = message;
  if (messageSource) {
    return false
  }
  switch (action) {
    case WALLET_CREATE_PWD:
      sendResponse(apiService.createPwd(payload.pwd));
      break;
    case WALLET_NEW_HD_ACCOUNT:
      apiService.createAccount(payload.mne).then(res => {
        sendResponse(res);
      })
      break
    case WALLET_GET_CURRENT_ACCOUNT:
      apiService.getCurrentAccount().then(account => {
        sendResponse(account);
      })
      break;
    case WALLET_SET_UNLOCKED_STATUS:
      sendResponse(apiService.setUnlockedStatus(payload));
      break;
    case WALLET_APP_SUBMIT_PWD:
      apiService.submitPassword(payload).then((res, err) => {
        sendResponse(res);
      })
      break;
    case WALLET_GET_ALL_ACCOUNT:
      sendResponse(apiService.getAllAccount(payload));
      break;
    case WALLET_CREATE_HD_ACCOUNT:
      apiService.addHDNewAccount(payload.accountName).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_IMPORT_HD_ACCOUNT:
      apiService.addImportAccount(payload.privateKey, payload.accountName,payload.accountType).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_CHANGE_CURRENT_ACCOUNT:
      apiService.setCurrentAccount(payload).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_CHANGE_ACCOUNT_NAME:
      apiService.changeAccountName(payload.address, payload.accountName).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_CHANGE_DELETE_ACCOUNT:
      apiService.deleteAccount(payload.address, payload.password).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_CHECKOUT_PASSWORD:
      sendResponse(apiService.checkPassword(payload.password))
      break;
    case WALLET_GET_MNE:
      apiService.getMnemonic(payload.password).then((mne) => {
        sendResponse(mne);
      })
      break;
    case WALLET_GET_PRIVATE_KEY:
      apiService.getPrivateKey(payload.address, payload.password).then((privateKey) => {
        sendResponse(privateKey);
      })
      break;
    case WALLET_CHANGE_SEC_PASSWORD:
      apiService.updateSecPassword(payload.oldPassword, payload.password).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_SEND_TRANSACTION:
      apiService.sendTransaction(payload).then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse(err);
      })
      break;
    case WALLET_SEND_STAKE_TRANSACTION:
      apiService.delegateTransaction(payload).then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse(err);
      })
      break;
    case WALLET_SEND_RECLAIM_TRANSACTION:
      apiService.undelegateTransaction(payload).then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse(err);
      })
      break;
    case WALLET_SEND_RUNTIME_WITHDRAW:
      apiService.setWithdrawToConsensusAccount(payload).then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse(err);
      })
      break;
    case WALLET_SEND_RUNTIME_EVM_WITHDRAW:
      apiService.setEvmWithdrawToConsensusAccount(payload).then((result) => {
        sendResponse(result);
      }).catch((err) => {
        sendResponse(err);
      })
      break
    case WALLET_SEND_RUNTIME_DEPOSIT:
      apiService.setAllowanceAndDepositToParatimeAccount(payload).then((result) => {
        sendResponse(result);
      }).catch((error) => {
        sendResponse(error);
      })
      break;
    case WALLET_CHECK_TX_STATUS:
      sendResponse(apiService.checkTxStatus(payload.hash));
      break;
    case WALLET_IMPORT_LEDGER:
      apiService.addLedgerAccount(payload.addressList, payload.accountName).then((account) => {
        sendResponse(account);
      })
      break;
    case WALLET_GET_CREATE_MNEMONIC:
      sendResponse(apiService.getCreateMnemonic(payload))
      break
    case WALLET_IMPORT_OBSERVE_ACCOUNT:
      apiService.addObserveAccount(payload.address, payload.accountName).then((account) => {
        sendResponse(account);
      })
      break
    case WALLET_RESET_LAST_ACTIVE_TIME:
      sendResponse(apiService.setLastActiveTime())
      break
    case WALLET_OPEN_ROUTE_IN_PERSISTENT_POPUP:
      openPopupWindow(extension.extension.getURL(payload.route), 'persistentPopup', undefined, {
        left: payload.left,
        top: payload.top,
      }).then((result) => {
        sendResponse(result);
      });
      break
    case GET_APP_LOCK_STATUS:
      sendResponse(apiService.getLockStatus())
      break
    case FRAME_GET_APPROVE_ACCOUNT:
      extDappService.requestAccounts(payload.origin).then((account) => {
        sendResponse(account);
      }).catch((err)=>{
        sendResponse(err)
      })
        break

    case FRAME_GET_ACCOUNT_PUBLIC_KEY:
        extDappService.getApproveAccountPublicKey(payload.origin).then((account) => {
          sendResponse(account);
        }).catch((err)=>{
          sendResponse(err)
        })
          break

    case FRAME_GET_ACCOUNT_SIGNER:
        extDappService.getApproveAccountSigner(payload).then((account) => {
          sendResponse(account);
        }).catch((err)=>sendResponse(err))
          break
    case FRAME_SEND_TRANSFER:
        extDappService.signTransaction(payload.params,payload.origin).then((account) => {
          sendResponse(account);
        }).catch((err)=>sendResponse(err))
        break
    case GET_SIGN_PARAMS:
      sendResponse(extDappService.getSignParams())
      break
    case DAPP_GET_APPROVE_ACCOUNT:
      extDappService.getCurrentApproveAccount(payload.siteUrl,payload.address).then((account)=>{
        sendResponse(account)
      })
      break
    case DAPP_GET_ALL_APPROVE_ACCOUNT:
      sendResponse(extDappService.getAllApproveAccount(payload.siteUrl))
      break
    case DAPP_GET_CONNECT_STATUS:
      sendResponse(extDappService.getConnectedStatus(payload.siteUrl,payload.address))
      break
    case DAPP_DISCONNECT_SITE:
      sendResponse(extDappService.disconnectDapp(payload.siteUrl,payload.address,payload.currentAddress))
      break

    case DAPP_ACCOUNT_CONNECT_SITE:
      sendResponse(extDappService.setDAppCurrentConnect(payload.siteUrl,payload.account))
      break
    case DAPP_DELETE_ACCOUNT_CONNECT_HIS:
      sendResponse(extDappService.deleteDAppConnect(payload.address,payload.currentAddress))
      break
    case DAPP_CHANGE_CONNECTING_ADDRESS:
      sendResponse(extDappService.changeCurrentConnecting(payload.address))
      break
    case DAPP_GET_CURRENT_OPEN_WINDOW:
      sendResponse(extDappService.getCurrentOpenWindow())
      break
    case RESET_WALLET:
      sendResponse(apiService.resetWallet())
      break
    default:
      break;
  }
  return true
}

export function setupMessageListeners() {
  extension.runtime.onMessage.addListener(internalMessageListener);
}
