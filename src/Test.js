import React, {Component} from 'react';
import Web3 from 'web3';
import hosts from './dev/hosts';
import contractsAddresses from "./dev/contractsAddresses";
import challengeABI from './dev/contractsABI/Challenge.json';
import walletABI from './dev/contractsABI/Wallet.json';
import './css/style.css';

class Test extends Component {

  constructor (props) {
    super(props);

    const web3 = this.getWeb3(hosts.localHost);
    this.state = {
      web3,
      challenge: null,
      wallet: null,
      balance: 0,
      isObserver: null,
    };
  }

  getWeb3 = (host) => {
    return new Web3(new Web3.providers.HttpProvider(host));
  }

  connectToMetaMask = async () => {
    const {web3} = this.state;
    await window.ethereum.request({method: 'eth_requestAccounts'});
    await web3.eth.getAccounts().then(console.log);
  }

  setWeb3ToState = (host) => {
    let {web3} = this.state;
    web3 = new Web3(new Web3.providers.HttpProvider());
    console.log(web3);

    this.setState({ web3 } );
  }

  getBalanceOf = (address) => {
    const {web3} = this.state;
    web3.eth.getBalance(address).then((balance) => this.setState({ balance }));
  }

  getInstanceOfChallenge = () => {
    let {web3, challenge} = this.state;
    challenge = new web3.eth.Contract(challengeABI.abi, contractsAddresses.challenge);

    this.setState({challenge});
  }

  getInstanceOfWallet = () => {
    let {web3, wallet} = this.state;
    wallet = new web3.eth.Contract(walletABI.abi, contractsAddresses.wallet);

    this.setState({wallet});
  }

  getChallengeIsObserver = (challengeId, address) => {
    const {challenge} = this.state;
    challenge.methods.isObserver(challengeId, address).call().then((value) => {
      this.setState({isObserver: value});
    });
  }

  render () {
    return (
      <div className="App">
        <button onClick={() => this.connectToMetaMask()}>Connect to MetaMask</button>
        <button onClick={() => this.setWeb3ToState(hosts.localHost)}>Connect to local node</button>
        <button onClick={() => this.getBalanceOf('0x953ec0BC8B0d072Ce2838f9BC39eAa1Dd27D3a41')}>Get balance of</button>
        <button onClick={() => this.getInstanceOfChallenge()}>Get instance of Challenge</button>
        <button onClick={() => this.getInstanceOfWallet()}>Get instance of Wallet</button>
        <button onClick={() => this.getChallengeIsObserver(1, '0x953ec0BC8B0d072Ce2838f9BC39eAa1Dd27D3a41')}>Get isObserver of Challenge</button>
      </div>
    );
  }
}

export default Test;