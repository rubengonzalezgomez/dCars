// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";


//contrato que representa la lógica de los coches que se van a vender

contract CarData is Ownable{

    mapping (uint => address) carToOwner;      //a car belongs to a person
    mapping (address => uint[]) ownerToCars;    //one person can have more than one car

    //mapping (address => uint) offers;
    mapping(uint => offer) offers;

    struct offer{
        address buyer;
        uint bid;
    }

    uint private offersCounter = 0;

    struct Car{
    string VIN; //frame number works like a identifier
    string brand;
    string model;
    uint24 kilometraje;
    string ipfsMetaData;
    uint price;
    }

    Car[] cars;
    

    // State of the sale
    enum State{     
        onSale,
        Sold
    }

    State state;

    modifier notListed() 	{ require(state == State.Created); 	_;}
    modifier onSale() 	{ require(state == State.onSale); 	_;}
    modifier Sold() 	{ require(state == State.Sold); 	_;}

    event Created(uint id, string brand, string model);
    event Sale();
    event bid();
    event sold();

    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData) external {
        uint id = cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData))-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender] = id;

        emit Created(id, _brand, _model);
    }


    function List(uint _price) external onlyOwner{
        price = _price;
        state = State.onSale;
        emit Sale();
    }

    function placeBid(uint _bid) external payable onSale{
        uint minimum = price/2;
        
        require(_bid >= minimum);

        uint id = offersCounter;       //id starts in 0
        offersCounter++;

        offers[id] = offer(msg.sender,_bid);

        emit bid();
    }
    
   /* function sell(uint i) external onlyOwner onSale{

            require(i-1<offersCounter);     //usr view : offers starts in 1

            address buyer = offers[i-1].buyer;

            uint id = generateCarID();
            carToOwner[id] = buyer;
            ownerToCars[buyer].push(id);

            for(uint j = 0; j < offersCounter; j++){
                delete offers[j];
            }
            offersCounter = 0;

            state = State.Sold;
            emit sold();
        
    } */

    function getOffers() external view returns(uint){
        return offersCounter;
    }

    function showOffer(uint i) external view returns (offer memory){
        
        require(i-1<offersCounter);     //usr view : offers starts in 1
        return offers[i-1];
    }

    function generateCarID() private view returns (uint256) {
		// NOTE: Hopefully, this way there will not be any cars that have the same ID.
		// VIN will never be the same string for different cars
		return uint256(keccak256(abi.encodePacked(VIN)));
	}

}