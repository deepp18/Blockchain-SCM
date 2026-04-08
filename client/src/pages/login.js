import React, { useState } from "react";
import * as Components from "../components/components";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import SupplyChain from "../contracts/SupplyChain.json";

function Login() {
  const navigate = useNavigate();
  const [signIn, toggle] = useState(true);

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
    await registerOnBlockchain(signupData.role);

    localStorage.setItem("role", signupData.role);

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
    <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
      <Components.Container>

        {/* SIGN UP */}
        <Components.SignUpContainer signinIn={signIn}>
          <Components.Form>
            <Components.Title>Create Account</Components.Title>

            <Components.Input
              placeholder="Name"
              onChange={(e) =>
                setSignupData({ ...signupData, name: e.target.value })
              }
            />

            <Components.Input
              placeholder="Email"
              onChange={(e) =>
                setSignupData({ ...signupData, email: e.target.value })
              }
            />

            <Components.Input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
            />

            {/* 🔥 CONFIRM PASSWORD */}
            <Components.Input
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/* ROLE SELECT */}
            <select
              style={{ padding: "10px", margin: "10px 0", width: "100%" }}
              onChange={(e) =>
                setSignupData({ ...signupData, role: e.target.value })
              }
            >
              <option value="">Select Role</option>
              <option value="1">Supplier</option>
              <option value="2">Manufacturer</option>
              <option value="3">Distributor</option>
              <option value="4">Retailer</option>
              <option value="5">Customer</option>
            </select>

            <Components.Button onClick={handleSignup}>
              Sign Up
            </Components.Button>
          </Components.Form>
        </Components.SignUpContainer>

        {/* LOGIN */}
        <Components.SignInContainer signinIn={signIn}>
          <Components.Form>
            <Components.Title>Login</Components.Title>

            <Components.Input
              placeholder="Email"
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />

            <Components.Input
              type="password"
              placeholder="Password"
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />

            <Components.Button onClick={handleLogin}>
              Login
            </Components.Button>
          </Components.Form>
        </Components.SignInContainer>

        {/* OVERLAY */}
        <Components.OverlayContainer signinIn={signIn}>
          <Components.Overlay signinIn={signIn}>

            <Components.LeftOverlayPanel signinIn={signIn}>
              <Components.Title>Welcome Back!</Components.Title>
              <Components.Paragraph>
                Login to continue tracking your supply chain 🚚
              </Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(true)}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>

            <Components.RightOverlayPanel signinIn={signIn}>
              <Components.Title>Hello, User!</Components.Title>
              <Components.Paragraph>
                Register and manage your supply chain 🔥
              </Components.Paragraph>
              <Components.GhostButton onClick={() => toggle(false)}>
                Sign Up
              </Components.GhostButton>
            </Components.RightOverlayPanel>

          </Components.Overlay>
        </Components.OverlayContainer>

      </Components.Container>
    </div>
  );
}

export default Login;