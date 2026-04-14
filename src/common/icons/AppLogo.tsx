import React from "react";

export const AppLogo = ({
	className = "",
	width = "100%",
	height = "100%",
	style,
}: {
	className?: string;
	width?: number | string;
	height?: number | string;
	style?: React.CSSProperties;
}) => {
	return (
		<svg
			className={className}
			width={width}
			height={height}
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={style}
		>
			<defs>
				<linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#1AB27A" />
					<stop offset="100%" stopColor="#076B49" />
				</linearGradient>
			</defs>

			{/* Base Rounded Rectangle */}
			<rect width="100" height="100" rx="24" fill="url(#logoGradient)" />

			{/* Mosque Icon (Masque) */}
			<path
				fill="#FFFFFF"
				d="
          M 49 27
          A 1 1 0 0 1 51 27
          V 33
          C 54 33, 65 38, 66 51
          C 69 50, 74 51, 74 59
          V 73
          H 68
          V 63
          A 4 4 0 0 0 60 63
          V 73
          H 56
          V 61
          A 6 6 0 0 0 44 61
          V 73
          H 40
          V 63
          A 4 4 0 0 0 32 63
          V 73
          H 26
          V 59
          C 26 51, 31 50, 34 51
          C 35 38, 46 33, 49 33
          Z
        "
			/>
		</svg>
	);
};
