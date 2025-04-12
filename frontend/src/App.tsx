import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import { HomePage } from "./components/custom/HomePage";
import { ClientAuth } from "./components/custom/ClientAuth";
import { ListFreeLancer } from "./components/custom/ListFreeLancer";
import { FreelancerAuth } from "./components/custom/FreeLancerAuth";
import ListClient from "./components/custom/ListClient";
import ChatComponet from "./components/custom/Chat";

function App() {
  useEffect(() => {
    localStorage.setItem("id", "2"); // store as string
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/client/auth" element={<ClientAuth />} />
        <Route path="/freelancer/auth" element={<FreelancerAuth />} />
        <Route path="/client/find" element={<ListClient />} />"
        <Route path="/freelancer/find" element={<ListFreeLancer />} />"
        <Route path="/chat/:id" element={<ChatComponet />} />"
        {/* <Route path="/" element={<HomePage />} />

        {/* You can add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
