import jazzicon from '@metamask/jazzicon'
import * as oasis from '@oasisprotocol/client'
import React, { createRef, PureComponent } from 'react'

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
        const numericRepresentation = this.addressToNumber(address)
        const jazzicon = jazzicon(diameter, numericRepresentation)
        return jazzicon
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
