// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)
pragma solidity ^0.8.0;

interface IErrors {
    error notSimpleDex();
    error notEnoughBalance();
    error ethNotSent();
    error notMinter();
    error invalidAddress();
    error invalidTreasuryAddress();
    error zeroAmount();
    error invalidUserBalance();
}
