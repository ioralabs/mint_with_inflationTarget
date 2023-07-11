# InflationToken Project Setup

This project uses Hardhat, a development environment for Ethereum. It includes a token contract (InflationToken) which takes inflation into account when minting new tokens.

## Prerequisites

You need to have Node.js (version 14.x.x recommended) and npm installed on your machine. Check your version by running `node -v` and `npm -v`.

## Setup

1. Clone the repository.

2. Install the dependencies by running:
    ```bash
    npm install
    ```

## Running the Tests

In order to run the tests, execute the following command:
```bash
npx hardhat test
```

## Explanation of the Test Cases
The tests in this project are meant to ensure the functionality of the InflationToken smart contract, especially regarding its ability to mint tokens in accordance with a set inflation target.

- The Should set the right owner test verifies that the owner of the contract is correctly set upon deployment.
- The Should set the right inflation target test ensures that the inflation target is set correctly when the contract is deployed.
- The Should not allow non-owners to set price and inflation test checks that only the owner can change the inflation and price.
- The Should allow owner to set price and inflation test verifies that the owner can change the price and inflation.
- The Should not allow tokens to be minted when inflation is higher than target test ensures that tokens cannot be minted when the inflation is higher than the set target.
- The Should allow tokens to be minted when inflation is equal to or less than target test verifies that tokens can be minted when the inflation is equal to or less than the set target.

## Code
The main code of the contract is in Solidity and is located in the contracts folder. The test code is in JavaScript and is located in the test folder.

### Solidity Contract
```Solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract InflationToken is ERC20, Ownable {
    uint256 public inflationTarget;
    bool public canMintTokens;
    int256 public price;
    uint256 public inflation;

    constructor(uint256 _inflationTarget) ERC20("InflationToken", "INFL") {
        inflationTarget = _inflationTarget;
        canMintTokens = true;
    }

    function setPriceAndInflation(int256 _price, uint256 _inflation) public onlyOwner {
        price = _price;
        inflation = _inflation;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        require(inflation <= inflationTarget, "Minting is disabled due to high inflation.");
        _mint(to, amount);
    }
}
```

### Test Code
```Javascript
// test/InflationToken.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InflationToken", function () {
  let InflationToken, inflationToken, owner, addr1, addr2;

  beforeEach(async () => {
    InflationToken = await ethers.getContractFactory("InflationToken");
    [owner, addr1, addr2, _] = await ethers.getSigners();
    inflationToken = await InflationToken.deploy(2); // Assume 2% as the inflation target
    await inflationToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await inflationToken.owner()).to.equal(owner.address);
    });

    it("Should set the right inflation target", async function () {
      expect(await inflationToken.inflationTarget()).to.equal(2);
    });
  });

  describe("Transactions", function () {
    it("Should not allow non-owners to set price and inflation", async function () {
      await expect(
        inflationToken.connect(addr1).setPriceAndInflation(1000, 1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to set price and inflation", async function () {
      await inflationToken.connect(owner).setPriceAndInflation(1000, 1);
      expect(await inflationToken.price()).to.equal(1000);
      expect(await inflationToken.inflation()).to.equal(1);
    });

    it("Should not allow tokens to be minted when inflation is higher than target", async function () {
        // Set inflation higher than the target
        await inflationToken.connect(owner).setPriceAndInflation(1000, 3);
        await expect(inflationToken.connect(owner).mint(addr1.address, 1000)).to.be.revertedWith('Minting is disabled due to high inflation.');
      });

    it("Should allow tokens to be minted when inflation is equal to or less than target", async function () {
      // Set inflation equal to the target
      await inflationToken.connect(owner).setPriceAndInflation(1000, 2);
      await expect(inflationToken.connect(owner).mint(addr1.address, 1000)).to.not.be.reverted;
      
      // Set inflation less than the target
      await inflationToken.connect(owner).setPriceAndInflation(1000, 1);
      await expect(inflationToken.connect(owner).mint(addr1.address, 1000)).to.not.be.reverted;
    });
  });
});
```