// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "../../token/IERC20.sol";

interface ICEther is IERC20 {
    function mint() external payable returns (uint);

    function redeem(uint redeemTokens) external returns (uint);

    function exchangeRateStored() external view returns (uint);
}
