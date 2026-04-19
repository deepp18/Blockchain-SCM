// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {

    address public Owner;

    constructor() public {
        Owner = msg.sender;
    }

    // 🔥 ROLE SYSTEM
    enum ROLE {
        None,
        Supplier,
        Manufacturer,
        Distributor,
        Retailer,
        Customer
    }

    mapping(address => ROLE) public roles;

    function registerRole(uint _role) public {
        require(_role > 0 && _role <= 5, "Invalid role");
        roles[msg.sender] = ROLE(_role);
    }

    modifier onlyRole(ROLE _role) {
    _;
}

    // 🔥 UPDATED STAGES
    enum STAGE {
        Requested,          // 0
        Approved,           // 1
        RawMaterialSupply,  // 2
        Manufacture,        // 3
        Distribution,       // 4
        Retail,             // 5
        Sold                // 6
    }

    uint256 public medicineCtr = 0;

    struct medicine {
        uint256 id;
        string name;
        string description;
        address customer;      // 🔥 NEW
        address supplier;
        address manufacturer;
        address distributor;
        address retailer;
        STAGE stage;
    }

    mapping(uint256 => medicine) public MedicineStock;

    // 🔥 1. CUSTOMER REQUEST
    function requestMedicine(string memory _name, string memory _description)
        public
        onlyRole(ROLE.Customer)
    {
        medicineCtr++;

        MedicineStock[medicineCtr] = medicine(
            medicineCtr,
            _name,
            _description,
            msg.sender,
            address(0),
            address(0),
            address(0),
            address(0),
            STAGE.Requested
        );
    }

    // 🔥 2. MANUFACTURER APPROVES
    function approveMedicine(uint256 _medicineID)
        public
        onlyRole(ROLE.Manufacturer)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.Requested,
            "Not requested"
        );

        MedicineStock[_medicineID].manufacturer = msg.sender;
        MedicineStock[_medicineID].stage = STAGE.Approved;
    }

    // 🔥 3. SUPPLIER
    function RMSsupply(uint256 _medicineID)
        public
        onlyRole(ROLE.Supplier)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.Approved,
            "Not approved"
        );

        MedicineStock[_medicineID].supplier = msg.sender;
        MedicineStock[_medicineID].stage = STAGE.RawMaterialSupply;
    }

    // 🔥 4. MANUFACTURING
    function Manufacturing(uint256 _medicineID)
        public
        onlyRole(ROLE.Manufacturer)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply,
            "Wrong stage"
        );

        MedicineStock[_medicineID].stage = STAGE.Manufacture;
    }

    // 🔥 5. DISTRIBUTION
    function Distribute(uint256 _medicineID)
        public
        onlyRole(ROLE.Distributor)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.Manufacture,
            "Wrong stage"
        );

        MedicineStock[_medicineID].distributor = msg.sender;
        MedicineStock[_medicineID].stage = STAGE.Distribution;
    }

    // 🔥 6. RETAIL
    function Retail(uint256 _medicineID)
        public
        onlyRole(ROLE.Retailer)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.Distribution,
            "Wrong stage"
        );

        MedicineStock[_medicineID].retailer = msg.sender;
        MedicineStock[_medicineID].stage = STAGE.Retail;
    }

    // 🔥 7. SOLD (ONLY OWNER CUSTOMER)
    function sold(uint256 _medicineID)
        public
        onlyRole(ROLE.Customer)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.Retail,
            "Wrong stage"
        );

        require(
            MedicineStock[_medicineID].customer == msg.sender,
            "Not your product"
        );

        MedicineStock[_medicineID].stage = STAGE.Sold;
    }

    // 🔥 SHOW STAGE
    function showStage(uint256 _medicineID)
        public
        view
        returns (string memory)
    {
        if (MedicineStock[_medicineID].stage == STAGE.Requested)
            return "Requested";
        else if (MedicineStock[_medicineID].stage == STAGE.Approved)
            return "Approved";
        else if (MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply)
            return "Raw Material Supply";
        else if (MedicineStock[_medicineID].stage == STAGE.Manufacture)
            return "Manufacturing";
        else if (MedicineStock[_medicineID].stage == STAGE.Distribution)
            return "Distribution";
        else if (MedicineStock[_medicineID].stage == STAGE.Retail)
            return "Retail";
        else if (MedicineStock[_medicineID].stage == STAGE.Sold)
            return "Sold";

        return "";
    }
}