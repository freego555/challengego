import React, {Component} from 'react';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from 'react-router-dom'

import { Layout, Menu, Breadcrumb, Button } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  ExportOutlined,
} from '@ant-design/icons';

import './css/style.css';
import 'antd/dist/antd.css';

import CreateChallenge from './components/Pages/CreateChallenge';
import Home from './components/Pages/Home';
import Challenge from "./components/Pages/Challenge";

import Web3 from 'web3';
import challengeABI from "./dev/contractsABI/Challenge.json"
import contractsAddresses from "./dev/contractsAddresses"
import walletABI from "./dev/contractsABI/Wallet.json"

import MetamaskOnboarding from '@metamask/onboarding'
const metamaskOnboarding = new MetamaskOnboarding()

const { Header, Content, Footer, Sider } = Layout;

class App extends Component {
  constructor (props) {
    super(props);

    const web3 = this.getWeb3();

    this.state = {
      collapsed: false,
      onClickSignInOut: null,
      nameSignInOut: 'Sign In',
      accountAddress: '',
      chainId: '',
      web3,
      challenge: {},
      wallet: {},
    }
  }

  componentDidMount () {
    console.log('App did mount')
    this.metamaskClientCheck()
    this.setInstanceOfChallenge()
    this.setInstanceOfWallet()
    window.ethereum.on('accountsChanged', this.onAccountsChanged)
    window.ethereum.on('chainChanged', this.onChainChanged)
  }

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  onClickConnect = async (e) => {
    let {nameSignInOut} = this.state
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      nameSignInOut = 'Sign Out'
    } catch (error) {
      console.error(error)
    }
    this.setState({nameSignInOut})
  }

  onClickInstall = (e) => {
    let {nameSignInOut} = this.state
    nameSignInOut = 'Onboarding is in progress'
    metamaskOnboarding.startOnboarding()
    this.setState({nameSignInOut})
  }

  onAccountsChanged = (accounts) => {
    this.setState({accountAddress: accounts[0]})
  }

  onChainChanged = (chainId) => {
    this.setState({chainId})
  }

  isMetamaskInstalled = () => {
    const { ethereum } = window
    return Boolean(ethereum && ethereum.isMetaMask)
  }

  metamaskClientCheck = async () => {
    let {onClickSignInOut, nameSignInOut, accountAddress, chainId} = this.state
    if (this.isMetamaskInstalled()) {
      onClickSignInOut = this.onClickConnect
      const accounts = await window.ethereum.request({method: 'eth_accounts'})
      nameSignInOut = accounts.length > 0 ? 'Sign Out' : 'Sign In'
      accountAddress = accounts[0]
      chainId = window.ethereum.chainId
    } else {
      onClickSignInOut = this.onClickInstall
      nameSignInOut = 'Install Metamask'
    }
    this.setState({onClickSignInOut, nameSignInOut, accountAddress, chainId})
  }

  getWeb3 = () => {
    return new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
  }

  setInstanceOfChallenge = () => {
    let {web3, challenge} = this.state;
    challenge = new web3.eth.Contract(challengeABI.abi, contractsAddresses.challenge);

    this.setState({challenge});
  }

  setInstanceOfWallet = () => {
    let {web3, wallet} = this.state;
    wallet = new web3.eth.Contract(walletABI.abi, contractsAddresses.wallet);

    this.setState({wallet});
  }

  render() {
    console.log('App render')
    const { collapsed } = this.state;
    return (
      <Router>
      <Layout style={{ minHeight: '100vh' }}>

        {/*TODO: Hide button text in Sider's onCollapse*/}
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <div className="logo" />
          <Button type="primary" icon={<ExportOutlined />} onClick={this.state.onClickSignInOut}>{this.state.nameSignInOut}</Button>

          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<PieChartOutlined />}>
              <Link to='/'>HOME</Link>
            </Menu.Item>

            <Menu.Item key="2" icon={<DesktopOutlined />}>
              <Link to='/create'>Create</Link>
            </Menu.Item>

            <Menu.Item key="3" icon={<DesktopOutlined />}>
              <Link to='/connect'>Connect to</Link>
            </Menu.Item>

            <Menu.Item key="4" icon={<DesktopOutlined />}>
              <Link to='/archive'>Archive</Link>
            </Menu.Item>

            <Menu.Item key="5" icon={<DesktopOutlined />}>
              <Link to='/about'>About</Link>
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0 }} />

          <Content style={{ margin: '0 16px' }}>
            <Switch>

              <Route path='/' exact>
                <Home
                  accountAddress={this.state.accountAddress}
                  chainId={this.state.chainId}
                  web3={this.state.web3}
                  challenge={this.state.challenge}
                  wallet={this.state.wallet}
                />
              </Route>

              <Route path='/challenge' exact>
                <Challenge
                  accountAddress={this.state.accountAddress}
                  chainId={this.state.chainId}
                  web3={this.state.web3}
                  challenge={this.state.challenge}
                  wallet={this.state.wallet}
                />
              </Route>

              <Route path='/create'>
                <CreateChallenge
                  accountAddress={this.state.accountAddress}
                  chainId={this.state.chainId}
                  web3={this.state.web3}
                  challenge={this.state.challenge}
                  wallet={this.state.wallet}
                />
              </Route>

              <Route path='/connect'>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                  Connect to existed Challenge
                </div>
              </Route>

              <Route path='/archive'>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                  Archive of finished Challenges
                </div>
              </Route>

              <Route path='/about'>
                <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
                  About
                </div>
              </Route>
            </Switch>
          </Content>

          <Footer style={{ textAlign: 'center' }}>Ant Design ©2020 Created by FReego</Footer>
        </Layout>
      </Layout>
      </Router>
    );
  }
}

export default App;