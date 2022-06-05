//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./IERC20.sol";
import "hardhat/console.sol";

contract Bridge {
    using Counters for Counters.Counter;

    IERC20 public token;
    Counters.Counter private nonce;

    mapping(uint256 => bool) private nonceUsed;

    constructor(IERC20 _token) {
        token = _token;
    }

    modifier EnoughFunds(uint256 amount) {
        require(token.balanceOf(msg.sender) >= amount, "not enough funds");
        _;
    }

    event SwapInitialized(address sender, address receiver, uint256 amount, uint256 nonce);

    function swap(address receiver, uint256 amount) external EnoughFunds(amount) {
        token.burn(msg.sender, amount);
        emit SwapInitialized(msg.sender, receiver, amount, nonce.current());
        nonce.increment();
    }

    function redeem(address receiver, uint256 amount, uint256 _nonce, uint8 v, bytes32 r, bytes32 s) external{
        require(nonceUsed[_nonce] == false, "nonce already used");

        bytes32 message = keccak256(
            abi.encodePacked(receiver, amount, _nonce)
        );
        address addr = ecrecover(hashMessage(message), v, r, s);
        require(receiver == addr, "wrong signature");
        nonceUsed[_nonce] = true;
    }

    function hashMessage(bytes32 message) private pure returns(bytes32) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, message));
    }
}
