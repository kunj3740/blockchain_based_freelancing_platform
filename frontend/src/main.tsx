import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import SocketContextProvider from "./context/SocketContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";


createRoot(document.getElementById("root")!).render(
  <SocketContextProvider>
    <StrictMode>
    <Toaster position="top-right" />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  </SocketContextProvider>
);
