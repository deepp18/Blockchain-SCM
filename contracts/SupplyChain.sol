// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SupplyChain {

    address public Owner;

    constructor() public {
        Owner = msg.sender;
    }

    // 🔥 ROLE SYSTEM (NEW)
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
        require(roles[msg.sender] == _role, "Access denied: wrong role");
        _;
    }

    // 🔥 STAGES
    enum STAGE {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    uint256 public medicineCtr = 0;

    struct medicine {
        uint256 id;
        string name;
        string description;
        address supplier;
        address manufacturer;
        address distributor;
        address retailer;
        STAGE stage;
    }

    mapping(uint256 => medicine) public MedicineStock;

    // 🔥 ADD PRODUCT (ONLY SUPPLIER)
    function addMedicine(string memory _name, string memory _description)
        public
        onlyRole(ROLE.Supplier)
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
            STAGE.Init
        );
    }

    // 🔥 STAGE 1 → RAW MATERIAL
    function RMSsupply(uint256 _medicineID)
        public
        onlyRole(ROLE.Supplier)
    {
        require(MedicineStock[_medicineID].stage == STAGE.Init, "Wrong stage");

        MedicineStock[_medicineID].stage = STAGE.RawMaterialSupply;
    }

    // 🔥 STAGE 2 → MANUFACTURING
    function Manufacturing(uint256 _medicineID)
        public
        onlyRole(ROLE.Manufacturer)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.RawMaterialSupply,
            "Wrong stage"
        );

        MedicineStock[_medicineID].manufacturer = msg.sender;
        MedicineStock[_medicineID].stage = STAGE.Manufacture;
    }

    // 🔥 STAGE 3 → DISTRIBUTION
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

    // 🔥 STAGE 4 → RETAIL
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

    // 🔥 STAGE 5 → SOLD
    function sold(uint256 _medicineID)
        public
        onlyRole(ROLE.Customer)
    {
        require(
            MedicineStock[_medicineID].stage == STAGE.Retail,
            "Wrong stage"
        );

        MedicineStock[_medicineID].stage = STAGE.Sold;
    }

    // 🔥 SHOW STAGE (FOR UI)
    function showStage(uint256 _medicineID)
        public
        view
        returns (string memory)
    {
        if (MedicineStock[_medicineID].stage == STAGE.Init)
            return "Created";
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