// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./ERC20Token.sol";

contract CryptoExchange {

    IERC20 public tokenNPN;
    IERC20 public tokenPMP;

    address creator;

    constructor () {
        creator = msg.sender;
        tokenNPN = new Token("napcoin", "NPN", creator, 0);
        tokenPMP = new Token("pmpcoin", "PMP", creator, 1);
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len+1);
        uint k = len+1;
        while (_i != 0) {
            k = k-1;
            if (k==len-1) {
                bstr[k] = ".";
            }
            else{
                uint8 temp = (48 + uint8(_i - _i / 10 * 10));
                bytes1 b1 = bytes1(temp);
                bstr[k] = b1;
                _i /= 10;
            }
        }
        return string(bstr);
    }

    function showAvlPMP() public view returns (string memory){
        uint balance = tokenPMP.balanceOf(address(this));
        return uint2str(balance);
    }

    function showAvlNPN() public view returns (uint){
        uint balance = tokenNPN.balanceOf(address(this));
        return balance;
    }

    function showUsrPMP() public view returns (string memory){
        uint balance = tokenPMP.balanceOf(msg.sender);
        return uint2str(balance);
    }

    function showUsrNPN() public view returns (uint){
        uint balance = tokenNPN.balanceOf(msg.sender);
        return balance;
    }

    function NPNtoPMP(uint npnAmt) external {
        address recipient = msg.sender;
        uint pmpAmt = npnAmt;

        tokenNPN.approve(recipient, address(this), pmpAmt);

        _safeTransferFrom(tokenNPN, recipient, address(this), pmpAmt);
        tokenPMP.transfer(recipient, npnAmt);  
    }

    function PMPtoNPN(uint pmpAmt) external {
        address recipient = msg.sender;
        uint npnAmt = 10 * pmpAmt;

        uint convFactor = tokenPMP._decimals();

        tokenPMP.approve(recipient, address(this), pmpAmt*convFactor);

        _safeTransferFrom(tokenPMP, recipient, address(this), pmpAmt*convFactor);
        tokenNPN.transfer(recipient, npnAmt);  
    }

    function _safeTransferFrom(IERC20 token, address sender, address recipient, uint amount) private {
        bool sent = token.transferFrom(sender, recipient, amount);
        require(sent, "Token transfer failed");
    }

    function airdropPMPToken() public {
        uint freeDrop = 65;
        tokenPMP._mint(msg.sender, freeDrop * tokenPMP._decimals());
    }

    function airdropNPNToken() public {
        uint freeDrop = 65;
        tokenNPN._mint(msg.sender, freeDrop * tokenNPN._decimals());
    }
} 