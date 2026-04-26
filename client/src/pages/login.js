import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChain from "../contracts/SupplyChain.json";

function Login() {
  const navigate = useNavigate();
  const [signIn, toggle] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // 🔥 REGISTER ROLE ON BLOCKCHAIN
  const registerOnBlockchain = async (role) => {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts();
    localStorage.setItem("account", accounts[0]);

    const network = SupplyChain.networks["5777"];

    const contract = new web3.eth.Contract(
      SupplyChain.abi,
      network.address
    );

    await contract.methods.registerRole(role).send({
      from: accounts[0],
    });
  };

  // 🔐 SIGNUP
  const handleSignup = async (e) => {
    e.preventDefault();

    if (
      !signupData.name ||
      !signupData.email ||
      !signupData.password ||
      !signupData.role ||
      !confirmPassword
    ) {
      alert("Please fill all fields");
      return;
    }

    if (signupData.password !== confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      // 🔥 BACKEND CALL
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message); // 🔥 shows real error
        return;
      }

      // 🔥 BLOCKCHAIN CALL
      await registerOnBlockchain(parseInt(signupData.role));

      localStorage.setItem("role", signupData.role);
      localStorage.setItem("username", signupData.name);
      localStorage.setItem("email", signupData.email);
      alert("Signup Successful ✅");
      toggle(true);

    } catch (err) {
      console.log("ERROR:", err);
      alert("Signup failed ❌ Check console");
    }
  };

  // 🔐 UNIFIED LOGIN (Email + Automatic Wallet Connection)
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      alert("Enter email & password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.role) {
        let walletAddress = "";

        // 🔥 AUTOMATIC WALLET CONNECTION & LINKING
        try {
          if (window.ethereum) {
            const web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3.eth.getAccounts();
            walletAddress = accounts[0];

            // Implicitly link
            localStorage.setItem(`wallet_${walletAddress.toLowerCase()}`, loginData.email);
            localStorage.setItem("walletAddress", walletAddress);
            localStorage.setItem("account", walletAddress);
          } else {
            console.warn("MetaMask not installed.");
            alert("MetaMask not found. You are logged in locally, but blockchain features won't work.");
          }
        } catch (err) {
          console.error("Wallet connection skipped/failed:", err);
          if (err.code === 4001) {
            alert("Wallet connection rejected. You are logged in locally, but blockchain features won't work.");
          }
        }

        // Set common session variables
        localStorage.setItem("role", data.role);
        localStorage.setItem("email", loginData.email);
        localStorage.setItem("username", data.name || "User");
        localStorage.setItem("authType", walletAddress ? "wallet" : "email");

        // Save for potential future usage
        localStorage.setItem(`role_${loginData.email}`, data.role);
        localStorage.setItem(`name_${loginData.email}`, data.name || "User");

        alert("Login Successful ✅");
        navigate("/dashboard");
      } else {
        alert("Invalid credentials ❌");
      }
    } catch (err) {
      console.log(err);
      alert("Login error ❌");
    }
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#0f172a",
      fontFamily: "'Sanchez', serif"
    }}>

      {/* LEFT SECTION - FORM */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 40px",
        background: "#0f172a",
        position: "relative",
        zIndex: 5
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px"
        }}>
          {/* TOGGLE INDICATOR */}
          <div style={{ textAlign: "center", marginBottom: "40px", color: "#94a3b8", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>
            {signIn ? "Welcome Back" : "New Member"}
          </div>

          <h1 style={{ fontFamily: "'League Spartan', sans-serif", fontSize: "36px", fontWeight: "900", margin: "0 0 12px 0", color: "white", letterSpacing: "-0.8px", textTransform: "uppercase" }}>
            {signIn ? "Hello Again!" : "Create Account"}
          </h1>

          <form onSubmit={signIn ? handleLogin : handleSignup} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {!signIn && (
              <div>
                <input placeholder="Full Name" value={signupData.name} onChange={(e) => setSignupData({ ...signupData, name: e.target.value })} style={{ width: "100%", padding: "14px 16px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", color: "white", fontSize: "15px", fontFamily: "'Sanchez', serif", boxSizing: "border-box" }} />
              </div>
            )}

            <div>
              <input placeholder="Email" type="email" value={signIn ? loginData.email : signupData.email} onChange={(e) => signIn ? setLoginData({ ...loginData, email: e.target.value }) : setSignupData({ ...signupData, email: e.target.value })} style={{ width: "100%", padding: "14px 16px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", color: "white", fontSize: "15px", fontFamily: "'Sanchez', serif", boxSizing: "border-box" }} />
            </div>

            <div style={{ position: "relative" }}>
              <input placeholder="Password" type={showPassword ? "text" : "password"} value={signIn ? loginData.password : signupData.password} onChange={(e) => signIn ? setLoginData({ ...loginData, password: e.target.value }) : setSignupData({ ...signupData, password: e.target.value })} style={{ width: "100%", padding: "14px 16px", paddingRight: "45px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", color: "white", fontSize: "15px", fontFamily: "'Sanchez', serif", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#0d9488", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>{showPassword ? "HIDE" : "SHOW"}</button>
            </div>

            {!signIn && (
              <div style={{ position: "relative" }}>
                <input placeholder="Confirm Password" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "14px 16px", paddingRight: "45px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", color: "white", fontSize: "15px", fontFamily: "'Sanchez', serif", boxSizing: "border-box" }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#0d9488", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>{showConfirmPassword ? "HIDE" : "SHOW"}</button>
              </div>
            )}

            {!signIn && (
              <select value={signupData.role} onChange={(e) => setSignupData({ ...signupData, role: e.target.value })} style={{ width: "100%", padding: "14px 16px", background: "#1e293b", border: "1.5px solid #334155", borderRadius: "12px", color: "white", fontSize: "15px", fontFamily: "'Sanchez', serif", boxSizing: "border-box", cursor: "pointer" }}>
                <option value="">Select Your Role</option>
                <option value="1">Supplier</option>
                <option value="2">Manufacturer</option>
                <option value="3">Distributor</option>
                <option value="4">Retailer</option>
                <option value="5">Customer</option>
              </select>
            )}

            {signIn && (
              <div style={{ textAlign: "right", marginTop: "4px" }}>
                <a href="#recover" style={{ color: "#0d9488", fontSize: "13px", textDecoration: "none", fontWeight: "600", cursor: "pointer" }}>Recovery Password</a>
              </div>
            )}

            <button type="submit" style={{ padding: "14px 20px", background: "#8b5a6e", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", fontFamily: "'League Spartan', sans-serif", cursor: "pointer", margin: "8px 0 16px 0", textTransform: "uppercase" }}>
              {signIn ? "Sign in & Connect Wallet" : "Sign Up"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
            <span style={{ color: "#64748b", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Or</span>
            <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
          </div>

          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
            {signIn ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => toggle(!signIn)} style={{ background: "none", border: "none", color: "#0d9488", cursor: "pointer", fontWeight: "700", fontSize: "14px", textDecoration: "underline" }}>
              {signIn ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION - ILLUSTRATION */}
      <div style={{
        flex: 1,
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative Grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          transform: "perspective(1000px) rotateX(60deg) scale(2.5)",
          transformOrigin: "top center",
          opacity: 0.5
        }} />

        <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
          <div style={{
            width: "280px",
            height: "280px",
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 40px auto",
            border: "1px solid #334155",
            boxShadow: "0 0 80px rgba(13, 148, 136, 0.15)"
          }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>

          <h2 style={{
            fontFamily: "'League Spartan', sans-serif",
            fontSize: "32px",
            fontWeight: "900",
            color: "white",
            margin: "0 0 16px 0",
            letterSpacing: "-0.5px"
          }}>
            ChainTrack
          </h2>
          <p style={{
            color: "#94a3b8",
            fontSize: "16px",
            lineHeight: "1.6",
            maxWidth: "300px",
            margin: "0 auto"
          }}>
            Secure, transparent, and efficient blockchain tracking for your global inventory.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Login;