import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { type TextFieldProps } from '@mui/material/TextField';

type SearchFieldProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value: string;
  onChange: (value: string) => void;
};

/** Text field with a search icon and a clear button. */
export function SearchField({ value, onChange, placeholder = 'Search…', ...props }: SearchFieldProps) {
  return (
    <TextField
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label="Clear search" onClick={() => onChange('')} edge="end">
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
        htmlInput: { 'aria-label': props['aria-label'] ?? placeholder },
      }}
      {...props}
    />
  );
}
