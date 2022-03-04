const CarSale = artifacts.require("./CarOwnership.sol") //need ownership methods for test purposes
const tryCatch = require("./exceptions.js").tryCatch //for testing reverts
const errTypes = require("./exceptions.js").errTypes