import React, { Component } from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import PersonIcon from '@material-ui/icons/Person';

import './Navbar.css';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = { isDropdown: false };
		this.handleClick = this.handleClick.bind(this);
	}
	handleClick() {
		// this.setState((currSt) => ({ isDropdown: !currSt.isDropdown }));
	}
	render() {
		return (
			<div className="Navbar">
				{this.props.username && (
					<div onClick={this.handleClick} className="account-widget">
						<PersonIcon className="userIcon" />
						<span>{this.props.username}</span>
						{/* {this.state.isDropdown ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
						{this.state.isDropdown && (
							<div className="dropdown-menu">
								<div className="dropdown-item">dropdown item</div>
							</div>
						)} */}
					</div>
				)}
			</div>
		);
	}
}

export default Navbar;
