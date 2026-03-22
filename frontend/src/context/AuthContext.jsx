import { createContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // NEW: initialize username from token (if present)
  const [username, setUsername] = useState(() => {
    const stored = localStorage.getItem("token");
    if (!stored) return null;
    try {
      return jwtDecode(stored).username;
    } catch {
      return null;
    }
  });

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    // NEW: decode username
    try {
      const decoded = jwtDecode(newToken);
      setUsername(decoded.username);
    } catch {
      setUsername(null);
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// import { createContext, useState } from "react";

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   // initialize token from localStorage
//   const [token, setToken] = useState(() => localStorage.getItem("token"));

//   const login = (newToken) => {
//     setToken(newToken);
//     localStorage.setItem("token", newToken);
//   };

//   const logout = () => {
//     setToken(null);
//     localStorage.removeItem("token");
//   };

//   return (
//     <AuthContext.Provider value={{ token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import { createContext, useState } from "react";

// export const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(null);

//   const login = (t) => setToken(t);
//   const logout = () => setToken(null);

//   return (
//     <AuthContext.Provider value={{ token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }