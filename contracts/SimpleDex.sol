// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.9.0) (token/ERC20/ERC20.sol)
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./PriceConsumer.sol";
import "./interfaces/IErrors.sol";
import "./interfaces/ITreasury.sol";
import "./interfaces/IToken.sol";

contract SimpleDex is Ownable, IErrors {
    address public token;
    address public externalTreasury;

    PriceConsumerV3 public ethUsdContract;
    uint256 public ethPriceDecimals;
    uint256 public ethPrice;

    event Bought(uint256 amount);
    event Sold(uint256 amount);

    constructor(address _token, address oracleEthUsdPrice) {
        token = _token;
        ethUsdContract = new PriceConsumerV3(oracleEthUsdPrice);
        ethPriceDecimals = ethUsdContract.getPriceDecimals();
    }

    /* function decimals() public pure override returns (uint8){
        return 8;
    } */

    receive() external payable {
        buyToken();
    }

    function setTreasury(address _treasuryAddress) external onlyOwner {
        if (_treasuryAddress == address(0)) {
            revert invalidAddress();
        }
        externalTreasury = _treasuryAddress;
    }

    function buyToken() public payable {
        if (externalTreasury == address(0)) {
            revert invalidTreasuryAddress();
        }
        uint256 amountToBuy = msg.value;
        if (amountToBuy == 0) {
            revert zeroAmount();
        }

        ethPrice = uint256(ethUsdContract.getLatestPrice());
        uint256 amountToSend = (amountToBuy * ethPrice) /
            (10 ** ethPriceDecimals);

        treasuryMove(externalTreasury, amountToBuy);
        IToken(token).mint(msg.sender, amountToSend);

        emit Bought(amountToSend);
    }

    function sellToken(uint256 amount) public payable {
        if (amount == 0) {
            revert zeroAmount();
        }
        if (externalTreasury == address(0)) {
            revert invalidTreasuryAddress();
        }
        if (IERC20(token).balanceOf(msg.sender) < amount) {
            revert invalidUserBalance();
        }

        ethPrice = uint256(ethUsdContract.getLatestPrice());
        uint256 amountToSend = (amount * (10 ** ethPriceDecimals)) / ethPrice;

        IToken(token).burn(msg.sender, amount);
        //ITreasury(externalTreasury).withdraw(amountToSend);

        if (address(externalTreasury).balance < amountToSend) {
            revert notEnoughBalance();
        }
        //treasuryMove(externalTreasury, amountToSend);
        ITreasury(externalTreasury).withdraw(msg.sender, amountToSend);

        emit Sold(amount);
    }

    function treasuryMove(address _to, uint256 _amount) internal {
        (bool sent, ) = payable(_to).call{value: _amount}("");
        if (!sent) {
            revert ethNotSent();
        }
    }

    function emergencyTransfer(
        address _token,
        uint256 _amount,
        address _recipient
    ) external onlyOwner {
        if (_token == address(0)) {
            (bool sent, ) = payable(_recipient).call{value: _amount}("");
            require(sent, "!sent");
        } else {
            SafeERC20.safeTransfer(IERC20(_token), _recipient, _amount);
        }
    }
}
