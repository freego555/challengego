import React, {Component} from 'react'

import { Form, Input, InputNumber, Button, DatePicker } from 'antd';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
}

const validateMessages = {
  required: '${label} is required!',
  types: {
    date: '${label} is not a valid ${type}',
  },
  number: {
    min: '${label} must be greater than ${min}',
  },
}

class CreateChallenge extends Component {
  constructor (props) {
    super(props);

    /*console.log('this.props.accountAddress', this.props.accountAddress)
    console.log('props.accountAddress', props.accountAddress)*/

    this.state = {
      balance: 0,
      isObserver: null,
      lastChallengeId: null,
      start: null,
      guarantee: null,
      fine: null,
    };
  }

  componentDidMount () {
    console.log('Create did mount')
    //console.log('this.props.accountAddress', this.props.accountAddress)
    //this.getBalanceOf(this.props.accountAddress);
  }

  componentDidUpdate (prevProps, prevState, snapshot) {

  }

  onFinish = async values => {
    console.log(values);
    await this.addChallenge(values.challenge.startDate.unix(), values.challenge.guarantee, values.challenge.fine);
    await this.getChallengeLastChallengeId();
    this.getChallengeStart(this.state.lastChallengeId);
    this.getChallengeGuarantee(this.state.lastChallengeId);
    this.getChallengeFine(this.state.lastChallengeId);

    /*transferTokens.onclick = (event) => {
      console.log(`event`, event)
      contract.transfer('0x2f318C334780961FB129D2a6c30D0763d9a5C970', '15000', {
        from: accounts[0],
        to: contract.address,
        data: '0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c9700000000000000000000000000000000000000000000000000000000000003a98',
        gas: 60000,
        gasPrice: '20000000000',
      }, (result) => {
        console.log('result', result)
      })
    }*/
  };

  getBalanceOf = (address) => {
    const {web3} = this.props.web3;
    web3.eth.getBalance(address).then((balance) => this.setState({ balance }));
  }

  addChallenge = async (start, guarantee, fine) => {
    const {challenge} = this.props;
    return challenge.methods.addChallenge(start, guarantee, fine).send({from: this.props.accountAddress}).then(() => {
      //this.setState({isObserver: value});
      console.log('Challenge is added!');
    });
  }

  getChallengeIsObserver = async (challengeId, address) => {
    const {challenge} = this.props;
    challenge.methods.isObserver(challengeId, address).call().then((value) => {
      this.setState({isObserver: value});
    });
  }

  getChallengeLastChallengeId = async () => {
    const {challenge} = this.props;
    return challenge.methods.lastChallengeId().call().then((value) => {
      this.setState({lastChallengeId: value});
    });
  }

  getChallengeStart = async (challengeId) => {
    const {challenge} = this.props;
    return challenge.methods.start(challengeId).call().then((value) => {
      this.setState({start: value});
    });
  }

  getChallengeGuarantee = async (challengeId) => {
    const {challenge} = this.props;
    return challenge.methods.guarantee(challengeId).call().then((value) => {
      this.setState({guarantee: value});
    });
  }

  getChallengeFine = async (challengeId) => {
    const {challenge} = this.props;
    return challenge.methods.fine(challengeId).call().then((value) => {
      this.setState({fine: value});
    });
  }

  render () {
    console.log('Create render')
    console.log('this.props.accountAddress', this.props.accountAddress)

    return (
      <div className="site-layout-background" style={{padding: 24, minHeight: 360}}>
        <h2 style={{textAlign: 'center'}}>Creating of new Challenge</h2>
        <Form {...layout} name="nest-messages" onFinish={this.onFinish} validateMessages={validateMessages}>
          <Form.Item
            name={['challenge', 'name']}
            label="Challenge name"
            rules={[
              {
                required: false,
                type: 'string',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={['challenge', 'startDate']}
            label="Start date"
            rules={[
              {
                required: true,
                type: 'object',
                message: 'Please select time!',
              },
            ]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            name={['challenge', 'guarantee']}
            label="Sum of guarantee (wei)"
            rules={[
              {
                required: true,
                type: 'number',
                min: 1,
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item
            name={['challenge', 'fine']}
            label="Sum of fine (wei)"
            rules={[
              {
                required: true,
                type: 'number',
                min: 0,
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

export default CreateChallenge;
