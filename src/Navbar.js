import React, { Component } from 'react';
import './Navbar.css';

class Navbar extends Component {
	render() {
		return (
			<div className="Navbar">
				<div className="logo">Logo</div>
				<a className="authorize-link" href={this.props.authorizeURL}>
					<button>authorize</button>
				</a>
			</div>
		);
	}
}

export default Navbar;
