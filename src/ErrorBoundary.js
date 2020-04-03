import React, { Component } from 'react';

class ErrorBoundary extends Component {
	constructor(props) {
		super(props);
		this.state = { isError: false };
	}
	componentDidCatch(error, errorInfo) {
		console.log(`ERROR: ${error}, ERRORINFO: ${errorInfo}`);
		// You can also log the error to an error reporting service
		// logErrorToMyService(error, errorInfo);
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		return { isError: true };
	}
	render() {
		if (this.state.isError) {
			return <div className="ErrorBoundary">Sorry, an error occured!</div>;
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
