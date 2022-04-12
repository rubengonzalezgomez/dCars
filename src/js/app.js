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
    $(document).on('click', '.btn-newcar', App.handleAdopt);
    return App.showCars();
  },

  showCars: async function(){
    var carsRow = $('#carsRow');
    var carTemplate = $('#carTemplate');

    // Load cars.
    let newCar = await App.contracts.CarOwnership.deployed();
    var carInstance = await newCar.createListNewCar("83274FHU","AUDI","A7",0, "METADATA", 20000,{'from':web3.eth.accounts[0]});

    let instance2 = await App.contracts.CarOwnership.deployed();
    carInstance = instance2;

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

  
 /* markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  }, 

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];

  App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;

    // Execute adopt as a transaction by sending account
    return adoptionInstance.adopt(petId, {from: account});
  }).then(function(result) {
    return App.markAdopted();
  }).catch(function(err) {
    console.log(err.message);
    });
  });
  }

  */


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
