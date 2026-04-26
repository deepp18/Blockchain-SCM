import React, { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import SupplyChain from "../contracts/SupplyChain.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
console.log("ABI CHECK:", SupplyChain.abi);
function Dashboard() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [name, setName] = useState("");
  const nameRef = useRef(null);
  const descRef = useRef(null);
  const username = localStorage.getItem("username") || "User";
const email = localStorage.getItem("email") || "user@email.com";
  const [desc, setDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("products"); // Track active tab
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const availableProducts = [
  { name: "Paracetamol", desc: "Fever & pain relief" },
  { name: "Crocin", desc: "Cold & fever medicine" },
  { name: "Azithromycin", desc: "Antibiotic" },
  { name: "Vitamin C", desc: "Immunity booster" }
];
  const [notifications] = useState([
    { id: 1, message: "Product #1 moved to manufacturing", time: "2 hours ago" },
    { id: 2, message: "New order received", time: "5 hours ago" },
    { id: 3, message: "Delivery completed", time: "1 day ago" }
  ]);
  const approveMedicine = async (id) => {
  await contract.methods.approveMedicine(id).send({ from: account });
  loadProducts(contract, account);
};
  const role = localStorage.getItem("role");
  // 🔥 REAL ANALYTICS

const totalTransactions = products.reduce(
  (sum, p) => sum + parseInt(p.stage),
  0
);
const [quantities, setQuantities] = useState({});

const handleQuantityChange = (index, delta) => {
  setQuantities(prev => ({
    ...prev,
    [index]: Math.max(1, (prev[index] || 1) + delta)
  }));
};
const deliveredCount = products.filter(
  p => parseInt(p.stage) === 5
).length;

const inProgressCount = products.filter(
  p => parseInt(p.stage) > 0 && parseInt(p.stage) < 5
).length;

const pendingCount = products.filter(
  p => parseInt(p.stage) === 0
).length;
  const chartData = [
  { name: "Pending", value: pendingCount },
  { name: "In Progress", value: inProgressCount },
  { name: "Delivered", value: deliveredCount }
];

const successRate =
  products.length > 0
    ? ((deliveredCount / products.length) * 100).toFixed(1)
    : 0;
  useEffect(() => {
    loadBlockchain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  if (nameRef.current) {
    nameRef.current.focus();
  }
}, [name]);

useEffect(() => {
  if (descRef.current) {
    descRef.current.focus();
  }
}, [desc]);

 const loadBlockchain = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  const web3 = new Web3(window.ethereum);
  await window.ethereum.request({ method: "eth_requestAccounts" });

  const accounts = await web3.eth.getAccounts();
  const currentAccount = accounts[0];
  setAccount(currentAccount);
  localStorage.setItem("user_" + currentAccount, username);

  const networkId = await web3.eth.net.getId();
  const network = SupplyChain.networks[networkId];

  if (!network) {
    alert("Contract not deployed on this network");
    return;
  }

  const instance = new web3.eth.Contract(
    SupplyChain.abi,
    network.address
  );

  setContract(instance);

  // ✅ PASS ACCOUNT DIRECTLY (IMPORTANT)
  loadProducts(instance, currentAccount);
};
    
  const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(username);
 const loadProducts = async (instance, currentAccount) => {
  let items = [];

  let count = await instance.methods.medicineCtr().call();
  count = parseInt(count) || 0;
  if (count > 1000) count = 1000; // Safety limit
  
  console.log("TOTAL COUNT:", count);

  for (let i = 1; i <= count; i++) {
    try {
      let data = await instance.methods.MedicineStock(i).call();

      if (parseInt(data.id) > 0) {
        items.push(data);
      }

      // Add a small delay to prevent "RPC endpoint returned too many errors"
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (e) {
      console.error("Error at ID:", i, e);
    }
  }

  console.log("ITEMS BEFORE FILTER:", items);

const filtered = items.filter(item => {
  if (role === "5") {
    return (
      item.customer &&
      currentAccount &&
      item.customer.toLowerCase() === currentAccount.toLowerCase()
    );
  }
  return true;
});

  console.log("FINAL PRODUCTS:", filtered);

  setProducts(filtered);
};

  // 🔥 ACTIONS
const requestMedicine = async (name, desc, qty = 1) => {
  const fullDesc = `${desc} | Qty: ${qty}`;
  await contract.methods.requestMedicine(name, fullDesc).send({ from: account });
  loadProducts(contract,account);
  
};
const registerCustomer = async () => {
  try {
    await contract.methods.registerRole(5).send({ from: account });
    console.log("✅ Registered as Customer");
  } catch (err) {
    console.error("❌ Role error:", err);
  }
};

  const RMSsupply = async (id) => {
    await contract.methods.RMSsupply(id).send({ from: account });
    loadProducts(contract,account);
  };

  const Manufacturing = async (id) => {
    await contract.methods.Manufacturing(id).send({ from: account });
    loadProducts(contract,account);
  };

  const Distribute = async (id) => {
    await contract.methods.Distribute(id).send({ from: account });
    loadProducts(contract,account );
  };

  const Retail = async (id) => {
    await contract.methods.Retail(id).send({ from: account });
    loadProducts(contract,account);
  };
  const sold = async (id) => {
  await contract.methods.sold(id).send({ from: account });
  loadProducts(contract,account );
};
  // 🔓 LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("role");
    window.location.href = "/";
  };

  // 📊 ANALYTICS VIEW
  const AnalyticsView = () => (
    <div>
      <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: "32px", fontWeight: "700" }}>Analytics Dashboard</h1>
      <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px" }}>Track supply chain metrics and performance</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <MetricCard title="Total Transactions" value={totalTransactions} icon="💳" growth="Live" />

