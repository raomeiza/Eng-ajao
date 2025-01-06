import { TextFieldProps, TextField } from "@mui/material";
import { useRef, useEffect } from "react";

// lets create a styled mui textfield component
// the component will have a white text color, white label color, white underline color, white hover underline color and white active underline color
// most importantly, it removes the blue background color that appears when the browser autofills the input
// this was achieved mainly by first, listening to the autofil events 'mui-auto-fill' and 'mui-auto-fill-cancel'
// and then, setting transition to background-color to a very large value
const StyledTextField: React.FC<TextFieldProps> = (props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleAutofill = (event: AnimationEvent) => {
      if (event.animationName === 'mui-auto-fill' || event.animationName === 'mui-auto-fill-cancel') {
        const input = inputRef.current;
        if (input) {
          // input.style.WebkitBoxShadow = '0 0 0 1000px transparent inset';
          input.style.WebkitTextFillColor = 'white';
          // input.style.backgroundColor = 'none';
          input.style.transition = 'background-color 5000000s ease-in-out 0s';
        }
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('animationstart', handleAutofill);
      inputElement.addEventListener('animationcancel', handleAutofill);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener('animationstart', handleAutofill);
        inputElement.removeEventListener('animationcancel', handleAutofill);
      }
    };
  }, []);

  return (
    <TextField
      {...props}
      inputRef={inputRef}
      variant="standard"
      color="secondary"
      sx={{
        width: "100%",
        mb: 2,
        '& .MuiInputBase-input': {
          color: 'white', // Text color
        },
        '& .MuiInputLabel-root': {
          color: 'white', // Label color
        },
        '& .MuiInput-underline:before': {
          borderBottomColor: 'white', // Default underline color
          borderBottomWidth: '3px',
        },
        '& .MuiInput-underline:hover:before': {
          borderBottomColor: 'white', // Hover underline color
        },
        '& .MuiInput-underline:after': {
          borderBottomColor: 'white', // Active underline color
        },
        ...props.sx,
      }}
    />
  );
};

export default StyledTextField;