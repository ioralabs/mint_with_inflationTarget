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
