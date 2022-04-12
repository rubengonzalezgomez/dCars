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
    
     // State of the sale
    enum State{ 
        NotListed,    
        onSale
    }


    struct Car{
    string VIN; //frame number works like a identifier
    string brand;
    string model;
    uint24 kilometraje;
    string ipfsMetaData;
    uint price;
    State state;
    }

    Car[] cars;

    modifier Sale(uint id) 	{ require(cars[id].state == State.onSale); 	_;}
    modifier NotListed(uint id) 	{ require(cars[id].state == State.NotListed); 	_;}

    event Created(uint id, string brand, string model);
    event onSale(uint id, uint price);
    event Bid(uint id, uint bid);
    event Sold(uint id);
    event OffersArePublic(uint id, bool state);

    //created but not onSale
    //only the owner of the contract is allowed to register new cars in the platform
    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData) external onlyOwner{
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData,0,State.NotListed));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);

        emit Created(id, _brand, _model);
    }

    //created and onSale
    //only the owner of the contract is allowed to register new cars in the platform
    function createListNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _ipfsMetaData,uint _price) external onlyOwner{
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_ipfsMetaData,_price,State.onSale));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);

        emit Created(id, _brand, _model);
        emit onSale(id, _price);
    }
    

      function List(uint id, uint _price) external NotListed(id){
        require(msg.sender == carToOwner[id]);  //only the car owner can list his car
        cars[id].price = _price;
        cars[id].state = State.onSale;
        emit onSale(id,_price);
    }

    function modifyPrice(uint id, uint _price) external Sale(id){
        require(msg.sender == carToOwner[id]);  //only the car owner can list his car
        cars[id].price = _price;

        emit onSale(id,_price);
    }

    function unlist(uint id) external Sale(id){
        require(msg.sender == carToOwner[id]);
        cars[id].price = 0;
        delete offers[id];
        cars[id].state = State.NotListed;
    }

    function placeBid(uint id,uint _bid)external payable Sale(id){
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


    //if the publicOffers flag is active, everybody can see the offers
    function showOffers(uint id) external view returns(offer[] memory){
        require(publicOffers);
        return offers[id];
    }

    //this function will be executed by the car automatically every month
    function updateKilometraje(uint id, uint24 km) private{ 
        require(km > cars[id].kilometraje);
        cars[id].kilometraje = km;
    }

    function getNumCars() public view returns(uint){
        return cars.length;
    }


    function getBrand(uint id) public view returns (string memory) {
        return(cars[id].brand);
    }

    function getModel(uint id) public view returns (string memory) {
        return(cars[id].model);
    }

    function getPrice(uint id) public view returns (uint) {
        return(cars[id].price);
    }  

    function getBrandsCar() public view returns (string[] memory) {
        string[] memory brandaux = new string[](cars.length);

        for(uint i = 0; i<cars.length; i++){
            brandaux[i] = cars[i].brand;
        }
        return(brandaux);
    }

    function getModelsCar() public view returns (string[] memory) {
        string[] memory modelaux = new string[](cars.length);

        for(uint i = 0; i<cars.length; i++){
            modelaux[i] = cars[i].model;
        }
        return(modelaux);

    }

    function getPricesCar() public view returns (uint[] memory) {
        uint[] memory priceaux = new uint[](cars.length);

        
        for(uint i = 0; i<cars.length; i++){
            priceaux[i] = cars[i].price;
        }
        return(priceaux);

    }

}