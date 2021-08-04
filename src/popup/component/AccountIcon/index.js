import jazzicon from '@metamask/jazzicon'
import React, { createRef, PureComponent } from 'react'

export default class AccountIcon extends PureComponent {
    iconContainer = createRef()
    componentDidMount() {
        this.appendJazzicon()
    }
    appendJazzicon() {
        const { address, diameter } = this.props
        const image = this.generateIdenticonSvg(address, diameter)
        this.iconContainer.current.appendChild(image)
    }
    generateIdenticonSvg = (address, diameter) => {
        const numericRepresentation = this.addressToNumber(address)
        const identicon = jazzicon(diameter, numericRepresentation)
        return identicon
    }
    str2hex = (str) => {
        if (str === "") {
            return "";
        }
        var arr = [];
        arr.push("0x");
        for (var i = 0; i < str.length; i++) {
            arr.push(str.charCodeAt(i).toString(16));
        }
        return arr.join('');
    }
    addressToNumber = (address) => {
        const addr = address.slice(7, 16)
        const seed = parseInt(this.str2hex(addr), 16)
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