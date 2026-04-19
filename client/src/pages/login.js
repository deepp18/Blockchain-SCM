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
    localStorage.setItem("account", accounts[0]);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts();

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

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      alert("Enter email & password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.role) {
  localStorage.setItem("role", data.role);

  // 🔥 ADD THESE 2 LINES
  localStorage.setItem("email", loginData.email);
  localStorage.setItem("username", data.name || "User");

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
        zIndex: signIn ? 5 : 3
      }}>
        <div style={{
          width: "100%",
          maxWidth: "400px"
        }}>
          {/* TOGGLE INDICATOR */}
          <div style={{
            textAlign: "center",
            marginBottom: "40px",
            color: "#94a3b8",
            fontSize: "13px",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "1px"
          }}>
            {signIn ? "Welcome Back" : "New Member"}
          </div>

          {/* TITLE */}
          <h1 style={{
            fontFamily: "'League Spartan', sans-serif",
            fontSize: "36px",
            fontWeight: "900",
            margin: "0 0 12px 0",
            color: "white",
            letterSpacing: "-0.8px",
            textTransform: "uppercase"
          }}>
            {signIn ? "Hello Again!" : "Create Account"}
          </h1>



          {/* FORM */}
          <form onSubmit={signIn ? handleLogin : (e) => { e.preventDefault(); handleSignup(e); }} style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}>
            
            {/* NAME FIELD (SIGNUP ONLY) */}
            {!signIn && (
              <div>
                <input
                  placeholder="Full Name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "#1e293b",
                    border: "1.5px solid #334155",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "15px",
                    fontFamily: "'Sanchez', serif",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                  onBlur={(e) => e.target.style.borderColor = "#334155"}
                />
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <input
                placeholder="Email"
                type="email"
                value={signIn ? loginData.email : signupData.email}
                onChange={(e) => 
                  signIn 
                    ? setLoginData({ ...loginData, email: e.target.value })
                    : setSignupData({ ...signupData, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#1e293b",
                  border: "1.5px solid #334155",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "15px",
                  fontFamily: "'Sanchez', serif",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                onBlur={(e) => e.target.style.borderColor = "#334155"}
              />
            </div>

            {/* PASSWORD FIELD */}
            <div style={{ position: "relative" }}>
              <input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={signIn ? loginData.password : signupData.password}
                onChange={(e) => 
                  signIn 
                    ? setLoginData({ ...loginData, password: e.target.value })
                    : setSignupData({ ...signupData, password: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  paddingRight: "45px",
                  background: "#1e293b",
                  border: "1.5px solid #334155",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "15px",
                  fontFamily: "'Sanchez', serif",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                onBlur={(e) => e.target.style.borderColor = "#334155"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#0d9488",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: "600",
                  padding: "4px 8px",
                  transition: "color 0.3s"
                }}
                onMouseEnter={(e) => e.target.style.color = "#14b8a6"}
                onMouseLeave={(e) => e.target.style.color = "#0d9488"}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            {/* CONFIRM PASSWORD (SIGNUP ONLY) */}
            {!signIn && (
              <div style={{ position: "relative" }}>
                <input
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    paddingRight: "45px",
                    background: "#1e293b",
                    border: "1.5px solid #334155",
                    borderRadius: "12px",
                    color: "white",
                    fontSize: "15px",
                    fontFamily: "'Sanchez', serif",
                    boxSizing: "border-box",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#0d9488"}
                  onBlur={(e) => e.target.style.borderColor = "#334155"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#0d9488",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    padding: "4px 8px",
                    transition: "color 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#14b8a6"}
                  onMouseLeave={(e) => e.target.style.color = "#0d9488"}
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            )}

            {/* ROLE SELECT (SIGNUP ONLY) */}
            {!signIn && (
              <select
                value={signupData.role}
                onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "#1e293b",
                  border: "1.5px solid #334155",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "15px",
                  fontFamily: "'Sanchez', serif",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              >
                <option value="">Select Your Role</option>
                <option value="1">Supplier</option>
                <option value="2">Manufacturer</option>
                <option value="3">Distributor</option>
                <option value="4">Retailer</option>
                <option value="5">Customer</option>
              </select>
            )}

            {/* FORGOT PASSWORD / RECOVERY (LOGIN ONLY) */}
            {signIn && (
              <div style={{
                textAlign: "right",
                marginTop: "4px"
              }}>
                <a href="#recover" style={{
                  color: "#0d9488",
                  fontSize: "13px",
                  textDecoration: "none",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "color 0.3s"
                }} onMouseEnter={(e) => e.target.style.color = "#14b8a6"} onMouseLeave={(e) => e.target.style.color = "#0d9488"}>
                  Recovery Password
                </a>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              style={{
                padding: "14px 20px",
                background: "#8b5a6e",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                fontFamily: "'League Spartan', sans-serif",
                cursor: "pointer",
                margin: "8px 0 16px 0",
                textTransform: "uppercase",
                letterSpacing: "-0.4px",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.target.style.background = "#9d6a7e"}
              onMouseLeave={(e) => e.target.style.background = "#8b5a6e"}
            >
              {signIn ? "Sign in" : "Sign Up"}
            </button>
          </form>

          {/* DIVIDER */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "24px 0"
          }}>
            <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
            <span style={{ color: "#64748b", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Or continue with</span>
            <div style={{ flex: 1, height: "1px", background: "#334155" }}></div>
          </div>

          
          {/* TOGGLE TO SIGNUP/LOGIN */}
          <div style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "14px"
          }}>
            {signIn ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => toggle(!signIn)}
              style={{
                background: "none",
                border: "none",
                color: "#0d9488",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "14px",
                textDecoration: "underline"
              }}
            >
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
        {/* GRADIENT OVERLAY SHAPES */}
        <div style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          top: "-100px",
          left: "-100px",
          zIndex: 1
        }}></div>
        
        <div style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(0,0,0,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          bottom: "-150px",
          right: "-150px",
          zIndex: 1
        }}></div>

        {/* ILLUSTRATION IMAGE */}
        <div style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "white",
          maxWidth: "400px",
          width: "100%"
        }}>
          <img 
            src={require("./scm.png")} 
            alt="Supply Chain Illustration"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "auto",
              borderRadius: "20px",
              marginBottom: "24px",
              objectFit: "cover",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }} 
          />
          <h2 style={{
            fontFamily: "'League Spartan', sans-serif",
            fontSize: "32px",
            fontWeight: "900",
            margin: "0 0 12px 0",
            textTransform: "uppercase",
            letterSpacing: "-0.6px"
          }}>
            Supply Chain Simplified
          </h2>
          <p style={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: "15px",
            maxWidth: "300px",
            lineHeight: "1.6"
          }}>
            Track your products with confidence and ease
          </p>
        </div>

        {/* DECORATIVE ELEMENTS */}
        <div style={{
          position: "absolute",
          bottom: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 2
        }}>
          {[1, 2, 3].map((dot) => (
            <div key={dot} style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: dot === 1 ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s"
            }} onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.8)"} onMouseLeave={(e) => e.target.style.background = dot === 1 ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.3)"}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;