// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BitCraft is ERC20, ERC20Burnable, ERC20Pausable, Ownable {
    constructor(address initialOwner)
    ERC20("BitCraft", "MTK")
    Ownable(initialOwner)
    {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

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

// The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
    internal
    override(ERC20, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}