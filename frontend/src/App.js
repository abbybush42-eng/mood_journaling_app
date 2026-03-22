// import Home from "./pages/Home";
// import Journal from "./pages/Journal";
// import Login from "./pages/Login";

// function App() {
//   return (
//     <div className="App">
//       <Home />
//     </div>
//   );
// }

// export default App;

import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router";
import SessionTimer from "./components/SessionTimer";

export default function App() {
  return (
    <AuthProvider>
      <SessionTimer />
      <AppRouter />
    </AuthProvider>
  );
}
