// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "./uniswapV2/periphery/interfaces/IUniswapV2Router02.sol";
import "./compound/interfaces/ICErc20.sol";
import "./token/IERC20.sol";
import "./compound/interfaces/ICEther.sol";
import "./interfaces/IWETH9.sol";

contract CompoundFunnel {
    IWETH9 weth;

    constructor(IWETH9 _weth) {
        weth = _weth;
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

    function redeemCTokenToErc20Token(
        ICErc20 cTokenToRedeem,
        uint redeemAmounts,
        address to,
        address[] memory path, //path[0] is tokenInSrc and path[path.length-1] is dstToken
        IUniswapV2Router02 dexUsingSwap,
        uint deadline
    ) external returns (uint dstTokenAmount) {
        // 1. Redeem cToken to token
        cTokenToRedeem.transferFrom(msg.sender, address(this), redeemAmounts);
        cTokenToRedeem.redeem(redeemAmounts);
        uint receviedUnderlyingTokenAmount = IERC20(cTokenToRedeem.underlying())
            .balanceOf(address(this));
        // 2. Swap token to dstToken
        IUniswapV2Router02(dexUsingSwap).swapExactTokensForTokens(
            receviedUnderlyingTokenAmount,
            1,
            path,
            address(this),
            deadline
        );
        // 3. Transfer dstToken to "to"
        dstTokenAmount = IERC20(path[path.length - 1]).balanceOf(address(this));
        IERC20(path[path.length - 1]).transfer(to, dstTokenAmount);
    }

    function redeemCTokenToETH(
        ICErc20 cTokenToRedeem,
        uint redeemAmounts,
        address to,
        address[] memory path,
        IUniswapV2Router02 dexUsingSwap,
        uint deadline
    ) external {
        //1. Redeem cToken to token
        cTokenToRedeem.transferFrom(msg.sender, address(this), redeemAmounts);
        cTokenToRedeem.redeem(redeemAmounts);
        uint receviedUnderlyingTokenAmount = IERC20(cTokenToRedeem.underlying())
            .balanceOf(address(this));
        //2. Swap token to ETH
        IUniswapV2Router02(dexUsingSwap).swapExactTokensForETH(
            receviedUnderlyingTokenAmount,
            1,
            path,
            address(this),
            deadline
        );
        //3. Transfer ETH to "to"
        uint ethAmount = address(this).balance;
        payable(to).transfer(ethAmount);
    }

    function redeemCETHToErc20Token(
        ICEther cEtherToRedeem,
        uint redeemAmounts,
        address to,
        address[] memory path, //path[path.length-1] is dstToken
        IUniswapV2Router02 dexUsingSwap,
        uint deadline
    ) external {
        //1. Redeem cEther to ether
        cEtherToRedeem.transferFrom(msg.sender, address(this), redeemAmounts);
        cEtherToRedeem.redeem(redeemAmounts);

        //2. Swap ether to dstToken
        IUniswapV2Router02(dexUsingSwap).swapExactETHForTokens{
            value: address(this).balance
        }(1, path, address(this), deadline);
        //3. Transfer ETH to "to"
        uint ethAmount = address(this).balance;
        (bool success, ) = payable(to).call{value: ethAmount}("");
        require(success, "Transfer ETH failed");
    }

    function redeemCETHToETH(
        ICEther cEtherToRedeem,
        uint redeemAmounts,
        address to
    ) external {
        //1. Redeem cEther to ether
        cEtherToRedeem.redeem(redeemAmounts);
        //2. Transfer ETH to "to"
        uint ethAmount = address(this).balance;
        (bool success, ) = payable(to).call{value: ethAmount}("");
        require(success, "Transfer ETH failed");
    }

    /*********************
     * Calculate Function
     ***********************/
    function calculateDestCTokenAmountByDeposit(
        address cTokenInDst,
        uint tokenAmountInSrc,
        IUniswapV2Router02 dexUsingSwap,
        address[] memory path // if src chain is ether, path[0] is WETH address
    ) external returns (uint tokenAmountInDst) {
        //address tokenInSrc = cTokenInDst.underlying();
        //path[path.length - 1] = tokenInSrc;
        (bool success, bytes memory data) = cTokenInDst.call(
            abi.encodeWithSignature("underlying")
        );

        address underlyingToken = abi.decode(data, (address));
        require(
            (success && (path[path.length - 1] == underlyingToken)) ||
                (!success && (path[path.length - 1] == address(weth))),
            " path is wrong or cTokenInDst is wrong"
        );
        uint exchangeRate = ICErc20(cTokenInDst).exchangeRateStored();

        // 1. Calculate when swap receivedToken to tokenInSrc
        uint[] memory amounts = IUniswapV2Router02(dexUsingSwap).getAmountsOut(
            tokenAmountInSrc,
            path
        );
        // 2. Calculate when deposit tokenInSrc to lendingProtocol
        tokenAmountInDst = amounts[amounts.length - 1] * exchangeRate;
    }

    function calcualteDestTokenAmountByRedeem(
        address cTokenInSrc,
        uint cTokenAmountInSrc,
        IUniswapV2Router02 dexUsingSwap,
        address[] memory path // if src chain is ether, path[0] is WETH address
    ) external returns (uint tokenAmountInDst) {
        (bool success, bytes memory data) = cTokenInSrc.call(
            abi.encodeWithSignature("underlying")
        );
        address underlyingToken = abi.decode(data, (address));
        require(
            (success && (path[path.length - 1] == underlyingToken)) ||
                (!success && (path[path.length - 1] == address(weth))),
            " path is wrong or cTokenInDst is wrong"
        );

        uint exchangeRate = ICErc20(cTokenInSrc).exchangeRateStored();
        uint[] memory amounts = IUniswapV2Router02(dexUsingSwap).getAmountsOut(
            cTokenAmountInSrc / exchangeRate,
            path
        );

        tokenAmountInDst = amounts[amounts.length - 1];
    }
}
