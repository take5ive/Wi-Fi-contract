// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./uniswapV2/periphery/interfaces/IUniswapV2Router02.sol";
import "./compound/ICErc20.sol";
import "./token/IERC20.sol";
import "./compound/ICEther.sol";

contract CompoundFunnel {
    address public _lendingProtocol;

    constructor(address lendingProtocol) {
        _lendingProtocol = lendingProtocol;
    }

    /*******************************************************
     * ReceiveToken -> DepositToken
     * ETH -> ERC20 Token : depositReceivedETHThenGetCToken
     * ERC20 Token -> ERC20 Token: depositReceivedTokenThenGetCToken
     * ERC20 Token -> ETH: depositReceivedTokenThenGetcETH
     * ETH -> ETH: depositReceivedETHThenGetcETH
     *********************************************************/
    /**
     * Receive token and swap to dst token then deposit to lending protocol
     * @param cTokenInDst lendingProtocol's cToken address (ex. cUSDC address)
     * @param receviedTokenAmount The amount of receivedToken that will be swapped to tokenInSrc
     * @param dexUsingSwap The dex that will be used to swap receivedToken to tokenInSrc
     * @param path The path that will be used to swap receivedToken to tokenInSrc , path[0] is receivedToken and path[path.length-1] is tokenInSrc
     * @param to The address that will receive the cToken
     * @param deadline The deadline that will be used to swap receivedToken to tokenInSrc
     * @return cTokenInDstAmount The amount of cToken that will be received
     */
    function depositReceivedTokenThenGetCToken(
        ICErc20 cTokenInDst,
        uint receviedTokenAmount,
        IUniswapV2Router02 dexUsingSwap,
        address[] memory path,
        address to,
        uint deadline
    ) external returns (uint cTokenInDstAmount) {
        address tokenInSrc = cTokenInDst.underlying();
        // 1. Swap receivedToken to tokenInSrc
        if (path[0] != tokenInSrc) {
            IUniswapV2Router02(dexUsingSwap).swapExactTokensForTokens(
                receviedTokenAmount,
                1,
                path,
                address(this),
                deadline
            );
        }
        // 2. Deposit tokenInSrc to lendingProtocol
        uint tokenDepositBalance = IERC20(tokenInSrc).balanceOf(address(this));

        // 3. Mint cToken
        ICErc20(cTokenInDst).mint(tokenDepositBalance);
        cTokenInDstAmount = ICErc20(cTokenInDst).balanceOf(address(this));
        // 4. Transfer cToken to "to"
        ICErc20(cTokenInDst).transfer(to, cTokenInDstAmount);
    }

    function depositReceivedETHThenGetCToken(
        ICErc20 cTokenInDst,
        IUniswapV2Router02 dexUsingSwap,
        address[] memory path, //path[0] is WETH and path[path.length-1] is tokenInSrc
        address to,
        uint deadline
    ) external payable returns (uint cTokenInDstAmount) {
        // 1. Swap receivedETH to tokenInSrc
        IUniswapV2Router01(dexUsingSwap).swapExactETHForTokens(
            1,
            path,
            address(this),
            deadline
        );
        // 2. Deposit tokenInSrc to lendingProtocol
        address tokenInSrc = path[path.length - 1];
        uint tokenAmountToDeposit = IERC20(tokenInSrc).balanceOf(address(this));

        // 3. Mint cToken
        ICErc20(cTokenInDst).mint(tokenAmountToDeposit);
        cTokenInDstAmount = ICErc20(cTokenInDst).balanceOf(address(this));
        // 4. Transfer cToken to "to"
        ICErc20(cTokenInDst).transfer(to, cTokenInDstAmount);
    }

    function depositReceivedETHThenGetcETH(
        ICEther cEther,
        address to
    ) external payable returns (uint cEtherAmount) {
        // 1. It doesn't need to swap

        // 2. Deposit cEther to lendingProtocol
        uint tokenDepositBalance = address(this).balance;
        ICEther(cEther).mint{value: tokenDepositBalance}();
        // 3. Transfer cToken to "to"
        cEtherAmount = ICEther(cEther).balanceOf(address(this));
        ICEther(cEther).transfer(to, cEtherAmount);
    }

    function depositReceivedTokenThenGetcETH(
        ICEther cEtherToDeposit,
        uint receviedTokenAmount,
        IUniswapV2Router02 dexUsingSwap,
        address[] memory path,
        address to,
        uint deadline
    ) external returns (uint receviedCEtherAmount) {
        // 1. Swap receivedToken to ETH

        IUniswapV2Router01(dexUsingSwap).swapExactTokensForETH(
            receviedTokenAmount,
            1,
            path,
            address(this),
            deadline
        );

        // 2. Deposit tokenInSrc to lendingProtocol
        uint depositETH = address(this).balance;
        // 3. Mint cEther
        ICEther(cEtherToDeposit).mint{value: depositETH}();
        receviedCEtherAmount = ICEther(cEtherToDeposit).balanceOf(
            address(this)
        );
        // 4. Transfer cEther to "to"
        ICEther(cEtherToDeposit).transfer(to, receviedCEtherAmount);
    }

    function calculateCTokenInDstAmount(
        ICErc20 cTokenInDst,
        uint tokenAmountInSrc,
        IUniswapV2Router02 dexUsingSwap,
        address[] memory path
    ) external view returns (uint cTokenAmountInDst) {
        //address tokenInSrc = cTokenInDst.underlying();
        //path[path.length - 1] = tokenInSrc;
        require(
            path[path.length - 1] == cTokenInDst.underlying(),
            " path is wrong"
        );

        uint exchangeRate = cTokenInDst.exchangeRateStored();

        // 1. Calculate when swap receivedToken to tokenInSrc
        uint[] memory amounts = IUniswapV2Router02(dexUsingSwap).getAmountsOut(
            tokenAmountInSrc,
            path
        );
        // 2. Calculate when deposit tokenInSrc to lendingProtocol
        return amounts[amounts.length - 1] * exchangeRate;
    }
}
