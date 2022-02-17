// SPDX-License-Identifier: MIT

pragma solidity >= 0.7.0;

contract Owned {
    
    //permite enviar ether para esse endereço
    address payable owner;  

    //dono do contrato
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
}
