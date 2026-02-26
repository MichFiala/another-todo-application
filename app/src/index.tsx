import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { Auth0Provider } from "@auth0/auth0-react";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const theme = createTheme({
  /** Your theme override here */
});
const queryClient = new QueryClient();

root.render(
  <Auth0Provider
    domain={"dev-cklbf8biw8aj861m.eu.auth0.com"}
    clientId={"UMv3SmBXkjNKwhViUe9RAx2JI0GePuD0"}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://dev-cklbf8biw8aj861m.eu.auth0.com/api/v2/",
    }}
    cacheLocation="localstorage"
    useRefreshTokens={true}
  >
    <MantineProvider theme={theme}>
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    </MantineProvider>
  </Auth0Provider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
