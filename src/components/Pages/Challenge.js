import React, {Component} from "react";

import { Form, Input, InputNumber, Button, DatePicker } from 'antd';

class Challenge extends Component {
  constructor (props) {
    super(props);

    this.state = {
      challengeInfo: {
        id: null,
        guarantee: null,
        fine: null,
        start: null,
        finish: null,
        ownerOfChallenge: null,
        isAchiever: null,
        isObserver: null,
        myRole: null,
        lastAchieverId: null,
        lastObserverId: null,
        lastSchedulePeriodId: null,
      },
    };
  }

  onChangeChallengeId = (value) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.id = value;
    this.setState({challengeInfo});
  }

  onClickChallengeId = (e) => {
    this.getChallengeInfo();
  }

  getChallengeInfo = async () => {
    const {challenge} = this.props;
    let result = this.state.challengeInfo;
    const id = result.id;

    await challenge.methods.guarantee(id).call().then((value) => {
      console.log("guarantee", value);
      result.guarantee = value;
    });

    await challenge.methods.fine(id).call().then((value) => {
      console.log("fine", value);
      result.fine = value;
    });

    await challenge.methods.start(id).call().then((value) => {
      console.log("start", value);
      result.start = value;
    });

    await challenge.methods.ownerOfChallenge(id).call().then((value) => {
      console.log("ownerOfChallenge", value);
      result.ownerOfChallenge = value;
      result.myRole = (value) ? 'owner' : result.myRole;
    });

    await challenge.methods.isAchiever(id, this.props.accountAddress).call().then((value) => {
      console.log("isAchiever", value);
      result.isAchiever = value;
      result.myRole = (value) ? 'achiever' : result.myRole;
    });

    await challenge.methods.isObserver(id, this.props.accountAddress).call().then((value) => {
      console.log("isObserver", value);
      result.isObserver = value;
      result.myRole = (value) ? 'observer' : result.myRole;
    });

    await challenge.methods.lastAchieverId(id).call().then((value) => {
      console.log("lastAchieverId", value);
      result.lastAchieverId = value;
    });

    await challenge.methods.lastObserverId(id).call().then((value) => {
      console.log("lastObserverId", value);
      result.lastObserverId = value;
    });

    await challenge.methods.lastSchedulePeriodId(id).call().then((value) => {
      console.log("lastSchedulePeriodId", value);
      result.lastSchedulePeriodId = value;
    });

    result.finish = result.start;
    for (let i = 1; i <= result.lastSchedulePeriodId; i++) {
      await challenge.methods.schedule(id, i).call().then((value) => {
        console.log(i, "schedule value", value);
        result.finish += value;
      });
    }

    this.setState({challengeInfo: result});
  }

  render() {
    return (
      <div>
        <div>
          Challenge ID
          <InputNumber onChange={this.onChangeChallengeId} />
          <Button type='primary' onClick={this.onClickChallengeId}>Get</Button>
        </div>

        <div>
          <div>Start date: {new Date(this.state.challengeInfo.start)}</div>
        </div>
      </div>
    );
  }
}

export default Challenge;
