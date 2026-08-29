import React, { forwardRef } from 'react';
import {
  Platform,
  StyleProp,
  StyleSheet,
  Switch,
  SwitchProps,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { Check, ChevronDown, Clock3 } from 'lucide-react-native';

const palette = {
  burgundy: '#641E3D',
  burgundyPressed: '#50152F',
  gold: '#D2AD6B',
  champagne: '#FAF5EC',
  border: '#E8DCC8',
  ink: '#2D2025',
  muted: '#786B70',
  white: '#FFFFFF',
  danger: '#B42318',
};

export type VellureButtonVariant =
  | 'unstyled'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';

export interface VellureButtonProps extends TouchableOpacityProps {
  variant?: VellureButtonVariant;
  fullWidth?: boolean;
}

/**
 * The single low-level press target for the application.
 *
 * Existing screens can keep their local `style` while inheriting consistent
 * accessibility, feedback, web behavior, and disabled handling. New controls
 * should prefer one of the semantic variants.
 */
export const VellureButton = forwardRef<View, VellureButtonProps>(
  function VellureButton(
    {
      activeOpacity = 0.78,
      accessibilityRole = 'button',
      disabled,
      fullWidth,
      style,
      variant = 'unstyled',
      ...props
    },
    ref
  ) {
    return (
      <TouchableOpacity
        ref={ref}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: Boolean(disabled), ...props.accessibilityState }}
        activeOpacity={activeOpacity}
        disabled={disabled}
        style={[
          styles.buttonBase,
          variant !== 'unstyled' && styles.buttonSized,
          variantStyles[variant],
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
        {...props}
      />
    );
  }
);

export interface VellureTextInputProps extends TextInputProps {
  inputStyle?: StyleProp<TextStyle>;
}

/** The only raw text-input boundary used by app-level fields. */
export const VellureTextInput = forwardRef<TextInput, VellureTextInputProps>(
  function VellureTextInput(
    {
      inputStyle,
      placeholderTextColor = '#9A8E94',
      selectionColor = palette.gold,
      style,
      ...props
    },
    ref
  ) {
    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor}
        selectionColor={selectionColor}
        style={[styles.textInputBase, inputStyle, style]}
        {...props}
      />
    );
  }
);

export interface VellureSwitchProps extends SwitchProps {
  activeColor?: string;
}

/** Shared boolean switch with brand defaults and overridable native props. */
export function VellureSwitch({
  activeColor = palette.burgundy,
  ios_backgroundColor = '#D8D0C5',
  thumbColor,
  trackColor,
  ...props
}: VellureSwitchProps) {
  return (
    <Switch
      ios_backgroundColor={ios_backgroundColor}
      thumbColor={thumbColor ?? palette.white}
      trackColor={trackColor ?? { false: '#D8D0C5', true: activeColor }}
      {...props}
    />
  );
}

export interface VellureCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function VellureCheckbox({
  checked,
  onChange,
  label,
  disabled,
  style,
  accessibilityLabel,
}: VellureCheckboxProps) {
  return (
    <VellureButton
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={[styles.checkboxRow, style]}
    >
      <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
        {checked ? <Check size={13} color={palette.white} strokeWidth={3} /> : null}
      </View>
      {label ? <Text style={styles.checkboxLabel}>{label}</Text> : null}
    </VellureButton>
  );
}

export interface VellureFieldTriggerProps extends VellureButtonProps {
  value?: string;
  placeholder: string;
  icon?: React.ReactNode;
  kind?: 'dropdown' | 'date' | 'time';
}

/** Shared trigger surface for dropdowns, dates, and times. */
export function VellureFieldTrigger({
  value,
  placeholder,
  icon,
  kind = 'dropdown',
  style,
  ...props
}: VellureFieldTriggerProps) {
  const trailing =
    kind === 'dropdown' ? (
      <ChevronDown size={15} color={palette.burgundy} />
    ) : kind === 'time' ? (
      <Clock3 size={15} color={palette.burgundy} />
    ) : null;

  return (
    <VellureButton style={[styles.fieldTrigger, style]} {...props}>
      <View style={styles.fieldTriggerContent}>
        {icon}
        <Text style={[styles.fieldTriggerText, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
      </View>
      {trailing}
    </VellureButton>
  );
}

const variantStyles = StyleSheet.create({
  unstyled: {},
  primary: {
    backgroundColor: palette.burgundy,
    borderColor: palette.burgundy,
  },
  secondary: {
    backgroundColor: palette.gold,
    borderColor: '#B98F48',
  },
  outline: {
    backgroundColor: palette.white,
    borderColor: palette.burgundy,
  },
  ghost: {
    backgroundColor: palette.champagne,
    borderColor: palette.border,
  },
  danger: {
    backgroundColor: palette.danger,
    borderColor: palette.danger,
  },
});

const styles = StyleSheet.create({
  buttonBase: {
    ...Platform.select({ web: { cursor: 'pointer' } as ViewStyle }),
  },
  buttonSized: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.55,
  },
  textInputBase: {
    color: palette.ink,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#B9AA9F',
    backgroundColor: palette.white,
  },
  checkboxBoxChecked: {
    borderColor: palette.burgundy,
    backgroundColor: palette.burgundy,
  },
  checkboxLabel: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldTrigger: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    paddingHorizontal: 13,
  },
  fieldTriggerContent: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldTriggerText: {
    flex: 1,
    color: palette.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    color: palette.muted,
  },
});
