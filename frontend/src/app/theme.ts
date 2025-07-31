"use client";
import { common, grey } from "@mui/material/colors";
import { alpha, createTheme } from "@mui/material/styles";
import { frFR } from "@mui/x-date-pickers/locales";
import type {} from "@mui/x-date-pickers/themeAugmentation";

const theme = createTheme(
  {
    shape: {
      borderRadius: 8,
    },

    typography: {
      fontFamily: "var(--font-roboto)",
    },

    palette: {
      primary: {
        main: "#090252",
      },
      secondary: {
        main: "#4b5563",
      },
    },

    components: {
      /**
       * Make the button looks better with the loading state.
       */
      MuiButton: {
        styleOverrides: {
          root: ({ theme, ownerState }) => ({
            textTransform: "none",

            // Secondary button text styling
            ...(ownerState.color === "secondary" &&
              ownerState.variant === "contained" && {
                backgroundColor: "#F1F5F9",
                color: theme.palette.secondary.main,

                "&:hover": {
                  backgroundColor: alpha("#F1F5F9", 0.8),
                },
              }),
          }),

          contained: ({ ownerState, theme }) => ({
            // Take the background color from the parent element
            "&.Mui-disabled": {
              backgroundColor: "inherit",
            },

            // When the button is loading, set the background color to the parent element's color with 80% opacity
            "&.MuiLoadingButton-loading, &.MuiButton-loading": {
              backgroundColor: alpha(
                // Only use palette keys that are guaranteed to exist
                ownerState.color === "secondary"
                  ? theme.palette.secondary.main
                  : theme.palette.primary.main,
                0.8
              ),
            },

            // Set the color of the loading indicator to white
            "& .MuiCircularProgress-root": {
              color: common.white,
            },
          }),
        },
      },

      /**
       * Set the default variant to filled for all text fields
       */
      MuiTextField: {
        defaultProps: {
          // Set the default variant to filled for all text fields
          variant: "filled",
        },
      },

      /**
       * The new design of the filled input (looks like the Shopify's design)
       */
      MuiFilledInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: "transparent",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "rgba(0, 0, 0, 0.23)",
            borderRadius: theme.shape.borderRadius,

            "&:hover": {
              backgroundColor: "transparent",
              borderColor: theme.palette.text.primary,
              "@media (hover: none)": {
                borderColor: "rgba(0, 0, 0, 0.23)",
              },
            },

            // When the input is focused, set the background color to transparent and the border color to the primary color
            "&.Mui-focused": {
              backgroundColor: "transparent",
              borderColor: theme.palette.primary.main,
              borderWidth: "1px",
            },

            // When the input is in an error state, set the border color to the error color
            "&.Mui-error": {
              borderColor: theme.palette.error.main,
            },

            // When the input is disabled, set the background color to transparent and the border color to the disabled color
            "&.Mui-disabled": {
              backgroundColor: "transparent",
              borderColor: "rgba(0, 0, 0, 0.12)",
            },

            // Hide the before and after pseudo-elements (the border of the filled input)
            "&:before, &:after": {
              display: "none",
            },
          }),
        },
      },

      /**
       * Set the default variant to filled for all date pickers.
       * Change the design to look like the other Inputs components.
       */
      MuiPickersTextField: {
        defaultProps: {
          variant: "filled",
        },

        styleOverrides: {
          root: ({ theme }) => ({
            "& .MuiPickersFilledInput-root": {
              backgroundColor: "transparent",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0, 0, 0, 0.23)",
              borderRadius: theme.shape.borderRadius,
            },

            "& .MuiPickersFilledInput-root:hover": {
              backgroundColor: "transparent",
              borderColor: theme.palette.text.primary,
              "@media (hover: none)": {
                borderColor: "rgba(0, 0, 0, 0.23)",
              },
            },

            // When the input is focused, set the background color to transparent and the border color to the primary color
            "& .MuiPickersFilledInput-root.Mui-focused": {
              backgroundColor: "transparent",
              borderColor: theme.palette.primary.main,
              borderWidth: "1px",
            },

            // When the input is in an error state, set the border color to the error color
            "& .MuiPickersFilledInput-root.Mui-error": {
              borderColor: theme.palette.error.main,
            },

            // When the input is disabled, set the background color to transparent and the border color to the disabled color
            "& .MuiPickersFilledInput-root.Mui-disabled": {
              backgroundColor: "transparent",
              borderColor: "rgba(0, 0, 0, 0.12)",
            },

            // Hide the before and after pseudo-elements (the border of the filled input)
            "& .MuiPickersFilledInput-root:before, & .MuiPickersFilledInput-root:after":
              {
                display: "none",
              },
          }),
        },
      },

      /**
       * Change the default border of the autocomplete component's dropdown menu to a more subtle one with a shadow.
       */
      MuiAutocomplete: {
        styleOverrides: {
          paper: ({ theme }) => ({
            border: `1px solid ${grey[300]}`,
            boxShadow: theme.shadows[3],
          }),
        },
      },

      /**
       * Set the default font size to 14px for all menu items, it's looks better for the <Menu> component (dropdown menu)
       */
      MuiMenuItem: {
        defaultProps: {
          classes: {
            root: "text-sm",
          },
        },
      },
    },
  },

  frFR // use 'fr' locale for UI texts (start, next month, ...) of MUI X Date Pickers
);

export { theme };
