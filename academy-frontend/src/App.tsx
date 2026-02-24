import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import "./App.css";
import { MovieDetail } from "./modules/movie/components/MovieDetail";
import { MovieMain } from "./modules/movie/components/MovieMain";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MovieMain />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
