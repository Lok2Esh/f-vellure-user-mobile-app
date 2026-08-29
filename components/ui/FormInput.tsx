import React from 'react';
import {
  VellureInputField,
  VellureInputFieldProps,
  VellureSearchInput,
  VellureSearchInputProps,
} from './VellureInputField';

export { VellureInputField, VellureSearchInput };
export type { VellureInputFieldProps, VellureSearchInputProps };

export interface FormInputProps extends VellureInputFieldProps {
  label: string;
  width?: string | number;
}

export function FormInput({ width = '100%', containerStyle, ...props }: FormInputProps) {
  return (
    <VellureInputField
      variant="card"
      containerStyle={[{ width: width as any }, containerStyle]}
      {...props}
    />
  );
}
