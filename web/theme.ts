import {createTheme} from '@mui/material/styles';

// Deliberately not the Acme DMS colours: the tracker is a different tool. Secondary (purple) marks what an agent did.
export const trackerTheme = createTheme({
  cssVariables: {colorSchemeSelector: 'class'},
  colorSchemes: {
    light: {
      palette: {
        primary: {main: '#0b5cad', contrastText: '#ffffff'},
        secondary: {main: '#8250df', contrastText: '#ffffff'},
        background: {default: '#f6f8fa', paper: '#ffffff'},
      },
    },
    dark: {
      palette: {
        primary: {main: '#6cb6ff', contrastText: '#0b1520'},
        secondary: {main: '#c297ff', contrastText: '#1b1030'},
        background: {default: '#0d1117', paper: '#161b22'},
      },
    },
  },
  shape: {borderRadius: 8},
  typography: {
    fontFamily: '"Inter Variable", Roboto, Helvetica, Arial, sans-serif',
    h5: {fontWeight: 600},
    h6: {fontWeight: 600},
    button: {textTransform: 'none', fontWeight: 600},
  },
  components: {
    MuiButton: {defaultProps: {disableElevation: true}},
    MuiPaper: {defaultProps: {variant: 'outlined'}},
    MuiAppBar: {defaultProps: {elevation: 0}},
  },
});
