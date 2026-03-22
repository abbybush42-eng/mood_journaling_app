import { useState, useContext } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const expired = searchParams.get("expired");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser({ username, password });
      const token = res.data.token;

      // save token
      localStorage.setItem("token", token);

      // update context
      login(token);

      // redirect
      navigate("/journal");
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ maxWidth: "300px", margin: "2rem auto" }}>
      <h1>Login</h1>

      {expired && (
        <p style={{ color: "orange" }}>
          Your session expired. Please log in again.
        </p>
      )}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <button type="submit" style={{ width: "100%", marginBottom: "1rem" }}>
          Login
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button
        onClick={() => navigate("/signup")}
        style={{ width: "100%", marginTop: "1rem" }}
      >
        Create an Account
      </button>
    </div>
  );
}

// // function Login() {
// //   return <h1>Login</h1>;
// // }

// // export default Login;
// import { useState } from "react";
// import { loginUser } from "../services/api";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const res = await loginUser({ username, password });
//       const token = res.data.token;

//       // save token
//       localStorage.setItem("token", token);

//       // redirect to journal page
//       navigate("/journal");
//     } catch (err) {
//       console.error("Login failed", err);
//       setError("Invalid username or password");
//     }
//   };

//   return (
//     <div style={{ maxWidth: "300px", margin: "2rem auto" }}>
//       <h1>Login</h1>

//       <form onSubmit={handleLogin}>
//         <div style={{ marginBottom: "1rem" }}>
//           <label>Username</label>
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             style={{ width: "100%" }}
//           />
//         </div>

//         <div style={{ marginBottom: "1rem" }}>
//           <label>Password</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             style={{ width: "100%" }}
//           />
//         </div>

//         <button type="submit" style={{ width: "100%" }}>
//           Login
//         </button>
//       </form>

//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }
