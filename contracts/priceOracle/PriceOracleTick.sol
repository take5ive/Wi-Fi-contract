// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceOracleTick {
    mapping(address => mapping(address => AggregatorV3Interface)) priceOracle;
    address admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "only admin");
        _;
    }

    function setPriceOracle(
        address numeratorToken,
        address denominatorToken,
        AggregatorV3Interface _priceOracle
    ) external onlyAdmin {
        priceOracle[numeratorToken][denominatorToken] = _priceOracle;
    }

    function getTick(
        address token0, //already sorted: token0 < token1
        address token1
    ) external returns (int24 tick) {
        // log2(1.001) = 1.441974 * 10**(-3), log1.001(10**18) = 4146725149
        if (
            address(priceOracle[token0][token1]) == address(0) &&
            address(priceOracle[token1][token0]) == address(0)
        ) {
            return 0;
        } else if (address(priceOracle[token0][token1]) != address(0)) {
            // sqrt(token1/token0) -> tick변환
            (, int price, , , ) = priceOracle[token0][token1].latestRoundData();
            int24 nominator = int24(
                log2(uint(price)) * 10 ** 9 - (4146725149 * 1441974)
            );

            int24 denominator = 1441974;
            tick = int24(nominator / denominator);
        } else if (address(priceOracle[token1][token0]) != address(0)) {
            // sqrt(token0/token1) -> tick변환
            (, int price, , , ) = priceOracle[token1][token0].latestRoundData();
            int24 nominator = log2(uint(price)) *
                10 ** 3 -
                (4146725149 * 1441974174);
            int24 denominator = 1441974174;
            tick = -nominator / denominator;
        }
    }

    //utils : log2 function
    function log2(uint x) internal returns (uint y) {
        assembly {
            let arg := x
            x := sub(x, 1)
            x := or(x, div(x, 0x02))
            x := or(x, div(x, 0x04))
            x := or(x, div(x, 0x10))
            x := or(x, div(x, 0x100))
            x := or(x, div(x, 0x10000))
            x := or(x, div(x, 0x100000000))
            x := or(x, div(x, 0x10000000000000000))
            x := or(x, div(x, 0x100000000000000000000000000000000))
            x := add(x, 1)
            let m := mload(0x40)
            mstore(
                m,
                0xf8f9cbfae6cc78fbefe7cdc3a1793dfcf4f0e8bbd8cec470b6a28a7a5a3e1efd
            )
            mstore(
                add(m, 0x20),
                0xf5ecf1b3e9debc68e1d9cfabc5997135bfb7a7a3938b7b606b5b4b3f2f1f0ffe
            )
            mstore(
                add(m, 0x40),
                0xf6e4ed9ff2d6b458eadcdf97bd91692de2d4da8fd2d0ac50c6ae9a8272523616
            )
            mstore(
                add(m, 0x60),
                0xc8c0b887b0a8a4489c948c7f847c6125746c645c544c444038302820181008ff
            )
            mstore(
                add(m, 0x80),
                0xf7cae577eec2a03cf3bad76fb589591debb2dd67e0aa9834bea6925f6a4a2e0e
            )
            mstore(
                add(m, 0xa0),
                0xe39ed557db96902cd38ed14fad815115c786af479b7e83247363534337271707
            )
            mstore(
                add(m, 0xc0),
                0xc976c13bb96e881cb166a933a55e490d9d56952b8d4e801485467d2362422606
            )
            mstore(
                add(m, 0xe0),
                0x753a6d1b65325d0c552a4d1345224105391a310b29122104190a110309020100
            )
            mstore(0x40, add(m, 0x100))
            let
                magic
            := 0x818283848586878898a8b8c8d8e8f929395969799a9b9d9e9faaeb6bedeeff
            let
                shift
            := 0x100000000000000000000000000000000000000000000000000000000000000
            let a := div(mul(x, magic), shift)
            y := div(mload(add(m, sub(255, a))), shift)
            y := add(
                y,
                mul(
                    256,
                    gt(
                        arg,
                        0x8000000000000000000000000000000000000000000000000000000000000000
                    )
                )
            )
        }
    }
}
