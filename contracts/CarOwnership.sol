// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


import "./CarData.sol";
import "./IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";


/** @title Car Ownership
  * This contract is the one that is deployed for this dApp.
  * It inherits CarData in order to deploye all the logic,
  * and it adds ERC721 nature to the car tokens. In order
  * for that to happen, ERC165 is also necessary.
  * 
  * The documentation for all the implemented methods in this
  * file are in its respective interfaces contracts
  */


contract CarOwnership is CarData, IERC721{
    
    using SafeMath for uint256;

    mapping (bytes4 => bool) internal supportedInterfaces;
    mapping (uint256 => address) tokenApprovals;
    mapping (address => mapping (address => bool)) internal operatorApprovals;

    //event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    //event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    //event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function supportsInterface(bytes4 interfaceID) override external view returns (bool){
		return supportedInterfaces[interfaceID];
	  }   

    function balanceOf(address owner) override external view returns (uint256 balance){
      require(owner != address(0));
		  return ownerToCars[owner].length;
    }

    function ownerOf(uint256 tokenId) override public view returns (address owner){
      address carOwner = carToOwner[tokenId];
    	require(carOwner != address(0));
		  return carToOwner[tokenId];
    }

    function safeTransferFrom(address from,address to,uint256 tokenId) override external payable{
        safeTransferFrom(from, to, tokenId,"");
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public payable{
      transferFrom(from, to, tokenId);
    }

    function transferFrom(address from,address to,uint256 tokenId) override public payable{

      require(isApprovedOrOwner(msg.sender, tokenId));
	    require(to != address(0));

      // Delete token

	    if(ownerToCars[from].length == 1) ownerToCars[from].pop();
      else{
	    for (uint i = 0; i < ownerToCars[from].length-1; i++){
            if (ownerToCars[from][i] == tokenId) {
            	// Assign last token to the token we are transferring
            	ownerToCars[from][i] = ownerToCars[from][ownerToCars[from].length-1];
            	// Delete duplicate token at the end
            	delete ownerToCars[from];
            	break;
            }
        }
      }
      carToOwner[tokenId] = to;
		  ownerToCars[to].push(tokenId);
      cars[tokenId].state = State.NotListed;
      cars[tokenId].price = 0;

      returnEther(tokenId);
      delete offers[tokenId];

	    tokenApprovals[tokenId] = address(0);

      emit Sold(tokenId);
    }

    function approve(address to, uint256 tokenId) external{

      address token_owner = ownerOf(tokenId);
	    require(to != token_owner);
	    require(msg.sender == token_owner || isApprovedForAll(token_owner, msg.sender));

	    tokenApprovals[tokenId] = to;
	    emit Approval(token_owner, to, tokenId);
    }

    function getApproved(uint256 tokenId) public view returns (address operator){
      return tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool _approved) external{
      require(operator != msg.sender);
    	operatorApprovals[msg.sender][operator] = _approved;
   		emit ApprovalForAll(msg.sender, operator, _approved);
    }

    function isApprovedForAll(address owner, address operator) public view returns (bool){
      return operatorApprovals[owner][operator];
    }

  	function isApprovedOrOwner(address _spender, uint256 _tokenId) internal view returns (bool) {
	    address token_owner = ownerOf(_tokenId);
	    return (
	      _spender == token_owner ||
	      getApproved(_tokenId) == _spender ||
	      isApprovedForAll(token_owner, _spender)
	    );
  	}
}