// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "../../token/IERC20.sol";

interface ICErc20 is IERC20 {
    function underlying() external view returns (address);

    function mint(uint mintAmount) external returns (uint);

    function redeem(uint redeemTokens) external returns (uint);

    function exchangeRateStored() external view returns (uint);
}
