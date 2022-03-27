// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v4.0.0/contracts/token/ERC20/ERC20.sol";
import "./ERC20.sol";

contract Token is ERC20 {
    constructor(string memory name, string memory symbol, address creator, uint decimal) ERC20(name, symbol, decimal) {

        uint intialSupply = 1000;

        _mint(msg.sender, intialSupply * _decimals());
        _mint(creator, 77 * _decimals());
    }
}