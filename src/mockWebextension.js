const extension = {
    runtime: {
        /**
         * @param {{ action: string, payload?: any, type?: any }} message 
         * @param {(response: any) => void} [callback]
         */
        sendMessage(message, callback = () => {}) {
            const event = new CustomEvent('extensionMessage', { detail: {message, sendResponse: callback} });
            document.body.dispatchEvent(event);
        },
        onMessage: {
            /**
             * @param {(message: {action: string, payload?: any, type?: any}, sender: undefined, sendResponse: (response?: any) => void) => void} callback 
             */
            addListener(callback) {
                document.body.addEventListener("extensionMessage", (e) => {
                    callback(e.detail.message, undefined, e.detail.sendResponse)
                }, false);
            }
        }
    },
}

extension.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'getAA') {
        sendResponse('response ' + message.payload)
    }
})
extension.runtime.sendMessage({ action: 'getAA', payload: 'body' }, (response) => {
    console.log(response) // expect 'response body'
})

export default extension