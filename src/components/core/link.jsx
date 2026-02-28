import React from "react";

import { Link } from "react-router-dom";

export const RouterLink = React.forwardRef(function RouterLink({ href, ...other }, ref) {
	return <Link ref={ref} to={href} {...other} />;
});
