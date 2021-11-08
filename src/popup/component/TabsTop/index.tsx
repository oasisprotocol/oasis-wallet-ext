import cx from "classnames";
import React from "react";
import "./index.scss";
export default class TabsTop extends React.Component {
  constructor(props) {
    super(props);
    let index = props.currentActiveIndex || 0
    this.state = {
      currentIndex: index,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.currentActiveIndex !== this.props.currentActiveIndex) {
      this.setState({
        currentIndex: nextProps.currentActiveIndex
      })
    }
  }
  detailClickHandler(index) {
    let { onChangeIndex } = this.props
    onChangeIndex(index)
  }
  check_title_index = (index) => {
    return this.state.currentIndex === index ? "tab_title_top home-active_top click-cursor" : "tab_title_top home-inactive_top click-cursor";
  };
  check_item_index = (index) => {
    return this.state.currentIndex === index ? "show_top" : "hide_top";
  };
  render() {
    return (
      <div className="tab_container_top">
        <ul className="tab_title_wrap_top">
          {React.Children.map(this.props.children, (ele, index) => {
            return (
              <li
                key={index + ""}
                className={this.check_title_index(index)}
                onClick={this.detailClickHandler.bind(this, index)}
              >
                {ele.props.label}
                <div className={
                  cx("tab-top-lab-indictor", {
                    "tab-top-lab-indictor-active": this.state.currentIndex === index
                  })
                } />
              </li>
            );
          })}
        </ul>

        <ul className="tab_content_wrap_top">
          {React.Children.map(this.props.children, (ele, index) => {
            let key = ele.props.label
            return (
              <li key={key} className={this.check_item_index(index)}>
                {ele.props.children}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
