import React from 'react'

/**
 * Disable Google Translate on child element
 * https://cloud.google.com/translate/troubleshooting
 *
 * Main usage is to display generated mnemonic without modifications, and
 * without sending it to Google servers.
 *
 * @param { { children: React.ReactNode } } props
 */
export default function NoTranslate(props) {
  return (
    <span className="notranslate" translate="no">
      {props.children}
    </span>
  )
}
