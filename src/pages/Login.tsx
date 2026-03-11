import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GraduationCap } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store the token if needed
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        navigate("/home");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f7]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[360px] p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-5">
            <GraduationCap className="w-7 h-7 text-apple-blue" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-apple-text">Student Portal</h1>
          <p className="text-[13px] text-black/50 mt-1.5">Please sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium text-center">
              {error}
            </div>
          )}
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-apple-blue/30 focus:ring-4 focus:ring-apple-blue/10 rounded-xl px-4 py-3 text-[15px] outline-none transition-all placeholder:text-black/40"
              placeholder="Student ID"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f5f5f7] focus:bg-white border border-transparent focus:border-apple-blue/30 focus:ring-4 focus:ring-apple-blue/10 rounded-xl px-4 py-3 text-[15px] outline-none transition-all placeholder:text-black/40"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-apple-blue hover:bg-apple-blue-hover text-white rounded-xl px-4 py-3 text-[15px] font-medium transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
