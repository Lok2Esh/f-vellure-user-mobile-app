import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Search, X } from 'lucide-react-native';

export interface VellureInputFieldProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  error?: string;
  helperText?: string;
  isReadOnly?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  variant?: 'default' | 'card' | 'filled' | 'minimal';
}

export function VellureInputField({
  label,
  icon,
  rightAction,
  error,
  helperText,
  isReadOnly,
  onPress,
  containerStyle,
  inputStyle,
  variant = 'default',
  multiline,
  numberOfLines,
  ...props
}: VellureInputFieldProps) {
  const isFilled = variant === 'filled';
  const isCard = variant === 'card';
  const isMinimal = variant === 'minimal';

  const content = (
    <View style={[styles.fieldContainer, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          {icon ? <View style={styles.labelIcon}>{icon}</View> : null}
          <Text style={styles.labelText}>{label}</Text>
        </View>
      ) : null}

      <View
        style={[
          styles.inputBox,
          isFilled && styles.inputBoxFilled,
          isCard && styles.inputBoxCard,
          isMinimal && styles.inputBoxMinimal,
          multiline && styles.inputBoxMultiline,
          Boolean(error) && styles.inputBoxError,
        ]}
      >
        {!label && icon ? <View style={styles.leftIconWrapper}>{icon}</View> : null}

        {isReadOnly ? (
          <Text
            style={[
              styles.readOnlyText,
              !props.value && styles.placeholderText,
              inputStyle,
            ]}
          >
            {props.value || props.placeholder}
          </Text>
        ) : (
          <TextInput
            style={[
              styles.nativeInput,
              multiline && styles.nativeInputMultiline,
              inputStyle,
            ]}
            placeholderTextColor="#A08F7E"
            selectionColor="#D2AD6B"
            multiline={multiline}
            numberOfLines={numberOfLines}
            {...props}
          />
        )}

        {rightAction ? <View style={styles.rightActionWrapper}>{rightAction}</View> : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );

  if (onPress || isReadOnly) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={[styles.touchableWrapper, containerStyle]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export interface VellureSearchInputProps extends TextInputProps {
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function VellureSearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  containerStyle,
  ...props
}: VellureSearchInputProps) {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <Search size={16} color="#D2AD6B" />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A08F7E"
        selectionColor="#D2AD6B"
        {...props}
      />
      {value && onClear ? (
        <TouchableOpacity onPress={onClear} style={styles.clearBtn} activeOpacity={0.7}>
          <X size={14} color="#641E3D" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldContainer: {
    width: '100%',
    marginBottom: 8,
  },
  touchableWrapper: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 2,
  },
  labelIcon: {
    marginRight: 5,
  },
  labelText: {
    color: '#641E3D',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5EC',
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#EFE3CF',
  },
  inputBoxFilled: {
    backgroundColor: '#FAF5EC',
    borderColor: '#EFE3CF',
  },
  inputBoxCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputBoxMinimal: {
    backgroundColor: 'transparent',
    borderColor: '#EFE3CF',
    borderRadius: 10,
  },
  inputBoxMultiline: {
    paddingVertical: 10,
    alignItems: 'flex-start',
    minHeight: 64,
  },
  inputBoxError: {
    borderColor: '#F87171',
    backgroundColor: '#FFF5F5',
  },
  leftIconWrapper: {
    marginRight: 8,
  },
  rightActionWrapper: {
    marginLeft: 8,
  },
  nativeInput: {
    flex: 1,
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
    margin: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  nativeInputMultiline: {
    textAlignVertical: 'top',
    minHeight: 50,
  },
  readOnlyText: {
    flex: 1,
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#A08F7E',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    marginLeft: 4,
  },
  helperText: {
    color: '#786B70',
    fontSize: 10,
    marginTop: 2,
    marginLeft: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#EFE3CF',
    shadowColor: '#641E3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#2D2025',
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
    margin: 0,
    outlineStyle: 'none',
    outlineWidth: 0,
  } as any,
  clearBtn: {
    padding: 4,
  },
});
