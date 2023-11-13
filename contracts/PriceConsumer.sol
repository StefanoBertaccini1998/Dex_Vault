// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    /**
     * Network: mainet
     * Aggregator: ETH/USD
     * Address: 0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419
     */
    constructor(address clOracleAddress) {
        priceFeed = AggregatorV3Interface(clOracleAddress);
    }

    /**
     * Return latest price
     */

    function getLatestPrice() public view returns (int) {
        (
            ,
            /* uint80 roundID */ int price,
            ,
            ,

        ) = /* uint startedAt */ /*uint timeStamp */ /*uint80 answeredInRound */ priceFeed
                .latestRoundData();
        return price;
    }

    function getPriceDecimals() public view returns (uint) {
        return uint(priceFeed.decimals());
    }
}
