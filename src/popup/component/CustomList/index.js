import cx from "classnames";
import React, { Component } from "react";
import record_arrow from "../../../assets/images/record_arrow.png";
export default class CustomList extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    onClickItem = (item) => {
        if (item.route) {
            this.props.history.push({
                pathname: item.route,
                params: {
                    ...item
                }
            })
        }
        item.callback && item.callback()

    }
    render() {
        let { list } = this.props
        return (
            <div className={"security-item-container"}>
                {list.map((item, index) => {
                    return (<div key={index + ""}
                        onClick={() => this.onClickItem(item)}
                        className={cx("security-body-container click-cursor", {
                            "security-body-container-divided": index !== list.length - 1
                        })}>
                        <p className={"security-body-title"}>{item.name}</p>
                        <img className={'sec-arrow'} src={record_arrow} />
                    </div>)
                })}
            </div>
        );
    }
}
