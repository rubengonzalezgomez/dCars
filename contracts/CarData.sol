// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";


//contrato que representa la lógica de los coches que se van a vender

contract CarData is Ownable{

    mapping (uint => address) carToOwner;      //a car belongs to a person
    mapping (address => uint[]) ownerToCars;    //one person can have more than one car

    mapping(uint => offer[]) offers;        //it represents the offers a car receives

    struct offer{
        address buyer;
        uint bid;
    }

    bool publicOffers = false; //flag allows people see the offers of a car    //it is initialized to false (offers are private)
    
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
        Created,    
        onSale
    }

    State state;

    modifier Sale() 	{ require(state == State.onSale); 	_;}
    modifier NotListed() 	{ require(state == State.Created); 	_;}

    event Created(uint id, string brand, string model);
    event onSale(uint id, uint price);
    event Bid(uint id, uint bid);
    event OffersArePublic(uint id, bool state);

    //created but not onSale
    //only the owner of the contract is allowed to register new cars in the platform
    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData) external onlyOwner{
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData,0));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);
        state = State.Created;

        emit Created(id, _brand, _model);
    }

    //created and onSale
    //only the owner of the contract is allowed to register new cars in the platform
    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData,uint _price) external onlyOwner{
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData,0));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);
        state = State.onSale;

        emit Created(id, _brand, _model);
        emit onSale(id, _price);
    }
    

      function List(uint id, uint _price) external NotListed{
        require(msg.sender == carToOwner[id], "You are not the owner of this car");  //only the car owner can list his car
        cars[id].price = _price;
        state = State.onSale;
        emit onSale(id,_price);
    }

    function modifyPrice(uint id, uint _price) external Sale{
        require(msg.sender == carToOwner[id]);  //only the car owner can list his car
        cars[id].price = _price;

        emit onSale(id,_price);
    }

    function unlist(uint id) external Sale{
        require(msg.sender == carToOwner[id]);
        cars[id].price = 0;
        state = State.Created;
    }

    function placeBid(uint id,uint _bid)external payable Sale{
        uint minimum = cars[id].price/2;
        require(_bid >= minimum);

        bool found = false;
        uint i = 0;
        while(!found && i<offers[id].length){
            if(offers[id][i].buyer == msg.sender){
                offers[id][i].bid = _bid;
                found = true;
            } 
            i++;
        }

        if(!found)  offers[id].push(offer(msg.sender,_bid));

         emit Bid(id,_bid);
    }

    //everybody can know how many offers a car has received
    function howManyOffers(uint id) external view returns(uint){
        return offers[id].length;
    }

    function setPublicOffers(uint id, bool _publicOffer) external{
        require(msg.sender == carToOwner[id]);
        publicOffers = _publicOffer;
        emit OffersArePublic(id, _publicOffer);
    } 


    function showOffers(uint id) external view returns(offer[] memory){
        require(publicOffers);
        return offers[id];
    }

    //if the publicOffers flag is active, everybody can see the offers
    /*function showOffer(uint id,uint i) internal view returns (offer memory){

        require(publicOffers);
        //usr view : offers starts in 1
        //there must be at least one offer
        require( i-1< offers[id].length);     
        offer[] memory aux = offers[id];
        return aux[i];
    }   */

    function generateCarID(string memory _VIN) private view returns (uint256) {
		// NOTE: Hopefully, this way there will not be any cars that have the same ID.
		// VIN will never be the same string for different cars
		return uint256(keccak256(abi.encodePacked(_VIN)));
	}

}