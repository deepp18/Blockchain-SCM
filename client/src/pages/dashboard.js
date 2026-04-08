import React, { useEffect, useState } from "react";
import Web3 from "web3";
import SupplyChain from "../contracts/SupplyChain.json";

function Dashboard() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const role = localStorage.getItem("role");

  useEffect(() => {
    loadBlockchain();
  }, []);

  const loadBlockchain = async () => {
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);

    const network = SupplyChain.networks["5777"];

    const instance = new web3.eth.Contract(
      SupplyChain.abi,
      network.address
    );

    setContract(instance);
    loadProducts(instance);
  };

  const loadProducts = async (instance) => {
    let items = [];

    for (let i = 1; i <= 20; i++) {
      try {
        let data = await instance.methods.MedicineStock(i).call();
        if (data.id !== "0") items.push(data);
      } catch {}
    }

    setProducts(items);
  };

  // 🔥 ACTIONS
  const addProduct = async () => {
    await contract.methods.addMedicine(name, desc).send({ from: account });
    loadProducts(contract);
  };

  const RMSsupply = async (id) => {
    await contract.methods.RMSsupply(id).send({ from: account });
    loadProducts(contract);
  };

  const Manufacturing = async (id) => {
    await contract.methods.Manufacturing(id).send({ from: account });
    loadProducts(contract);
  };

  const Distribute = async (id) => {
    await contract.methods.Distribute(id).send({ from: account });
    loadProducts(contract);
  };

  const Retail = async (id) => {
    await contract.methods.Retail(id).send({ from: account });
    loadProducts(contract);
  };

  const Sold = async (id) => {
    await contract.methods.sold(id).send({ from: account });
    loadProducts(contract);
  };

  // 🎨 ROLE BADGE
  const getRoleName = () => {
    switch (role) {
      case "1": return "Supplier";
      case "2": return "Manufacturer";
      case "3": return "Distributor";
      case "4": return "Retailer";
      case "5": return "Customer";
      default: return "Unknown";
    }
  };

  // 📦 STAGE TIMELINE
  const renderTimeline = (stage) => {
    const stages = [
      "Created",
      "Raw Material",
      "Manufactured",
      "Distributed",
      "Retail",
      "Sold"
    ];

    return (
      <div style={{ display: "flex", marginTop: "10px" }}>
        {stages.map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              color: i <= stage ? "green" : "#ccc",
              fontSize: "12px"
            }}
          >
            ●
            <div>{s}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: "30px", background: "#f5f5f5", minHeight: "100vh" }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h1>🚚 Supply Chain Dashboard</h1>

        <p>
          <b>Wallet:</b> {account}
        </p>

        <p>
          <b>Role:</b>{" "}
          <span style={{
            background: "#4CAF50",
            color: "white",
            padding: "5px 10px",
            borderRadius: "10px"
          }}>
            {getRoleName()}
          </span>
        </p>
      </div>

      {/* MANUFACTURER ADD PRODUCT */}
      {role === "2" && (
        <div style={card}>
          <h3>Add Product</h3>
          <input
            placeholder="Product Name"
            style={input}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Description"
            style={input}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button style={btn} onClick={addProduct}>
            + Add Product
          </button>
        </div>
      )}

      {/* PRODUCTS */}
      <h2>📦 Products</h2>

      {products.map((item, i) => (
        <div key={i} style={card}>
          <h3>{item.name}</h3>
          <p>{item.description}</p>

          {/* TIMELINE */}
          {renderTimeline(parseInt(item.stage))}

          {/* ROLE ACTIONS */}
          <div style={{ marginTop: "10px" }}>

            {role === "1" && (
              <button style={btn} onClick={() => RMSsupply(item.id)}>
                Receive Product
              </button>
            )}

            {role === "2" && (
              <button style={btn} onClick={() => Manufacturing(item.id)}>
                Manufacture
              </button>
            )}

            {role === "3" && (
              <button style={btn} onClick={() => Distribute(item.id)}>
                Distribute
              </button>
            )}

            {role === "4" && (
              <button style={btn} onClick={() => Retail(item.id)}>
                Send to Customer
              </button>
            )}

            {role === "5" && (
              <p style={{ color: "gray" }}>View Only 👀</p>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}

// 🎨 STYLES
const card = {
  background: "white",
  padding: "20px",
  margin: "15px 0",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)"
};

const input = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "10px 0"
};

const btn = {
  padding: "10px 15px",
  background: "#4CAF50",
  color: "white",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px"
};

export default Dashboard;