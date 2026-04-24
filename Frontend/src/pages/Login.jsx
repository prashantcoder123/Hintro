import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ FIX 1: initialize from localStorage
  const [remember, setRemember] = useState(
    !!localStorage.getItem("rememberEmail")
  );

  const navigate = useNavigate();

  // ✅ FIX 2: load saved email ONLY
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (email === "intern@demo.com" && password === "intern123"
        // || email === "prashant@demo.com" && password === "prashant123"
    ) {
      localStorage.setItem("isLoggedIn", "true");

      // ✅ handle remember logic ONLY here
      if (remember) {
        localStorage.setItem("rememberEmail", email);
      } 
      else {
        localStorage.removeItem("rememberEmail");
      }

      navigate("/board");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 px-4">
      
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-md">
        
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            className="border p-2 sm:p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border p-2 sm:p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* ✅ FIX 3: simple checkbox (no extra logic) */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;