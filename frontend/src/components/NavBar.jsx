import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
      <Link to="/">Home</Link>
      <Link to="/journal">Journal</Link>
      <Link to="/login">Login</Link>
    </nav>
  );
}
