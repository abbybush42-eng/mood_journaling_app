import { useEffect, useState } from "react";

export default function SessionTimer() {
  const SESSION_DURATION = 60 * 60; // 60 minutes in seconds
  const WARNING_TIME = 5 * 60; // 5 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [showWarning, setShowWarning] = useState(false);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle warning + auto logout
  useEffect(() => {
    if (timeLeft <= WARNING_TIME && timeLeft > 0) {
      setShowWarning(true);
    }

    if (timeLeft <= 0) {
      localStorage.removeItem("token");
      window.location.href = "/login?expired=true";
    }
  }, [timeLeft]);

  // Reset timer on any key press
  useEffect(() => {
    const resetTimer = () => {
      setTimeLeft(SESSION_DURATION);
      setShowWarning(false);
    };

    window.addEventListener("keydown", resetTimer);
    return () => window.removeEventListener("keydown", resetTimer);
  }, []);

  // Renew session button
  const handleRenew = () => {
    setTimeLeft(SESSION_DURATION);
    setShowWarning(false);
  };

  if (!showWarning) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h3>Session Expiring Soon</h3>
        <p>You will be logged out in five minutes. Press any key to refresh.</p>

        <button
          onClick={handleRenew}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            width: "100%",
          }}
        >
          Renew Session
        </button>
      </div>
    </div>
  );
}