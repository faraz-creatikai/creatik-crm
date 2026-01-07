import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import dayjs from "dayjs";

interface DateSelectorProps {
  label: string;
  value?: string; // optional initial value
  onChange?: (selected: string) => void;
   error?: string;
}

export default function DateSelector({ label, value, onChange }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = React.useState<any>(value ? dayjs(value) : null);

  const handleChange = (newValue: any) => {
    setSelectedDate(newValue);
    if (onChange) onChange(newValue ? newValue.format("YYYY-MM-DD") : "");
  };

  React.useEffect(() => {
    if (value) setSelectedDate(dayjs(value));
  }, [value]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl
        sx={{
          width: {
            xs: "100%",
            sm: "100%",
            md: "100%",
          },
          minWidth: {
            md: 200,
            lg: 200,
          },
        }}
      >
        <DatePicker
          label={label}
          value={selectedDate}
          onChange={handleChange}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: {
                "& .MuiInputBase-root": {
                  borderRadius: "8px",
                },
              },
            },
          }}
        />
      </FormControl>
    </LocalizationProvider>
  );
}
