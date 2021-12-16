import jazzicon from '@metamask/jazzicon'
import * as oasis from '@oasisprotocol/client'
import React, { createRef, PureComponent } from 'react'
import { isEvmAddress } from '../../../utils/utils'

export default class AccountIcon extends PureComponent {
    iconContainer = createRef()
    componentDidMount() {
        this.appendJazzicon()
    }
    appendJazzicon() {
        const { address, diameter } = this.props
        const image = this.generateJazziconSvg(address, diameter)
        this.iconContainer.current.appendChild(image)
    }
    generateJazziconSvg = (address, diameter) => {
        const numericRepresentation = isEvmAddress(address) ? this.jsNumberForAddress(address):this.addressToNumber(address)
        return jazzicon(diameter, numericRepresentation)
    }
    // Compatible with https://github.com/MetaMask/metamask-extension/blob/v10.7.0/ui/helpers/utils/icon-factory.js#L84-L88
    jsNumberForAddress(address) {
        const addr = address.slice(2, 10);
        const seed = parseInt(addr, 16);
        return seed;
    }
    addressToNumber = (address) => {
        const addressU8 = oasis.staking.addressFromBech32(address)
        // Use bytes from the end for a seed.
        // jazzicon internally uses mersenne-twister, which accepts a 32-bit seed.
        const seed =
            addressU8[20] |
            addressU8[19] << 8 |
            addressU8[18] << 16 |
            addressU8[17] << 24
        return seed
    }

    render() {
        const { className } = this.props
        return (
            <div
                className={className}
                ref={this.iconContainer}
            />
        )
    }
}
