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
  loadProducts(contract);
};
  const role = localStorage.getItem("role");
  // 🔥 REAL ANALYTICS

const totalTransactions = products.reduce(
  (sum, p) => sum + parseInt(p.stage),
  0
);

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
  setAccount(accounts[0]);

  // 🔥 IMPORTANT CHANGE (dynamic network)
  const networkId = await web3.eth.net.getId();
  const network = SupplyChain.networks[networkId];

  console.log("NETWORK:", network);

  if (!network) {
    alert("Contract not deployed on this network");
    return;
  }

  const instance = new web3.eth.Contract(
    SupplyChain.abi,
    network.address
  );

  // 🔥 DEBUG (CRITICAL)
  console.log("METHODS:", Object.keys(instance.methods));
  console.log("requestMedicine:", instance.methods.requestMedicine);

  setContract(instance);
  loadProducts(instance);
};
    
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(username);
  const loadProducts = async (instance) => {
    let items = [];

    for (let i = 1; i <= 20; i++) {
      try {
        let data = await instance.methods.MedicineStock(i).call();
        if (data.id !== "0") items.push(data);
      } catch {}
    }

    const filtered = items.filter(item => {
  if (role === "5") {
    return item.customer?.toLowerCase() === account.toLowerCase();
  }
  return true;
});

setProducts(filtered);
  };

  // 🔥 ACTIONS
const requestMedicine = async (name, desc) => {
  await contract.methods.requestMedicine(name, desc).send({ from: account });
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

  // 📋 REPORTS VIEW
  const ReportsView = () => (
    <div>
      <h1 style={{ margin: "0 0 8px 0", color: "white", fontSize: "32px", fontWeight: "700" }}>Reports</h1>
      <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "14px" }}>View detailed supply chain reports</p>
      
      <div style={{
        background: "#1e293b",
        borderRadius: "12px",
        border: "1px solid #334155",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          {["Inventory Report", "Delivery Report", "Cost Analysis", "Supplier Performance"].map((report) => (
            <button key={report} style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #334155",
              background: "#0f172a",
              color: "white",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "600",
              transition: "all 0.3s"
            }} onMouseEnter={(e) => e.target.style.background = "#0d9488"} onMouseLeave={(e) => e.target.style.background = "#0f172a"}>
              📄 {report}
            </button>
          ))}
        </div>
        <div style={{ height: "200px", background: "#0f172a", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
          Reports will load here
        </div>
      </div>
    </div>
  );

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
    { name: "Paracetamol", desc: "Fever & pain relief" },
    { name: "Crocin", desc: "Cold & fever medicine" },
    { name: "Azithromycin", desc: "Antibiotic" },
    { name: "Vitamin C", desc: "Immunity booster" }
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
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ color: "white" }}>Supply Chain Dashboard</h1>
        <p style={{ color: "#94a3b8" }}>Manage and track products</p>
      </div>

      {/* 🔥 CUSTOMER PRODUCT SELECTION */}
      {role === "5" && (
        <div style={{
          background: "#1e293b",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "40px",
          border: "1px solid #334155"
        }}>
          <h2 style={{ color: "white", marginBottom: "20px" }}>
            Select Product
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px"
          }}>
            {availableProducts.map((p, index) => (
              <div key={index} style={{
                background: "#0f172a",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #334155"
              }}>
                <h3 style={{ color: "white" }}>{p.name}</h3>
                <p style={{ color: "#94a3b8", fontSize: "12px" }}>
                  {p.desc}
                </p>

                <button
                  onClick={() => requestMedicine(p.name, p.desc)}
                  style={{ ...btnStyle, marginTop: "10px" }}
                >
                  Order
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER BUTTONS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {["all", "in-progress", "completed", "pending"].map((filter) => (
          <button key={filter} onClick={() => setStatusFilter(filter)}>
            {filter}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <table style={{ width: "100%", color: "white" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Stage</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{getStageName(item.stage)}</td>
              <td>
                <ActionButton item={item} role={role} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
  return <span style={disabledStyle}>View Only</span>;
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
        <div onClick={() => setActiveTab("reports")} style={{ fontSize: "14px", cursor: "pointer", opacity: activeTab === "reports" ? 1 : 0.5, transition: "all 0.3s", padding: "10px", background: activeTab === "reports" ? "#8b5a6e" : "transparent", borderRadius: "10px", color: "white", fontWeight: "700", title: "Reports" }}>R</div>
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
          {activeTab === "reports" && <ReportsView />}
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

