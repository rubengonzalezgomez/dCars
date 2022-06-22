const pinata = require('./pinata.js');

App = {
  web3Provider: null,
  contracts: {},
  contractAddress : null,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });;
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
  }
  web3 = new Web3(App.web3Provider);

      return App.initContract();
  },

  initContract: async function() {
    let CarArtifact = await (await fetch('CarOwnership.json')).json();
    App.contracts.CarOwnership = TruffleContract(CarArtifact);
    contractAddress = CarArtifact.networks[5777].address;
    // Set the provider for our contract
    App.contracts.CarOwnership.setProvider(App.web3Provider);

    return App.showCars();
  },

  showCars: async function(){

    // Load cars. 
    let carInstance = await App.contracts.CarOwnership.deployed();

    const numCars = await carInstance.getNumCars();

    //Load images
    let images = [];

    //Load brands
    let brands = [];

    //Load models
    let models = [];

    //Load prices
    let prices = [];

    //Load kilometraje
    let kms = [];

    for(i = 0;i < numCars; i++){
      images.push(await carInstance.getImage(i));
      brands.push(await carInstance.getBrand(i));
      models.push(await carInstance.getModel(i));
      prices.push(await carInstance.getPrice(i));
      kms.push(await carInstance.getKMS(i));
    }

    //Print my cars
    var MyCarsRow = $('#MyCarsRow');
    var carTemplate = $('#carTemplate');

    for(let i=0;i<numCars;i++) {
      let owner = await carInstance.ownerOf(i);
      if(owner == web3.eth.accounts[0]){
      
      const newCar = carTemplate.clone();
      newCar.css({display: "inline"});
      newCar.find('.panel-title').text(brands[i] + ' ' + models[i]);
      newCar.find('img')
        .attr('src', images[i])  
      const id = i;
      
      newCar.find('.car-owner').text(owner.substr(0,5) + "..." + owner.substr(-5,5));
      newCar.find('.car-brand').text(brands[i]);
      newCar.find('.car-model').text(models[i]);
      newCar.find('.car-kms').text(kms[i]);

      const price = prices[i];
      if(price == 0 ){
        newCar.find('.car-price').text('Not On Sale');
        newCar.find('.btn-mod').attr('style', "Display: none");
        newCar.find('#modify-amount').attr('style', "Display: none");
        newCar.find('.btn-unlist').attr('style', "Display: none");
        newCar.find('#list-button').on('click', async () => {
          var list = document.getElementsByClassName("price")[id].value;
          carInstance.setPrice(id,list,{"from" : web3.eth.accounts[0]});
        });
        }
      else{
        newCar.find('.car-price').text(price);
        newCar.find('.btn-list').attr('style', "Display: none");
        newCar.find('#car-amount').attr('style', "Display: none");
        newCar.find('.btn-bid').attr('data-id', i);
        newCar.find('#bid-amount')
          .prop('min', prices[i] / 2)
          .prop('placeholder', "Min price: " + prices[i] / 2);
        newCar.find('#modify-button').on('click', async () => {
          var price = document.getElementsByClassName("modify")[id].value;
          carInstance.setPrice(id,price,{"from" : web3.eth.accounts[0]});
      });
      newCar.find('#bid-button').on('click', async () => {
          var bid = document.getElementsByClassName("amount")[id].value;
          carInstance.placeBid(id,bid,{"from" : web3.eth.accounts[0]});
      });
      newCar.find('#unlist-button').on('click', async () => {
        carInstance.unlist(id,{"from" : web3.eth.accounts[0]});
    });
      }

      MyCarsRow.append(newCar);

      await App.showOffers(id);

    }

    }


    //Print cars on sale
    var carsRow = $('#carsRow');
    var carTemplate = $('#carOnSaleTemplate');

    for(let i=0;i<numCars;i++) {
      const owner = await carInstance.ownerOf(i);
      if(owner != web3.eth.accounts[0]){

      const newCar = carTemplate.clone();
      newCar.css({display: "inline"});
      newCar.find('.panel-title').text(brands[i] + ' ' + models[i]);
      newCar.find('img')
        .attr('src', images[i])
        .attr('width',"140")
        .attr('height',"180");
      const id = i;
  
      newCar.find('.car-owner').text(owner.substr(0,5) + "..." + owner.substr(-5,5));
      newCar.find('.car-brand').text(brands[i]);
      newCar.find('.car-model').text(models[i]);
      newCar.find('.car-kms').text(kms[i]);

      const price = prices[i];
      if(price == 0 ){ newCar.find('.car-price').text('Not On Sale');}
      else{newCar.find('.car-price').text(price);}
      
      newCar.find('.btn-mod').attr('style', "Display: none");
      newCar.find('#modify-amount').attr('style', "Display: none");
      newCar.find('.btn-list').attr('style', "Display: none");
      newCar.find('#car-amount').attr('style', "Display: none");

      if(price == 0 ){
        newCar.find('.btn-bid').attr('style', "Display: none");
        newCar.find('#bid-amount').attr('style', "Display: none");
      }
      
      else{
      newCar.find('.btn-bid').attr('data-id', i);
      newCar.find('#bid-amount')
        .prop('min', prices[i] / 2)
        .prop('placeholder', "Min price: " + prices[i] / 2);
        newCar.find('#modify-button').on('click', async () => {
          var price = document.getElementsByClassName("modify")[id].value;
          carInstance.setPrice(id,price,{"from" : web3.eth.accounts[0]});
      });
      newCar.find('#bid-button').on('click', async () => {
          var bid = document.getElementsByClassName("amount")[id].value;
          //carInstance.placeBid(id,bid,{"from" : web3.eth.accounts[0]});
          const value = web3.toWei(bid).toString(); 
          web3.eth.sendTransaction( 
            {from:web3.eth.accounts[0],
            to:contractAddress,
            value: value, 
                }, function(err, transactionHash) {
          if (!err){
            console.log(transactionHash + " success"); 
            carInstance.placeBid(id,bid,{"from" : web3.eth.accounts[0]});
          }
        });
      });
    }

      carsRow.append(newCar);

     }
    }
    
  },

  showOffers: async function(id) {
  
    let carInstance = await App.contracts.CarOwnership.deployed();
    const numOffers = await carInstance.howManyOffers(id);

    //Load buyers
    let buyers = [];
    for(i = 0;i < numOffers; i++){
      buyers.push(await carInstance.getBuyer(id,i));
    }
    //Load bids
    let bids = [];
    for(i = 0;i < numOffers; i++){
      bids.push(await carInstance.getBid(id,i));
    }
    //Print offers
    var offersRow = $('#MyCarsRow');
    var offerTemplate = $('#offerTemplate');

    for(let j = 0;j < numOffers; j++){

      const newOffer = offerTemplate.clone();
      const buyerid = j;

      newOffer.css({display: "inline"});
      newOffer.find('.panel-title').text('Offer ' + (j+1));
      newOffer.find('.offer-buyer').text(buyers[j].substr(0,4) + "..." + buyers[j].substr(-4,5));
      newOffer.find('.offer-bid').text(bids[j]);
      newOffer.find('#sell-button').on('click', () => {
        carInstance.transferFrom(web3.eth.accounts[0],buyers[buyerid],id,{"from" : web3.eth.accounts[0]});
        const value = web3.toWei(bids[j]).toString();
        carInstance.transferEther(value, web3.eth.accounts[0],{"from" : web3.eth.accounts[0]});
    }); 

      offersRow.append(newOffer);
     }
  },



  handleNewCar: async function() {
    var vin = document.getElementById("VIN").value;
    var brand = document.getElementById("brand").value;
    var model = document.getElementById("model").value;
    var kms = document.getElementById("kms").value;
    var image = document.getElementById("image").value;
    var price = document.getElementById("price").value;

    console.log(price);

    let carInstance = await App.contracts.CarOwnership.deployed();
    await carInstance.createListNewCar(vin,brand,model,kms, image,price,{"from" : web3.eth.accounts[0]}).toString();
    
    await App.createMetadata(vin,brand,model,kms, image);

    setTimeout(()=>{window.location.reload()}, 8000);
    
    },


    createMetadata: async function(vin,brand, model, kms, image){
      
      const metadata = new Object();
      metadata.vin = vin;
      metadata.brand = brand;
      metadata.model = model;
      metadata.kms = kms
      metadata.image = image;
      
      const pinataResponse = await pinata(metadata);
      if (!pinataResponse.success) {
        return {
            success: false,
            status: "Something went wrong while uploading your tokenURI.",
        }
      } 
      const tokenURI = pinataResponse.pinataUrl;
      console.log(tokenURI);
      return tokenURI;  
    }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
