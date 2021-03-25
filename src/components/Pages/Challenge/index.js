import React, {Component} from "react";

import { Form, Input, InputNumber, Button, DatePicker } from 'antd';
import { Row, Col } from 'antd';
import ScheduleRow from './Blocks/ScheduleRow';
import moment from 'moment';

class Challenge extends Component {
  constructor (props) {
    super(props);

    this.state = {
      challengeInfo: {
        id: 0,
        guarantee: 0,
        fine: 0,
        start: 0,
        finish: 0,
        ownerOfChallenge: '',
        isAchiever: false,
        isObserver: false,
        myRole: '',
        lastAchieverId: 0,
        lastObserverId: 0,
        lastSchedulePeriodId: 0,
        schedule: [],
      },
      isEditingSchedule: false,
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
      result.guarantee = +value;
    });

    await challenge.methods.fine(id).call().then((value) => {
      console.log("fine", value);
      result.fine = +value;
    });

    await challenge.methods.start(id).call().then((value) => {
      console.log("start", value);
      result.start = +value;
    });

    result.myRole = '';
    await challenge.methods.ownerOfChallenge(id).call().then((value) => {
      console.log("ownerOfChallenge", value);
      result.ownerOfChallenge = value;
      result.myRole = (value) ? 'owner' : result.myRole;
    });

    await challenge.methods.isAchiever(id, this.props.accountAddress).call().then((value) => {
      console.log("isAchiever", value);
      result.isAchiever = Boolean(value);
      result.myRole = (value) ? 'achiever' : result.myRole;
    });

    await challenge.methods.isObserver(id, this.props.accountAddress).call().then((value) => {
      console.log("isObserver", value);
      result.isObserver = Boolean(value);
      result.myRole = (value) ? 'observer' : result.myRole;
    });

    await challenge.methods.lastAchieverId(id).call().then((value) => {
      console.log("lastAchieverId", value);
      result.lastAchieverId = +value;
    });

    await challenge.methods.lastObserverId(id).call().then((value) => {
      console.log("lastObserverId", value);
      result.lastObserverId = +value;
    });

    await challenge.methods.lastSchedulePeriodId(id).call().then((value) => {
      console.log("lastSchedulePeriodId", value);
      result.lastSchedulePeriodId = +value;
    });

    result.finish = result.start;
    for (let i = 1; i <= result.lastSchedulePeriodId; i++) {
      await challenge.methods.schedule(id, i).call().then((value) => {
        console.log(i, "schedule value", value);
        result.finish += +value;
        result.schedule.push({duration: value, beginDate: '', endDate: '', isNew: false, isEditing: false, isDeleting: false});
      });
    }

    this.setState({challengeInfo: result});
  }

  onEditSchedule = (e, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isEditing = true;

    this.setState({challengeInfo, isEditingSchedule: true});
  }

  onConfirmEditSchedule = (endDate, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isEditing = false;
    challengeInfo.schedule[index].endDate = endDate;
    challengeInfo.schedule[index].duration = challengeInfo.schedule[index].endDate.unix() - challengeInfo.schedule[index].beginDate.unix();

    this.setState({challengeInfo, isEditingSchedule: false});
  }

  onDiscardEditSchedule = (e, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isEditing = false;

    this.setState({challengeInfo, isEditingSchedule: false});
  }

  onDeleteSchedule = (e, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isDeleting = true;

    this.setState({challengeInfo, isEditingSchedule: true});
  }

  onConfirmDeleteSchedule = (e, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule.splice(index, 1);

    this.setState({challengeInfo, isEditingSchedule: false});
  }

  onDiscardDeleteSchedule = (e, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isDeleting = false;

    this.setState({challengeInfo, isEditingSchedule: false});
  }

  render() {
    let beginDateUnix = this.state.challengeInfo.start;

    return (
      <div>
        <div>
          Challenge ID
          <InputNumber onChange={this.onChangeChallengeId} />
          <Button type='primary' onClick={this.onClickChallengeId}>Get</Button>
        </div>

        <div>
          {(this.state.challengeInfo.start) ? <div>Start date: {moment.unix(this.state.challengeInfo.start).toString()}</div> : null}
          {(this.state.challengeInfo.myRole) ? <div>My role: {this.state.challengeInfo.myRole}</div> : null}
          {(this.state.challengeInfo.lastAchieverId) ? <div>Participants amount: {this.state.challengeInfo.lastAchieverId}</div> : null}
          {(this.state.challengeInfo.lastObserverId) ? <div>Observers amount: {this.state.challengeInfo.lastObserverId}</div> : null}
          {(this.state.challengeInfo.guarantee) ? <div>Guarantee: {this.state.challengeInfo.guarantee}</div> : null}
          {(this.state.challengeInfo.fine) ? <div>Fine: {this.state.challengeInfo.fine}</div> : null}

          <h1>Challenge Schedule</h1>
          <Row>
            <Col>#</Col>
            <Col>Begin date</Col>
            <Col>End date</Col>
            <Col>Actions</Col>
          </Row>

          {this.state.challengeInfo.schedule.map((period, index) => {
            period.beginDate = moment.unix(beginDateUnix);
            period.endDate = moment.unix(beginDateUnix + period);
            beginDateUnix += period;

            return (
              <ScheduleRow
                key={index}
                beginDate={period.beginDate}
                endDate={period.endDate}
                isEditing={period.isEditing}
                isDeleting={period.isDeleting}
                editButton={{func: this.onEditSchedule, isAvailable: period.isNew && !this.state.isEditingSchedule}}
                confirmEditButton={{func: this.onConfirmEditSchedule, isAvailable: period.isEditing}}
                discardEditButton={{func: this.onDiscardEditSchedule, isAvailable: period.isEditing}}
                confirmDeleteButton={{func: this.onConfirmDeleteSchedule, isAvailable: period.isDeleting}}
                discardDeleteButton={{func: this.onDiscardDeleteSchedule, isAvailable: period.isDeleting}}
                deleteButton={{func: this.onDeleteSchedule, isAvailable: period.isNew && !this.state.isEditingSchedule}}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default Challenge;