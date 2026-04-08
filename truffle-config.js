/**
 * Truffle Configuration File
 * Fully configured for Ganache (local blockchain)
 */

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Ganache local host
      port: 7545,            // Ganache default port
      network_id: "5777",       // Match any network id (Ganache = 5777)
    }
  },

  // Set default mocha options
  mocha: {
    timeout: 100000
  },

  // Solidity compiler configuration
  compilers: {
    solc: {
      version: "0.5.16",     // Recommended stable version
    }
  }
};