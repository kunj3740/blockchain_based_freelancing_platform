import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import SocketContextProvider from "./context/SocketContext.tsx";
import { BrowserRouter } from "react-router-dom";


createRoot(document.getElementById("root")!).render(
  <SocketContextProvider>
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </SocketContextProvider>
);
