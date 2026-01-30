import Svg, { Path } from "react-native-svg";

interface IconProps {
  color: string;
  size: number;
}

export function HomeIcon({ color, size }: IconProps) {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </Svg>
  );
}

export function TargetIcon({ color, size }: IconProps) {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </Svg>
  );
}

export function AppsIcon({ color, size }: IconProps) {
  return (
    <Svg fill={color} height={size} viewBox="0 0 24 24" width={size}>
      <Path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </Svg>
  );
}
