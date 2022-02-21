// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";


//contrato que representa la lógica de los coches que se van a vender

contract CarData is Ownable{

    mapping (uint => address) carToOwner;      //a car belongs to a person
    mapping (address => uint[]) ownerToCars;    //one person can have more than one car

    //mapping (address => uint) offers;
    mapping(uint => offer[]) offers;

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

    modifier Sale() 	{ require(state == State.onSale); 	_;}
    modifier Sold() 	{ require(state == State.Sold); 	_;}

    event Created(uint id, string brand, string model);
    event onSale(uint id, uint price);
    event bid();
    event sold();

    //created but not onSale
    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData) external {
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData,0));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);

        emit Created(id, _brand, _model);
    }

    //created and onSale
    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData,uint _price) external {
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData,0));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);

        emit Created(id, _brand, _model);
        emit onSale(id, _price);
    }
    

      function List(uint id, uint _price) external onlyOwner{
        cars[id].price = _price;
        state = State.onSale;
        emit onSale(id,_price);
    }

    function placeBid(uint id,uint _bid) external payable Sale{
        uint minimum = cars[id].price/2;
        
        require(_bid >= minimum);

        offers[id].push(offer(msg.sender,_bid));

        emit bid();
    }

    function showOffer(uint id,uint i) external view returns (offer memory){
        
        require(i-1<offersCounter);     //usr view : offers starts in 1
        offer[] memory aux = offers[id];
        return aux[i];
    }

    function generateCarID(string memory _VIN) private view returns (uint256) {
		// NOTE: Hopefully, this way there will not be any cars that have the same ID.
		// VIN will never be the same string for different cars
		return uint256(keccak256(abi.encodePacked(_VIN)));
	}

}