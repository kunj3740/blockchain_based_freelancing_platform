import {  Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { HomePage } from "./components/HomePage";
import { ClientAuth } from "./components/custom/ClientAuth";
import { ListFreeLancer } from "./components/custom/ListFreeLancer";
import { FreelancerAuth } from "./components/custom/FreeLancerAuth";
import ListClient from "./components/custom/ListClient";
import ChatComponet from "./components/custom/Chat";
import { Navbar } from "./components/NavBar";

function App() {
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem("id", "2"); // store as string
  }, []);

  const hideNavbarOnPaths = ["/client/auth", "/freelancer/auth"];
  const shouldShowNavbar = !hideNavbarOnPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/client/auth" element={<ClientAuth />} />
        <Route path="/freelancer/auth" element={<FreelancerAuth />} />
        <Route path="/client/find" element={<ListClient />} />"
        <Route path="/freelancer/find" element={<ListFreeLancer />} />"
        <Route path="/chat/:id" element={<ChatComponet />} />"
      </Routes>
    </>
  );
}

export default App;
