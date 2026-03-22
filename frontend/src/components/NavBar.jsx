// import { Link } from "react-router-dom";

// export default function NavBar() {
//   return (
//     <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
//       <Link to="/">Home</Link>
//       <Link to="/journal">Journal</Link>
//       <Link to="/login">Login</Link>
//     </nav>
//   );
// }

import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function NavBar() {
  const { token, username, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();               // clears context + localStorage
    navigate("/login");     // send user back to login page
  };

  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <Link to="/">Home</Link>
      <Link to="/journal">Journal</Link>

      {token && <span>Welcome, {username}</span>}

      {/* Only show logout if logged in */}
      {token && (
        <button onClick={handleLogout}>
          Logout
        </button>
      )}

      {/* Only show login if logged out */}
      {!token && (
        <>
          <Link to="/login">Login</Link>
          {/* <Link to="/signup">Signup</Link> */}
        </>
      )}
    </nav>
  );
}