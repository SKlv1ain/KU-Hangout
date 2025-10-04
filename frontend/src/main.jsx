import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx"; // Fix import path
import App from "./App.jsx";
import "./styles/index.css"; // global theme (green-white)
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
