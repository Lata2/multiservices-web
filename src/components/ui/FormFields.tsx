import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Input, Textarea, type InputProps, type TextareaProps } from './Input';

/** react-hook-form bound input. */
export function FormInput<T extends FieldValues>({ control, name, ...props }: Omit<InputProps, 'name' | 'value'> & { control: Control<T>; name: Path<T> }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState }) => (
        <Input ref={ref} name={name} value={value == null ? '' : String(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={fieldState.error?.message} {...props} />
      )}
    />
  );
}

export function FormTextarea<T extends FieldValues>({ control, name, ...props }: Omit<TextareaProps, 'name' | 'value'> & { control: Control<T>; name: Path<T> }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState }) => (
        <Textarea ref={ref} name={name} value={value == null ? '' : String(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={fieldState.error?.message} {...props} />
      )}
    />
  );
}