<MetricCard title="In Progress" value={inProgressCount} icon="⏳" growth="Live" />

<MetricCard title="Delivered Products" value={deliveredCount} icon="📦" growth="Live" />

<MetricCard title="Success Rate" value={`${successRate}%`} icon="✅" growth="Live" isText={true} />
      </div>

      <div style={{
        background: "#1e293b",
        borderRadius: "12px",
        border: "1px solid #334155",
        padding: "24px"
      }}>
        <h3 style={{ margin: "0 0 20px 0", color: "white", fontSize: "20px", fontWeight: "700" }}>Monthly Performance</h3>
        <div style={{ height: "300px", background: "#0f172a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          <div style={{ height: "300px" }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData}>
      <XAxis dataKey="name" stroke="#94a3b8" />
      <YAxis stroke="#94a3b8" />
      <Tooltip />
      <Bar dataKey="value" />
    </BarChart>
  </ResponsiveContainer>
</div>
        </div>
      </div>
    </div>
  );

  // 📜 TRANSACTION HISTORY VIEW
  const TransactionHistoryView = () => {
    // Sort products by ID descending (newest first)
    const sortedProducts = [...products].sort((a, b) => parseInt(b.id) - parseInt(a.id));

    return (
      <div>
        <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: "32px", fontWeight: "700" }}>Transaction History</h1>
        <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px" }}>View history of all product transactions and state changes</p>
        
        <div style={{
          background: "#1e293b",
          borderRadius: "12px",
          border: "1px solid #334155",
          padding: "24px",
          marginBottom: "24px"
        }}>
          {sortedProducts.length === 0 ? (
            <div style={{ height: "200px", background: "#0f172a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              No transactions found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {sortedProducts.map(item => {
                const safeDesc = item.description || "";
                const parsedDesc = safeDesc.split(" | Qty: ")[0];
                const parsedQty = safeDesc.includes(" | Qty: ") ? safeDesc.split(" | Qty: ")[1] : (item.quantity || 1);
                
                return (
                  <div key={item.id} style={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                        <span style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>#{item.id} {item.name}</span>
                        <span style={{
                          background: "#0d9488",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600"
                        }}>
                          {getStageName(item.stage)}
                        </span>
                      </div>
                      <p style={{ margin: "0", color: "#94a3b8", fontSize: "13px" }}>
                        {parsedDesc} • Qty: {parsedQty}
                      </p>
                      {/* Show customer info for roles that are not 5 */}
                      {role !== "5" && (
                         <p style={{ margin: "8px 0 0 0", color: "#64748b", fontSize: "12px" }}>
                           Customer: {getCustomerName(item.customer)}
                         </p>
                      )}
                    </div>
                    
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 4px 0", color: "#94a3b8", fontSize: "12px" }}>Status</p>
                      <span style={{
                        color: "#f59e0b",
                        fontSize: "14px",
                        fontWeight: "600",
                        background: "#f59e0b20",
                        padding: "4px 8px",
                        borderRadius: "8px"
                      }}>
                        {getStatusLabel(item.stage)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ⚙️ SETTINGS VIEW
  const SettingsView = () => (
  <div>
    <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: "32px", fontWeight: "700" }}>
      Settings
    </h1>
    <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px" }}>
      Manage your blockchain account and system details
    </p>

    {/* ACCOUNT INFO */}
    <div style={{
      background: "#1e293b",
      borderRadius: "12px",
      border: "1px solid #334155",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h3 style={{ color: "white", marginBottom: "16px" }}>Account Info</h3>

      <p style={{ color: "#94a3b8", fontSize: "12px" }}>Wallet Address</p>
      <p style={{ color: "white", marginBottom: "12px" }}>
        {account}
      </p>

      <button
        onClick={() => navigator.clipboard.writeText(account)}
        style={{
          padding: "6px 12px",
          background: "#0d9488",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px"
        }}
      >
        Copy Address
      </button>

      <hr style={{ margin: "20px 0", borderColor: "#334155" }} />

      <p style={{ color: "#94a3b8", fontSize: "12px" }}>Role</p>
      <p style={{ color: "white" }}>{getRoleName()}</p>

    </div>

    {/* NETWORK INFO */}
    <div style={{
      background: "#1e293b",
      borderRadius: "12px",
      border: "1px solid #334155",
      padding: "24px",
      marginBottom: "24px"
    }}>
      <h3 style={{ color: "white", marginBottom: "16px" }}>Blockchain Info</h3>

      <p style={{ color: "#94a3b8", fontSize: "12px" }}>Network</p>
      <p style={{ color: "white" }}>Ganache Local Network</p>

      <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "12px" }}>
        Smart Contract
      </p>
      <p style={{ color: "white", wordBreak: "break-all" }}>
        {contract?._address || "Not Connected"}
      </p>
    </div>

    {/* ACTIONS */}
    <div style={{
      background: "#1e293b",
      borderRadius: "12px",
      border: "1px solid #334155",
      padding: "24px"
    }}>
      <h3 style={{ color: "white", marginBottom: "16px" }}>Actions</h3>

      <button
        onClick={handleLogout}
        style={{
          padding: "10px 20px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Logout
      </button>
    </div>
  </div>
);
  // 👤 PROFILE VIEW
  const ProfileView = () => (
    <div>
      <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: "32px", fontWeight: "700" }}>Profile</h1>
      <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px" }}>Your profile and activity information</p>
      
      <div style={{
        background: "#1e293b",
        borderRadius: "12px",
        border: "1px solid #334155",
        padding: "24px",
        marginBottom: "24px",
        textAlign: "center"
      }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #0d9488, #14b8a6)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "40px" }}>
          👤
        </div>
        <h2 style={{ margin: "0 0 4px 0", color: "white", fontSize: "20px", fontWeight: "700" }}></h2>
        {isEditing ? (
  <input
    
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid #334155",
      background: "#0f172a",
      color: "white",
      textAlign: "center"
    }}
  />
) : (
  <h2 style={{ color: "white" }}>
    {username
      ? username
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "User"}
  </h2>
)}

<div style={{ marginTop: "10px" }}>
  {isEditing ? (
    <>
      <button
        onClick={() => {
          localStorage.setItem("username", newName);
          setIsEditing(false);
          window.location.reload(); // refresh UI
        }}
        style={{
          padding: "6px 12px",
          background: "#0d9488",
          color: "white",
          border: "none",
          borderRadius: "6px",
          marginRight: "8px",
          cursor: "pointer"
        }}
      >
        Save
      </button>

      <button
        onClick={() => {
          setIsEditing(false);
          setNewName(username);
        }}
        style={{
          padding: "6px 12px",
          background: "#64748b",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </>
  ) : (
    <button
      onClick={() => setIsEditing(true)}
      style={{
        padding: "6px 12px",
        background: "#0d9488",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer"
      }}
    >
      Edit Profile
    </button>
  )}
</div>
<p style={{ color: "#94a3b8", fontSize: "14px" }}>
  {email}
</p>

<p style={{ color: "#64748b", fontSize: "12px", marginBottom: "10px" }}>
  {getRoleName()}
</p>
        <p style={{ margin: "0", color: "#64748b", fontSize: "12px" }}>Account Address: {account.substring(0, 10)}...{account.substring(-8)}</p>
      </div>
    </div>
  );

  // 📦 PRODUCTS VIEW (default)
  
  const ProductsView = () => {

  const availableProducts = [
    { name: "Paracetamol", desc: "Fever & pain relief", image: "https://placehold.co/400x300/1e293b/0d9488?text=Paracetamol" },
    { name: "Crocin", desc: "Cold & fever medicine", image: "https://placehold.co/400x300/1e293b/0d9488?text=Crocin" },
    { name: "Azithromycin", desc: "Antibiotic", image: "https://placehold.co/400x300/1e293b/0d9488?text=Azithromycin" },
    { name: "Vitamin C", desc: "Immunity booster", image: "https://placehold.co/400x300/1e293b/0d9488?text=Vitamin+C" },
    { name: "Ibuprofen", desc: "Anti-inflammatory", image: "https://placehold.co/400x300/1e293b/0d9488?text=Ibuprofen" },
    { name: "Amoxicillin", desc: "Bacterial infection", image: "https://placehold.co/400x300/1e293b/0d9488?text=Amoxicillin" },
    { name: "Cetirizine", desc: "Allergy relief", image: "https://placehold.co/400x300/1e293b/0d9488?text=Cetirizine" },
    { name: "Omeprazole", desc: "Acid reflux medication", image: "https://placehold.co/400x300/1e293b/0d9488?text=Omeprazole" },
    { name: "Metformin", desc: "Diabetes management", image: "https://placehold.co/400x300/1e293b/0d9488?text=Metformin" },
    { name: "Amlodipine", desc: "Blood pressure medicine", image: "https://placehold.co/400x300/1e293b/0d9488?text=Amlodipine" },
    { name: "Aspirin", desc: "Pain & blood thinner", image: "https://placehold.co/400x300/1e293b/0d9488?text=Aspirin" },
    { name: "Vitamin D3", desc: "Bone health", image: "https://placehold.co/400x300/1e293b/0d9488?text=Vitamin+D3" },
    { name: "Cough Syrup", desc: "Dry cough relief", image: "https://placehold.co/400x300/1e293b/0d9488?text=Cough+Syrup" },
    { name: "B-Complex", desc: "Energy metabolism", image: "https://placehold.co/400x300/1e293b/0d9488?text=B-Complex" },
    { name: "Antacid Gel", desc: "Stomach relief", image: "https://placehold.co/400x300/1e293b/0d9488?text=Antacid+Gel" },
    { name: "Eye Drops", desc: "Dry eye relief", image: "https://placehold.co/400x300/1e293b/0d9488?text=Eye+Drops" }
  ];

  const filteredProducts = products.filter((item) => {
    const stage = parseInt(item.stage);

    if (statusFilter === "all") return true;
    if (statusFilter === "completed") return stage === 6;
    if (statusFilter === "in-progress") return stage > 0 && stage < 6;
    if (statusFilter === "pending") return stage === 0;

    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: "32px", fontWeight: "700" }}>Supply Chain Dashboard</h1>
        <p style={{ margin: "0", color: "#94a3b8", fontSize: "14px" }}>Manage and track products across the supply chain</p>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <MetricCard title="Total Products" value={products.length} icon="📦" growth="+12% vs last month" />
        <MetricCard title="In Transit" value={inProgressCount} icon="🚚" growth="-8% vs last month" />
        <MetricCard title="Delivered" value={deliveredCount} icon="✅" growth="+24% vs last month" />
        <MetricCard title="Your Role" value={getRoleName()} icon="👤" growth="Active" isText={true} />
      </div>

      {/* 🔥 CUSTOMER PRODUCT SELECTION */}
      {role === "5" && (
  <div
    style={{
      background: "#1e293b",
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "40px",
      border: "1px solid #334155"
    }}
  >
    <h2 style={{ color: "white", marginBottom: "20px" }}>
      Select Product
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px"
      }}
    >
      {availableProducts.map((p, index) => (
        <div
          key={index}
          style={{
            background: "#0f172a",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #334155"
          }}
        >
          <img src={p.image} alt={p.name} style={{ width: "100%", borderRadius: "6px", marginBottom: "12px", objectFit: "cover", height: "120px" }} />
          <h3 style={{ color: "white", margin: "0 0 4px 0", fontSize: "16px" }}>{p.name}</h3>

          <p style={{ color: "#94a3b8", fontSize: "12px", margin: "0" }}>
            {p.desc}
          </p>

          {/* ✅ QUANTITY INPUT */}
          <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: "600" }}>Qty:</span>
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "#020617",
              borderRadius: "8px",
              border: "1px solid #334155",
              overflow: "hidden",
              flex: 1
            }}>
              <button 
                onClick={() => handleQuantityChange(index, -1)}
                style={{
                  background: "transparent", border: "none", borderRight: "1px solid #334155", color: "white", padding: "8px 16px", cursor: "pointer", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >-</button>
              <span style={{ color: "white", flex: 1, textAlign: "center", fontWeight: "600", fontSize: "14px" }}>{quantities[index] || 1}</span>
              <button 
                onClick={() => handleQuantityChange(index, 1)}
                style={{
                  background: "transparent", border: "none", borderLeft: "1px solid #334155", color: "white", padding: "8px 16px", cursor: "pointer", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >+</button>
            </div>
          </div>

          {/* ✅ ORDER BUTTON */}
          <button
            onClick={async () => {
              await registerCustomer();
              await requestMedicine(p.name, p.desc, quantities[index] || 1);
            }}
            style={{ ...btnStyle, marginTop: "16px", width: "100%", background: "linear-gradient(135deg, #0d9488, #14b8a6)" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
          >
            Order Now
          </button>
        </div>
      ))}
    </div>
  </div>
)}

      {/* FILTER BUTTONS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { key: "all", label: "ALL PRODUCTS" },
          { key: "in-progress", label: "IN PROGRESS" },
          { key: "completed", label: "COMPLETED" },
          { key: "pending", label: "PENDING" }
        ].map((filter) => (
          <button 
            key={filter.key} 
            onClick={() => setStatusFilter(filter.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: statusFilter === filter.key ? "1px solid #0d9488" : "1px solid #334155",
              background: statusFilter === filter.key ? "#8b5a6e" : "#0f172a",
              color: "white",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              if (statusFilter !== filter.key) {
                e.target.style.background = "#1e293b";
              }
            }}
            onMouseLeave={(e) => {
              if (statusFilter !== filter.key) {
                e.target.style.background = "#0f172a";
              }
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={{
        background: "#1e293b",
        borderRadius: "12px",
        border: "1px solid #334155",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", color: "white", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f172a", borderBottom: "1px solid #334155" }}>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Product ID</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Name</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Description</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Customer Name</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Quantity</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Stage</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "16px", textAlign: "left", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((item) => {
              const safeDesc = item.description || "";
              const parsedDesc = safeDesc.split(" | Qty: ")[0];
              const parsedQty = safeDesc.includes(" | Qty: ") ? safeDesc.split(" | Qty: ")[1] : (item.quantity || 1);
              return (
              <tr key={item.id} onClick={() => setSelectedProduct(item)}style={{ borderBottom: "1px solid #334155", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "16px" }}>#{item.id}</td>
                <td style={{ padding: "16px" }}>{item.name}</td>
                <td style={{ padding: "16px", color: "#94a3b8", fontSize: "13px" }}>{parsedDesc}</td>
                <td style={{ padding: "16px", color: "white", fontSize: "13px" }}>{getCustomerName(item.customer)}</td>
                <td style={{ padding: "16px", color: "white", fontSize: "13px", fontWeight: "600" }}>{parsedQty}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    background: "#0d9488",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {getStageName(item.stage)}
                  </span>
                </td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    background: "#f59e0b",
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600"
                  }}>
                    {getStatusLabel(item.stage)}
                  </span>
                </td>
                <td style={{ padding: "16px" }}>
                  <ActionButton item={item} role={role} />
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {selectedProduct && (
  <div style={{
    marginTop: "30px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #334155"
  }}>
    <h3 style={{ color: "white" }}>
      Product #{selectedProduct.id} Status Timeline
    </h3>

    {renderTimeline(parseInt(selectedProduct.stage))}
  </div>
)}
      </div>
    </div>
  );
};
  // 🔥 STAGE NAME HELPER
const getStageName = (stage) => {
  switch (parseInt(stage)) {
    case 0: return "Requested";
    case 1: return "Approved";
    case 2: return "Raw Material";
    case 3: return "Manufactured";
    case 4: return "Distributed";
    case 5: return "Retail";
    case 6: return "Sold";
    default: return "Unknown";
  }
};

// 🔥 STATUS LABEL HELPER
const getStatusLabel = (stage) => {
  switch (parseInt(stage)) {
    case 0: return "Pending";
    case 1: return "Approved";
    case 2: return "Raw Material Supplied";
    case 3: return "Manufactured";
    case 4: return "In Transit";
    case 5: return "Delivered";
    case 6: return "Completed";
    default: return "Waiting";
  }
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
const getCustomerName = (address) => {
  if (!address) return "Unknown";

  const name = localStorage.getItem("user_" + address);
  return name || address.substring(0, 6) + "...";
};

  // ACTION BUTTON COMPONENT
const ActionButton = ({ item, role }) => {
  const stage = parseInt(item.stage);

  // Supplier → only when stage = 0
  if (role === "1") {
  if (stage !== 1) return <span style={disabledStyle}>Waiting</span>;
  return <button onClick={() => RMSsupply(item.id)} style={btn}>Supply</button>;
}

  // Manufacturer → only when stage = 1
 // Manufacturer
if (role === "2") {
  if (stage === 0) {
    return <button onClick={() => approveMedicine(item.id)} style={btn}>Approve</button>;
  }
  if (stage !== 2) return <span style={disabledStyle}>Waiting</span>;
  return <button onClick={() => Manufacturing(item.id)} style={btn}>Manufacture</button>;
}

  // Distributor → only when stage = 2
  if (role === "3") {
    if (stage !== 2) return <span style={disabledStyle}>Waiting</span>;
    return <button onClick={() => Distribute(item.id)} style={btn}>Distribute</button>;
  }

  // Retailer → only when stage = 3
  if (role === "4") {
    if (stage !== 3) return <span style={disabledStyle}>Waiting</span>;
    return <button onClick={() => Retail(item.id)} style={btn}>Retail</button>;
  }

  // Customer → only view
  if (role === "5") {
  if (stage === 5) {
    return (
      <button onClick={() => sold(item.id)} style={btn}>
        Mark Sold
      </button>
    );
  }
  return <span style={disabledStyle}>View Only</span>;
}
};

  // METRIC CARD COMPONENT
  const MetricCard = ({ title, value, icon, growth, isText }) => (
    <div style={{
      background: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "12px",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        top: "-40px",
        right: "-40px",
        fontSize: "80px",
        opacity: 0.1
      }}>
        {icon}
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ margin: "0 0 12px 0", color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase" }}>
          {title}
        </p>
        <h3 style={{ margin: "0", color: "white", fontSize: "36px", fontWeight: "700", marginBottom: "8px" }}>
          {isText ? value : value.toString().padStart(2, "0")}
        </h3>
        {!isText && (
          <p style={{ margin: "0", color: "#10b981", fontSize: "12px", fontWeight: "600" }}>
            {growth} vs last month
          </p>
        )}
      </div>
    </div>
  );

  // 📦 STAGE TIMELINE
  const renderTimeline = (stage) => {
    const stages = [
  { name: "Requested", icon: "📝" },
  { name: "Approved", icon: "✅" },
  { name: "Raw Material", icon: "📦" },
  { name: "Manufactured", icon: "🏭" },
  { name: "Distributed", icon: "🚚" },
  { name: "Retail", icon: "🏪" },
  { name: "Sold", icon: "🎉" }
];

    return (
      <div style={{ marginTop: "24px", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
          {stages.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
              <div style={{
                width: "36px",
                height: "36px",
                margin: "0 auto 8px",
                borderRadius: "50%",
                backgroundColor: i <= stage ? "#0d9488" : "#334155",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                transition: "all 0.3s ease",
                border: "2px solid #0f172a"
              }}>
                {s.icon}
              </div>
              <div style={{
                fontSize: "10px",
                fontWeight: i <= stage ? "600" : "400",
                color: i <= stage ? "#0d9488" : "#64748b"
              }}>
                {s.name}
              </div>
              {i < stages.length - 1 && (
                <div style={{
                  position: "absolute",
                  top: "18px",
                  left: "50%",
                  width: "calc(100% - 18px)",
                  height: "2px",
                  backgroundColor: i < stage ? "#0d9488" : "#334155",
                  transition: "background-color 0.3s ease"
                }}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", background: "#0f172a", minHeight: "100vh", fontFamily: "'Sanchez', serif", letterSpacing: "0px" }}>
      
      {/* SIDEBAR */}
      <div style={{
        width: "80px",
        background: "#1e293b",
        borderRight: "1px solid #334155",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        gap: "20px"
      }}>
        <div onClick={() => setActiveTab("products")} style={{ fontSize: "24px", padding: "10px", background: activeTab === "products" ? "#8b5a6e" : "transparent", borderRadius: "10px", color: "white", cursor: "pointer", transition: "all 0.3s", opacity: activeTab === "products" ? 1 : 0.5, title: "Products" }}>P</div>
        <div onClick={() => setActiveTab("analytics")} style={{ fontSize: "14px", cursor: "pointer", opacity: activeTab === "analytics" ? 1 : 0.5, transition: "all 0.3s", padding: "10px", background: activeTab === "analytics" ? "#8b5a6e" : "transparent", borderRadius: "10px", color: "white", fontWeight: "700", title: "Analytics" }}>A</div>
        <div onClick={() => setActiveTab("history")} style={{ fontSize: "14px", cursor: "pointer", opacity: activeTab === "history" ? 1 : 0.5, transition: "all 0.3s", padding: "10px", background: activeTab === "history" ? "#8b5a6e" : "transparent", borderRadius: "10px", color: "white", fontWeight: "700", title: "History" }}>H</div>
        <div onClick={() => setActiveTab("settings")} style={{ fontSize: "14px", cursor: "pointer", opacity: activeTab === "settings" ? 1 : 0.5, transition: "all 0.3s", padding: "10px", background: activeTab === "settings" ? "#8b5a6e" : "transparent", borderRadius: "10px", color: "white", fontWeight: "700", title: "Settings" }}>S</div>
        <div onClick={() => setActiveTab("profile")} style={{ marginTop: "auto", fontSize: "14px", cursor: "pointer", opacity: activeTab === "profile" ? 1 : 0.5, transition: "all 0.3s", padding: "10px", background: activeTab === "profile" ? "#8b5a6e" : "transparent", borderRadius: "10px", color: "white", fontWeight: "700", title: "Profile" }}>U</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* TOP HEADER */}
        <div style={{
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <input
            
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "10px 16px",
                color: "white",
                width: "300px",
                fontSize: "14px"
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", position: "relative" }}>
            {/* NOTIFICATIONS */}
            <div style={{ cursor: "pointer", fontSize: "20px", position: "relative" }} onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              {notifications.length > 0 && <span style={{ position: "absolute", top: "-8px", right: "-8px", background: "#dc2626", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>{notifications.length}</span>}
            </div>

            {/* NOTIFICATIONS DROPDOWN */}
            {showNotifications && (
              <div style={{
                position: "absolute",
                top: "70px",
                right: "60px",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "12px",
                width: "300px",
                maxHeight: "400px",
                overflow: "auto",
                zIndex: 1000,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
              }}>
                <div style={{ padding: "12px", borderBottom: "1px solid #334155" }}>
                  <h3 style={{ margin: "0", color: "white", fontSize: "14px", fontWeight: "700" }}>Notifications</h3>
                </div>
                {notifications.map((notif) => (
                  <div key={notif.id} style={{ padding: "12px", borderBottom: "1px solid #334155", cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                    <p style={{ margin: "0", color: "white", fontSize: "13px" }}>{notif.message}</p>
                    <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "11px" }}>{notif.time}</p>
                  </div>
                ))}
                <div style={{ padding: "12px", textAlign: "center", borderTop: "1px solid #334155" }}>
                  <button style={{ background: "transparent", border: "none", color: "#0d9488", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>View All Notifications →</button>
                </div>
              </div>
            )}

            {/* PROFILE MENU */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", position: "relative" }} onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #0d9488, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px" }}>👤</div>
              <div>
                <p style={{ margin: "0", color: "white", fontSize: "14px", fontWeight: "600" }}>
  {(username?.charAt(0).toUpperCase() + username?.slice(1)) || "User"}
</p>
                <p style={{ margin: "0", color: "#94a3b8", fontSize: "12px" }}>{getRoleName()}</p>
              </div>
            </div>

            {/* PROFILE DROPDOWN */}
            {showProfileMenu && (
              <div style={{
                position: "absolute",
                top: "70px",
                right: "0",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "12px",
                width: "200px",
                zIndex: 1000,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
              }}>
                <div style={{ padding: "12px" }}>
                  <button onClick={() => { setActiveTab("profile"); setShowProfileMenu(false); }} style={{ width: "100%", padding: "10px", background: "#8b5a6e", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "13px", marginBottom: "8px", transition: "background 0.2s", fontWeight: "700", fontFamily: "'League Spartan', sans-serif", textTransform: "uppercase", letterSpacing: "-0.3px" }} onMouseEnter={(e) => e.target.style.background = "#9d6a7e"} onMouseLeave={(e) => e.target.style.background = "#8b5a6e"}>
                    View Profile
                  </button>
                  <button onClick={() => { setActiveTab("settings"); setShowProfileMenu(false); }} style={{ width: "100%", padding: "10px", background: "#8b5a6e", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "13px", marginBottom: "8px", transition: "background 0.2s", fontWeight: "700", fontFamily: "'League Spartan', sans-serif", textTransform: "uppercase", letterSpacing: "-0.3px" }} onMouseEnter={(e) => e.target.style.background = "#9d6a7e"} onMouseLeave={(e) => e.target.style.background = "#8b5a6e"}>
                    Settings
                  </button>
                  <button style={{ width: "100%", padding: "10px", background: "#8b5a6e", border: "none", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "13px", transition: "background 0.2s", fontWeight: "700", fontFamily: "'League Spartan', sans-serif", textTransform: "uppercase", letterSpacing: "-0.3px" }} onClick={handleLogout} onMouseEnter={(e) => e.target.style.background = "#9d6a7e"} onMouseLeave={(e) => e.target.style.background = "#8b5a6e"}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, overflow: "auto", padding: "40px" }}>
          
          {/* RENDER DIFFERENT VIEWS BASED ON ACTIVE TAB */}
          {activeTab === "products" && <ProductsView />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "history" && <TransactionHistoryView />}
          {activeTab === "settings" && <SettingsView />}
          {activeTab === "profile" && <ProfileView />}
          
        </div>
      </div>
    </div>
  );
}

// DARK THEME STYLES
const inputStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "8px",
  padding: "12px 14px",
  color: "white",
  fontSize: "14px",
  fontFamily: "'Sanchez', serif",
  transition: "all 0.3s",
  boxSizing: "border-box"
};

const btnStyle = {
  background: "#0d9488",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "12px 20px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  fontFamily: "'League Spartan', sans-serif",
  transition: "all 0.3s",
  minWidth: "120px"
};
const disabledStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase"
};

const btn = {
  background: "#8b5a6e",
  color: "white",
  border: "none",
  borderRadius: "8px",
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "700"
};

export default Dashboard;

