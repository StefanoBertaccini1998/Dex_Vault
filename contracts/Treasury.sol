// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IErrors.sol";
import "./interfaces/ITreasury.sol";

contract Treasury is IErrors {
    address public owner;
    address public simpleDexAddress;

    constructor(address simpleDex) {
        if (simpleDex == address(0)) {
            revert invalidAddress();
        }
        owner = msg.sender;
        simpleDexAddress = simpleDex;
    }

    receive() external payable {}

    modifier onlySimpleDex() {
        if (msg.sender != simpleDexAddress) {
            revert notSimpleDex();
        }
        _;
    }

    function withdraw(address to, uint256 _amount) external onlySimpleDex {
        (bool sent, ) = payable(to).call{value: _amount}("");
        if (!sent) {
            revert ethNotSent();
        }
    }
}
