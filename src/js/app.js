App = {
  web3Provider: null,
  contracts: {},

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

    //Print cars on sale
    var carsRow = $('#carsRow');
    var carTemplate = $('#carTemplate');

    for(i = 0;i < numCars; i++){
      const newCar = carTemplate.clone();
      newCar.css({display: "inline"});
      newCar.find('.panel-title').text(brands[i] + ' ' + models[i]);
      newCar.find('img').attr('src', `https://picsum.photos/seed/${models[i]}/140/140`); //cars[i].ipfsMetaData);
      const id = i;
      const owner = await carInstance.getOwner(i);
      newCar.find('.car-owner').text(owner);
      newCar.find('.car-brand').text(brands[i]);
      newCar.find('.car-model').text(models[i]);
      newCar.find('.car-price').text(prices[i]);
      newCar.find('.btn-bid').attr('data-id', i);
      newCar.find('#bid-amount')
        .prop('min', prices[i] / 2)
        .prop('placeholder', "Min price: " + prices[i] / 2);
      newCar.find('#bid-button').on('click', () => {
          var bid = document.getElementById("bid-amount").value;
          carInstance.placeBid(id,bid,{"from" : web3.eth.accounts[0]})
      });

      App.showOffers(id);

      carsRow.append(newCar);
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
    console.log(buyers);
    console.log(bids);
    //Print offers
    var offersRow = $('#offersRow');
    var offerTemplate = $('#offerTemplate');

    for(i = 0;i < numOffers; i++){

      const newOffer = offerTemplate.clone();
      newOffer.css({display: "inline"});
      newOffer.find('.panel-title').text('Offer ' + i);
      newOffer.find('.offer-buyer').text(buyers[i]);
      newOffer.find('.offer-bid').text(bids[i]);
      
      offersRow.append(newOffer);
     }
  },


  handleNewCar: async function() {
    var vin = document.getElementById("VIN").value;
    var brand = document.getElementById("brand").value;
    var model = document.getElementById("model").value;
    var kms = document.getElementById("kms").value;
    var metadata = document.getElementById("metadata").value;
    var price = document.getElementById("price").value;


    let carInstance = await App.contracts.CarOwnership.deployed();
    carInstance.createListNewCar(vin,brand,model,kms, metadata, price,{"from" : web3.eth.accounts[0]});
    }


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
