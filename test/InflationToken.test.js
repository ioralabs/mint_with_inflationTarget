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
