// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract LendingFunnel {
    address public _lendingProtocol;

    constructor(address lendingProtocol) {
        _lendingProtocol = lendingProtocol;
    }
}
