// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BitCraft is ERC20, ERC20Burnable, Ownable {
    constructor()
    ERC20("BitCraft", "MTK")
    Ownable()
    {}

//    function pause() public onlyOwner {
//        _pause();
//    }
//
//    function unpause() public onlyOwner {
//        _unpause();
//    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function BuyToken() payable public {
        uint256 tokenAmount = msg.value * 1000; // 计算代币数量（每个代币价格为 0.001 ETH）
        require(tokenAmount > 0, "Insufficient ETH amount");
        // 调用 ERC20 合约的 mint 函数来铸造代币并将其发送给购买者
        mint(msg.sender, tokenAmount);
    }

    function withdrawETH(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner()).transfer(amount);
    }

    mapping(address => mapping(uint256 => bool)) public usedNonces;

    function withdrawETHWithSignature(uint256 amount, bytes memory signature, uint256 nonce) public {
        bytes32 message = keccak256(abi.encodePacked(amount, nonce));
        address signer = _verifyWithdrawSignature(message, signature);
        require(signer == owner(), "Invalid signature or not the owner");
        require(amount <= address(this).balance, "Insufficient contract balance");
        require(!usedNonces[signer][nonce], "Nonce has already been used");

        usedNonces[signer][nonce] = true;
        payable(owner()).transfer(amount);
    }

    function _verifyWithdrawSignature(bytes32 message, bytes memory signature) private pure returns (address) {
        bytes32 ethSignedMessageHash = _getEthSignedMessageHash(message);
        address signer = _recoverSigner(ethSignedMessageHash, signature);
        return signer;
    }

    function _getEthSignedMessageHash(bytes32 message) private pure returns (bytes32) {
        bytes32 prefix = "\x19Ethereum Signed Message:\n32";
        return keccak256(abi.encodePacked(prefix, message));
    }

    function _recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function _splitSignature(bytes memory signature) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(signature.length == 65, "Invalid signature length");

        assembly {
        // First 32 bytes stores the length of the signature
            r := mload(add(signature, 32))
        // Next 32 bytes stores the length of the signature
            s := mload(add(signature, 64))
        // The last byte stores the recovery identifier
            v := byte(0, mload(add(signature, 96)))
        }

        return (r, s, v);
    }
}