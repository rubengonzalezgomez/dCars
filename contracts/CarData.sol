// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;



import "@openzeppelin/contracts/access/Ownable.sol";


//contrato que representa la lógica de los coches que se van a vender

contract CarData is Ownable{

    mapping (uint => address) carToOwner;      //a car belongs to a person
    mapping (address => uint[]) ownerToCars;    //one person can have more than one car

    mapping(uint => offer[]) offers;        //it represents the offers a car receives
    
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
    string image;
    uint price;
    State state;
    }

    Car[] cars;

     struct offer{
        address buyer;
        uint bid;
    }

    modifier Sale(uint id) 	{ require(cars[id].state == State.onSale); 	_;}
    modifier NotListed(uint id) 	{ require(cars[id].state == State.NotListed); 	_;}

    event Created(uint id, string brand, string model);
    event onSale(uint id, uint price);
    event Bid(uint id, uint bid);
    event Sold(uint id);

    //created but not onSale
    function createNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _image) external{
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_image,0,State.NotListed));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);

        emit Created(id, _brand, _model);
    }

    //created and onSale
    function createListNewCar(string memory _VIN, string memory _brand, string memory _model, uint24 _kilometraje, string memory _image,uint _price) external{
        cars.push(Car(_VIN,_brand,_model,_kilometraje,_image,_price,State.onSale));

        uint id = cars.length-1;
        carToOwner[id] = msg.sender;
        ownerToCars[msg.sender].push(id);

        emit Created(id, _brand, _model);
        emit onSale(id, _price);
    }

    //modify the price of your NFT
    function setPrice(uint id, uint _price) external{
        require(msg.sender == carToOwner[id]);  //only the car owner can list his car
        cars[id].price = _price;
        cars[id].state = State.onSale;
        emit onSale(id,_price);
    }

    //take your NFT off the market
    function unlist(uint id) external Sale(id){
        require(msg.sender == carToOwner[id]);
        cars[id].price = 0;
        delete offers[id];
        cars[id].state = State.NotListed;
    }

    //a user place an offer
    function placeBid(uint id,uint _bid)external payable Sale(id){
        require(msg.sender != carToOwner[id]);
        uint minimum = cars[id].price/2;
        require(_bid >= minimum);

        bool found = false;
        uint i = 0;
        while(!found && i<offers[id].length){
            if(offers[id][i].buyer == msg.sender){
                uint256 amountToReturn = offers[id][i].bid * 1000000000000000000;
                transferEther(amountToReturn, payable(msg.sender));
                offers[id][i].bid = _bid;
                found = true;
            } 
            i++;
        }

        if(!found)  offers[id].push(offer(msg.sender,_bid));
         emit Bid(id,_bid);
    }

    //get the num of offers a car has received
    function howManyOffers(uint id) external view returns(uint){
        return offers[id].length;
    }

    //returns who has made the offer
    function getBuyer(uint id,uint i) public view returns (address) {
        return offers[id][i].buyer;
    }  

    //returns the amount of the offer
    function getBid(uint id,uint i) public view returns (uint) {
        return offers[id][i].bid;
    }   

    //returns the car info

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

    function getImage(uint id) public view returns (string memory) {
        return(cars[id].image);
    }

    function getKMS(uint id) public view returns (uint) {
        return(cars[id].kilometraje);
    }

    function transferEther(uint256 _amount, address payable _to) public payable {
       _to.transfer(_amount);
    }

    function returnEther(uint id) internal {
      for(uint i = 0; i<offers[id].length; i++){
          if(offers[id][i].buyer != carToOwner[id]){
              uint256 amount = offers[id][i].bid * 1000000000000000000;
              address payable to = payable(offers[id][i].buyer);
              transferEther(amount,to);
          }
      }
    }

    receive() external payable{}
    fallback() external payable{} 

}