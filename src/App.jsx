import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatbotPage from "./pages/ChatbotPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<ChatbotPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
