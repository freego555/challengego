var Challenge = artifacts.require("./Challenge.sol")
var Wallet = artifacts.require("./Wallet.sol")

module.exports = function (deployer) {
  try {

    var challenge, wallet

    deployer.deploy(Challenge).then(function (i) {
      challenge = i // get instance of Challenge
      console.log("Challenge deployed success")

      return deployer.deploy(Wallet).then(function (i) {
        wallet = i // get instance of Wallet
        console.log("Wallet deployed success")

        return challenge.setContractWallet(wallet.address).then(function () {
          console.log("Wallet address is set to Challenge successfully")

          return wallet.setContractChallenge(challenge.address).then(function () {
            console.log("Challenge address is set to Wallet successfully")

            console.log("DONE -- DEPLOY -- DONE")

            console.log('please add this to smart_contracts/conract_addresses.js file')
            console.log("challenge: '" + challenge.address + "',")
            console.log("wallet: '" + wallet.address + "',")
          })
        })
      })
    })


  } catch (e) {
    console.log("Not deployed" + e.message)
  }
}
