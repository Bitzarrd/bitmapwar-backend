// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract BitMapWar is ERC20, ERC20Burnable, Ownable {
    using SafeMath for uint256;
    constructor()
    ERC20("BitMapWar", "BMW")
    Ownable()
    {
    }

    //    function pause() public onlyOwner {
    //        _pause();
    //    }
    //
    //    function unpause() public onlyOwner {
    //        _unpause();
    //    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    receive() external payable {
        uint256 price = 0.000001 ether;
        uint256 tokenAmount = msg.value / price;
        _mint(msg.sender, tokenAmount);
        //把费用转发给合约的拥有者
        //payable(owner()).transfer(msg.value);
    }

    function withdrawETH(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient contract balance");
        payable(owner()).transfer(amount);
    }

    mapping(address => mapping(uint256 => bool)) public usedNonces;

    event ETHWithdrawn(address indexed recipient, uint256 amount, uint256 indexed nonce);

    function withdrawETHWithSignature(uint256 amount, bytes memory signature, uint256 nonce, address to) public {
        address signer = verifySignature(amount, nonce, signature, to);
        require(signer == owner(), "Invalid signature or not the owner");
        require(amount <= address(this).balance, "Insufficient contract balance");
        require(!usedNonces[signer][nonce], "Nonce has already been used");

        usedNonces[signer][nonce] = true;
        payable(owner()).transfer(amount);

        emit ETHWithdrawn(to, amount, nonce);
    }


    function verifySignature(
        uint256 amount,
        uint256 nonce,
        bytes memory signature,
        address to
    ) public pure returns (address) {
        bytes32 messageHash = getMessageHash(amount, nonce, to);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address signer = recoverSigner(ethSignedMessageHash, signature);
        return signer;
    }

    function getMessageHash(uint256 amount, uint256 nonce, address to) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(amount, nonce, to));
    }

    function getEthSignedMessageHash(bytes32 messageHash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
    }

    function recoverSigner(
        bytes32 ethSignedMessageHash,
        bytes memory signature
    ) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory signature)
    private
    pure
    returns (bytes32 r, bytes32 s, uint8 v)
    {
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