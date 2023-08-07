import Transport from "@ledgerhq/hw-transport-webusb";
import OasisApp from '@oasisprotocol/ledger';
import extension from 'extensionizer';

import { LEDGER_CONNECTED_SUCCESSFULLY } from "../constant/types";
import { getLanguage } from "../i18n";
import Loading from "../popup/component/Loading";
import Toast from "../popup/component/Toast";
import { publicKeyToAddress, uint2hex } from "./utils";
import { openTab } from './commonMsg';

function initLedgerWindowListener() {
  return new Promise((resolve) => {
    async function onMessage(message, sender, sendResponse) {
      const { action } = message
      switch (action) {
        case LEDGER_CONNECTED_SUCCESSFULLY:
          extension.runtime.onMessage.removeListener(onMessage)
          resolve(undefined)
          sendResponse && sendResponse()
          break
      }
    }
    extension.runtime.onMessage.addListener(onMessage)
  })
}
async function openLedgerWindow() {
  // Using tabs because Chrome no longer shows permissions dialog in popups
  // Mentioned in https://bugs.chromium.org/p/chromium/issues/detail?id=1415183#c14
  // Maybe related to https://bugs.chromium.org/p/chromium/issues/detail?id=1360960
  openTab('./popup.html#/ledger_connect')
  await initLedgerWindowListener()
  Toast.info(getLanguage('ledgerConnectSuccess'))
  return { connected: true }
}
export async function getPort() {
  try {
    const transport = await Transport.create()
    return transport;
  } catch (error) {
    return null
  }
}
let appInstance = null;
let portInstance = null;

export async function getApp() {
  let app = null
  if (!appInstance) {
    const transport = await getPort()
    if (transport) {
      app = new OasisApp(transport)
      portInstance = transport
      appInstance = app
    } else {
      await openLedgerWindow()
      return { manualConnected: true, app: null }
    }
  } else {
    app = appInstance
  }
  let timer = null
  const result = await Promise.race([
    app.appInfo(),
    new Promise((resolve) => {
      timer = setTimeout(() => {
        timer = null
        resolve({ timeout: true })
      }, 300)
    })
  ]);
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (result.returnCode === '5000' || !result.appName || result.timeout) {
    portInstance.close()
    portInstance = null
    appInstance = null
    await openLedgerWindow()
    return { manualConnected: true, app: null }
  }

  return { app }
}

export async function checkLedgerConnect() {
  /** @type {number | null} */
  let timer = window.setTimeout(() => {
    timer = null;
    Loading.show()
  }, 1000)
  const { app } = await getApp()
  if (timer) {
    window.clearTimeout(timer)
  } else {
    Loading.hide()
  }
  return { ledgerApp: app }
}

export async function requestAccount(app,fromIndex = 0,count = 1 ) {
  let accounts = []
  try {
    for (let i = fromIndex; i < fromIndex+count; i++) {
      const path = [44, 474, 0, 0, i]
      const publicKeyResponse = await app.publicKey(path)
      if (publicKeyResponse.return_code === 26628) {
        throw new Error('cannot_open_oasis_app')
      }
      let address = await publicKeyToAddress(publicKeyResponse.pk)
      accounts.push({
        ledgerHdIndex :i,
        path,
        publicKey: uint2hex(publicKeyResponse.pk),
        address: address.toLowerCase()
      })
    }
  } catch (e) {
    throw e
  }
  return accounts
}
