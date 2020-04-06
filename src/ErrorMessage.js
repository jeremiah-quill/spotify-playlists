import React from 'react';
import './ErrorMessage.css';

function ErrorMessage(props) {
	return (
		<div className="ErrorMessage">
			<div>{props.message}</div>
		</div>
	);
}

export default ErrorMessage;
