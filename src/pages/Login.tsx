import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GraduationCap, ArrowRight, Loader2 } from "lucide-react";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.removeItem("activitiesData");
        sessionStorage.removeItem("timetableData");
        localStorage.setItem("authToken", "logged-in");
        navigate("/home");
      } else {
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-300"
      style={{ background: "var(--bg-secondary)" }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "var(--accent)", top: "-200px", right: "-200px" }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: "var(--accent)", bottom: "-100px", left: "-100px" }}
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[380px] p-8 rounded-3xl border"
        style={{
          background: "var(--bg-primary)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow-hover)",
        }}
      >
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "var(--accent)" }}
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <GraduationCap className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Student Portal
          </h1>
          <p className="text-[13px] mt-2 text-center leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            使用 Engage 帐号登录以继续
          </p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 rounded-xl text-[13px] font-medium text-center"
              style={{ background: "rgba(255,59,48,0.08)", color: "var(--danger)" }}
            >
              {error}
            </motion.div>
          )}

          <div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none transition-all duration-200 border placeholder:font-medium"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              placeholder="邮箱"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3.5 text-[14px] outline-none transition-all duration-200 border placeholder:font-medium"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-soft)"; }}
              onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              placeholder="密码"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            style={{ background: "var(--accent)" }}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.99 }}
          >
            {isLoading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <>
                登录
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
