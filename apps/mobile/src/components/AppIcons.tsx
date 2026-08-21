import React from 'react';
import Svg, { Path, Rect, Circle, Line, Polyline, Polygon } from 'react-native-svg';

export interface IconProps {
  color?: string;
  size?: number;
  strokeWidth?: number;
}

export const MapPinIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const StarIcon: React.FC<IconProps & { fill?: string }> = ({
  color = '#FACC15',
  fill = '#FACC15',
  size = 12,
  strokeWidth = 1.5,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ClockIcon: React.FC<IconProps> = ({ color = '#fc1c46', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Polyline points="12 6 12 12 16 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth - 0.4} />
  </Svg>
);

export const UsersIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const RepeatIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="17 1 21 5 17 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 11V9C3 7.93913 3.42143 6.92172 4.17157 6.17157C4.92172 5.42143 5.93913 5 7 5H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Polyline points="7 23 3 19 7 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 13V15C21 16.0609 20.5786 17.0783 19.8284 17.8284C19.0783 18.5786 18.0609 19 17 19H3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ZapIcon: React.FC<IconProps> = ({ color = '#fc1c46', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={color === '#fc1c46' ? 'rgba(252,28,70,0.15)' : 'none'} />
  </Svg>
);

export const PadelIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 16, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="9" r="6.5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="15.5" x2="12" y2="22" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Circle cx="10" cy="8" r="0.75" fill={color} />
    <Circle cx="14" cy="8" r="0.75" fill={color} />
    <Circle cx="12" cy="10.5" r="0.75" fill={color} />
  </Svg>
);

export const FootballIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 16, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} />
    <Polygon points="12 7.5 15.5 10 14 14.5 10 14.5 8.5 10 12 7.5" stroke={color} strokeWidth={strokeWidth - 0.5} />
    <Line x1="12" y1="3" x2="12" y2="7.5" stroke={color} strokeWidth={strokeWidth - 0.5} />
    <Line x1="20.5" y1="9.5" x2="15.5" y2="10" stroke={color} strokeWidth={strokeWidth - 0.5} />
    <Line x1="18" y1="18.5" x2="14" y2="14.5" stroke={color} strokeWidth={strokeWidth - 0.5} />
    <Line x1="6" y1="18.5" x2="10" y2="14.5" stroke={color} strokeWidth={strokeWidth - 0.5} />
    <Line x1="3.5" y1="9.5" x2="8.5" y2="10" stroke={color} strokeWidth={strokeWidth - 0.5} />
  </Svg>
);

export const TennisIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 16, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8.5" r="6" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="14.5" x2="12" y2="22" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Line x1="9" y1="8.5" x2="15" y2="8.5" stroke={color} strokeWidth={strokeWidth - 0.8} />
    <Line x1="12" y1="5.5" x2="12" y2="11.5" stroke={color} strokeWidth={strokeWidth - 0.8} />
  </Svg>
);

export const PickleballIcon: React.FC<IconProps> = ({ color = '#ffffff', size = 16, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="6.5" y="3" width="11" height="12" rx="4" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="15" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth + 0.5} strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1.2" fill={color} />
  </Svg>
);

export const RoofIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 13, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10L12 3L21 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="4" y="10" width="16" height="10" rx="1" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const ParkingIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 13, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M9 17V7H13.5C14.8807 7 16 8.11929 16 9.5C16 10.8807 14.8807 12 13.5 12H9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CoffeeIcon: React.FC<IconProps> = ({ color = '#94a3b8', size = 13, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8H19C20.1046 8 21 8.89543 21 10V10C21 11.1046 20.1046 12 19 12H18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M3 8H18V14C18 16.7614 15.7614 19 13 19H8C5.23858 19 3 16.7614 3 14V8Z" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="6" y1="2" x2="6" y2="5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="10" y1="2" x2="10" y2="5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="14" y1="2" x2="14" y2="5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ color = '#fc1c46', size = 14, strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline points="9 12 11 14 15 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
