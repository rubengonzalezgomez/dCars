//import {pinJSONToIPFS} from './pinata.js';
//const pinata = require('./pinata');

App = {
  web3Provider: null,
  contracts: {},
  pinata: null,

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
    // Set the provider for our contract
    App.contracts.CarOwnership.setProvider(App.web3Provider);

    return App.bindEvents();
  },

  bindEvents: function() {
    //$(document).on('click', '.btn-newcar', App.handleNewCar);
    return App.showCars();
  },

  showCars: async function(){
    // Load cars.
    let carInstance = await App.contracts.CarOwnership.deployed();

    const numCars = await carInstance.getNumCars();

    //Load brands
    let brands = [];
    for(i = 0;i < numCars; i++){
      brands.push(await carInstance.getBrand(i));
    }

    //Load models
    let models = [];
    for(i = 0;i < numCars; i++){
      models.push(await carInstance.getModel(i));
    }

    //Load prices
    let prices = [];
    for(i = 0;i < numCars; i++){
      prices.push(await carInstance.getPrice(i));
    }

    //Print my cars
    var MyCarsRow = $('#MyCarsRow');
    var carTemplate = $('#carTemplate');

    for(let i=0;i<numCars;i++) {
      const owner = await carInstance.getOwner(i);
      if(owner == web3.eth.accounts[0]){

      const newCar = carTemplate.clone();
      newCar.css({display: "inline"});
      newCar.find('.panel-title').text(brands[i] + ' ' + models[i]);
      newCar.find('img').attr('src', `https://gateway.pinata.cloud/ipfs/`+'QmZqffgHmmvoznQ32MMfymD1ivNNcazKxNjrMLZ35KuC5e'); //cars[i].image);
      const id = i;
      
      newCar.find('.car-owner').text(owner);
      newCar.find('.car-brand').text(brands[i]);
      newCar.find('.car-model').text(models[i]);

      const price = prices[i];
      if(price == 0 ){ newCar.find('.car-price').text('Not On Sale');}
      else{newCar.find('.car-price').text(price);}

      newCar.find('.btn-bid').attr('style', "Display: none");
      newCar.find('#bid-amount').attr('style', "Display: none");

      if(price == 0 ){
        newCar.find('.btn-mod').attr('style', "Display: none");
        newCar.find('#modify-amount').attr('style', "Display: none");
        newCar.find('#list-button').on('click', async () => {
          var list = document.getElementsByClassName("price")[id].value;
          carInstance.List(id,list,{"from" : web3.eth.accounts[0]});
      });
      }
      
      else{
      newCar.find('.btn-list').attr('style', "Display: none");
      newCar.find('#car-amount').attr('style', "Display: none");
      newCar.find('.btn-bid').attr('data-id', i);
      newCar.find('#bid-amount')
        .prop('min', prices[i] / 2)
        .prop('placeholder', "Min price: " + prices[i] / 2);
        newCar.find('#modify-button').on('click', async () => {
          var price = document.getElementsByClassName("modify")[id].value;
          carInstance.modifyPrice(id,price,{"from" : web3.eth.accounts[0]});
      });
      newCar.find('#bid-button').on('click', async () => {
          var bid = document.getElementsByClassName("amount")[id].value;
          carInstance.placeBid(id,bid,{"from" : web3.eth.accounts[0]});
      });
    }

      MyCarsRow.append(newCar);

      App.showOffers(id);
      }

     }


    //Print cars on sale
    var carsRow = $('#carsRow');
    var carTemplate = $('#carTemplate');

    for(let i=0;i<numCars;i++) {
      const owner = await carInstance.getOwner(i);
      if(owner != web3.eth.accounts[0]){

      const newCar = carTemplate.clone();
      newCar.css({display: "inline"});
      newCar.find('.panel-title').text(brands[i] + ' ' + models[i]);
      newCar.find('img').attr('src', `https://gateway.pinata.cloud/ipfs/`+'QmZqffgHmmvoznQ32MMfymD1ivNNcazKxNjrMLZ35KuC5e'); //cars[i].image);
      const id = i;
  
      newCar.find('.car-owner').text(owner);
      newCar.find('.car-brand').text(brands[i]);
      newCar.find('.car-model').text(models[i]);

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
          carInstance.modifyPrice(id,price,{"from" : web3.eth.accounts[0]});
      });
      newCar.find('#bid-button').on('click', async () => {
          var bid = document.getElementsByClassName("amount")[id].value;
          carInstance.placeBid(id,bid,{"from" : web3.eth.accounts[0]});
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
    var offersRow = $('#offersRow');
    var offerTemplate = $('#offerTemplate');

    for(let j = 0;j < numOffers; j++){

      const newOffer = offerTemplate.clone();
      const buyerid = j;
      const b = buyers[buyerid].toString(); 

      newOffer.css({display: "inline"});
      newOffer.find('.panel-title').text('Offer ' + j);
      newOffer.find('.offer-buyer').text(buyers[j]);
      newOffer.find('.offer-bid').text(bids[j]);
      newOffer.find('#sell-button').on('click', () => {
        carInstance.transferFrom(web3.eth.accounts[0],buyers[buyerid],id,{"from" : web3.eth.accounts[0]});
        const value = (1000000000000000000 * bids[buyerid]).toString();   
        web3.eth.sendTransaction(
          {from:"0x9aFcD9326310d5D161d6B77dE7ff3196b18B49ba",
            //buyers[buyerid],
          to:web3.eth.accounts[0],
          value:  value, 
              }, function(err, transactionHash) {
        if (!err)
          console.log(transactionHash + " success"); 
      });
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

    let carInstance = await App.contracts.CarOwnership.deployed();
    carInstance.createListNewCar(vin,brand,model,kms, image, price,{"from" : web3.eth.accounts[0]});
    App.createMetada(vin,brand,model,kms,image);
    },


    createMetadata: async function(vin,brand, model, kms, image){

      console.log("IN");
      const metadata = new Object();
      metadata.vin = vin;
      metadata.brand = brand;
      metadata.model = model;
      metadata.kms = kms
      metadata.image = image;
  
      const pinataResponse = await ('pinata.json').pinJSONToIPFS(metadata);
      if (!pinataResponse.success) {
        return {
            success: false,
            status: "😢 Something went wrong while uploading your tokenURI.",
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
