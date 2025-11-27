import React from 'react';
import { TextField } from '@mui/material';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

interface FormDateTimePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
}

export function FormDateTimePicker<T extends FieldValues>({ name, control, label }: FormDateTimePickerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DateTimePicker
          {...field}
          label={label}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message
            }
          }}
        />
      )}
    />
  );
} 