import { createTheme } from '@mui/material/styles';
import { orange, purple, red } from '@mui/material/colors';

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'light', // Set the mode to dark
    primary: {
      main: purple["A400"],
    },
    secondary: {
      main: orange["A400"],
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;