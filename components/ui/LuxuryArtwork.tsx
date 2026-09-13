import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from '../../constants/theme';

export function VellureMark({ size = 64, color = colors.goldDark }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size * 0.72} viewBox="0 0 100 72">
      <G fill="none" stroke={color} strokeWidth="2">
        <Path d="M50 65C49 43 38 24 19 10C18 34 27 53 50 65Z" />
        <Path d="M50 65C51 43 62 24 81 10C82 34 73 53 50 65Z" />
        <Path d="M50 65C37 54 21 50 6 53C16 68 31 71 50 65Z" />
        <Path d="M50 65C63 54 79 50 94 53C84 68 69 71 50 65Z" />
        <Path d="M50 65C40 45 42 24 50 4C58 24 60 45 50 65Z" />
      </G>
    </Svg>
  );
}

export function AbstractWaves({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <Svg style={style} width="100%" height="100%" viewBox="0 0 400 310" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="waveA" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E8D2CF" />
          <Stop offset="1" stopColor="#A77B88" />
        </LinearGradient>
        <LinearGradient id="waveB" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor="#3A1727" />
          <Stop offset="1" stopColor="#7A465C" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="310" fill="#FBF7F2" />
      <Path d="M-20 84C87 26 155 222 420 103V310H-20Z" fill="url(#waveA)" opacity="0.72" />
      <Path d="M-20 152C83 79 185 300 420 122V260C189 338 76 151-20 219Z" fill="url(#waveB)" opacity="0.86" />
      <Path d="M-20 118C104 60 168 249 420 88" fill="none" stroke="#C99958" strokeWidth="1.3" />
      <Path d="M-20 204C108 130 217 329 420 176" fill="none" stroke="#E3BC7F" strokeWidth="0.9" />
      <Ellipse cx="350" cy="52" rx="116" ry="82" fill="#F6EAE5" opacity="0.65" />
    </Svg>
  );
}

export function VenueArchArtwork({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <Svg style={style} width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="archBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F7E9E3" />
          <Stop offset="1" stopColor="#E2C8C2" />
        </LinearGradient>
      </Defs>
      <Rect width="400" height="250" fill="url(#archBg)" />
      <Circle cx="63" cy="50" r="76" fill="#FDF7F2" opacity="0.45" />
      <Circle cx="350" cy="50" r="94" fill="#C9A6A7" opacity="0.24" />
      <Path d="M92 218V112C92 54 140 24 200 24C260 24 308 54 308 112V218" fill="#F9F1EC" stroke="#C39A8D" strokeWidth="2" />
      <Path d="M139 218V123C139 85 166 60 200 60C234 60 261 85 261 123V218" fill="#D9BDB6" />
      <Path d="M158 218V126C158 98 176 80 200 80C224 80 242 98 242 126V218" fill="#6B3A4D" opacity="0.34" />
      {[172, 186, 200, 214, 228].map((x) => <Rect key={x} x={x} y="95" width="3" height="123" rx="1.5" fill="#B98A69" opacity="0.7" />)}
      <Rect x="57" y="207" width="286" height="12" rx="6" fill="#FFF9F5" />
      <G stroke="#765064" strokeWidth="2" fill="none">
        <Path d="M79 211C72 177 78 143 97 120M87 183l-18-13M89 168l19-18M75 196l21-7" />
        <Path d="M321 211C328 177 322 143 303 120M313 183l18-13M311 168l-19-18M325 196l-21-7" />
      </G>
      <G fill="#FFF4DF">
        <Circle cx="176" cy="190" r="3" /><Circle cx="188" cy="186" r="4" /><Circle cx="201" cy="190" r="3" /><Circle cx="214" cy="186" r="4" /><Circle cx="226" cy="190" r="3" />
      </G>
    </Svg>
  );
}

export function FloralCorner({ style, mirrored = false }: { style?: StyleProp<ViewStyle>; mirrored?: boolean }) {
  return (
    <Svg style={[style, mirrored && { transform: [{ scaleX: -1 }] }]} width="100%" height="100%" viewBox="0 0 120 180">
      <Path d="M16 177C30 130 52 90 101 27" fill="none" stroke="#B27B7D" strokeWidth="2" />
      <G fill="#A9787F" opacity="0.78">
        <Ellipse cx="36" cy="133" rx="12" ry="27" transform="rotate(-42 36 133)" />
        <Ellipse cx="58" cy="99" rx="11" ry="25" transform="rotate(-38 58 99)" />
        <Ellipse cx="80" cy="67" rx="10" ry="23" transform="rotate(-35 80 67)" />
        <Ellipse cx="57" cy="126" rx="11" ry="25" transform="rotate(42 57 126)" />
        <Ellipse cx="82" cy="91" rx="10" ry="24" transform="rotate(42 82 91)" />
        <Ellipse cx="102" cy="54" rx="9" ry="21" transform="rotate(37 102 54)" />
      </G>
      <Path d="M71 116C93 105 110 108 119 119" fill="none" stroke="#C99958" strokeWidth="1" />
    </Svg>
  );
}
