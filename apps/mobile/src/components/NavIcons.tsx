import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

export const HomeIcon: React.FC<IconProps> = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={2.2} />
    <Line x1="16.5" y1="16.5" x2="21.5" y2="21.5" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
  </Svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth={2} />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={1.8} />
  </Svg>
);

export const WalletIcon: React.FC<IconProps> = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth={2} />
    <Line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth={1.8} />
    <Circle cx="17" cy="14.5" r="1.2" fill={color} />
  </Svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21V19C19 16.7909 17.2091 15 15 15H9C6.79086 15 5 16.7909 5 19V21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
  </Svg>
);
