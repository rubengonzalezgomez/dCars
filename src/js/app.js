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
    $(document).on('click', '.btn-newcar', App.handleNewCar);
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
    console.log(brands);

    //Load models
    let models = [];
    for(i = 0;i < numCars; i++){
      models.push(await carInstance.getModel(i));
    }
    console.log(models);

    //Load prices
    let prices = [];
    for(i = 0;i < numCars; i++){
      prices.push(await carInstance.getPrice(i));
    }
    console.log(prices);

    //Print cars on sale
    var carsRow = $('#carsRow');
    var carTemplate = $('#carTemplate');

    for(i = 0;i < models.length; i++){
       carTemplate.find('.panel-title').text(brands[i] + ' ' + models[i]);
       //carTemplate.find('img').attr('src', cars[i].ipfsMetaData);
       carTemplate.find('.car-brand').text(brands[i]);
       carTemplate.find('.car-model').text(models[i]);
       carTemplate.find('.car-price').text(prices[i]);
       carTemplate.find('.btn-bid').attr('data-id', i);

       carsRow.append(carTemplate.html());
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
