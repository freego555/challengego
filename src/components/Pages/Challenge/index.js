import React, {Component} from "react";

import { Form, Input, InputNumber, Descriptions, Space } from 'antd';
import { Col } from 'antd';
import { ButtonStyled, SpaceFlex, RowStyled } from '../../../styled';
import ScheduleRow from './Blocks/ScheduleRow';
import moment from 'moment';

class Challenge extends Component {
  constructor (props) {
    super(props);

    this.state = {
      challengeInfo: {
        id: 0,
        gotten: false,
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
    challengeInfo.gotten = false;
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
    result.schedule = [];
    for (let i = 1; i <= result.lastSchedulePeriodId; i++) {
      await challenge.methods.schedule(id, i).call().then((value) => {
        console.log(i, "schedule value", value);
        result.finish += +value;
        result.schedule.push({duration: +value, beginDate: '', endDate: '', status: 'saved', txHash: '', isEditing: false, isDeleting: false});
      });
    }

    result.gotten = (result.start !== 0);

    this.setState({challengeInfo: result});
  }

  onAddSchedule = (beginDate, endDate) => {
    const newDuration = endDate.unix() - beginDate.unix();
    if (newDuration <= 0) return;

    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule.push({
      duration: newDuration,
      status: 'new',
      isEditing: false,
      isDeleting: false
    });

    this.setState({challengeInfo});
  }

  onEditSchedule = (e, index) => {
    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isEditing = true;

    this.setState({challengeInfo, isEditingSchedule: true});
  }

  onConfirmEditSchedule = (beginDate, endDate, index) => {
    const newDuration = endDate.unix() - beginDate.unix();
    if (newDuration <= 0) return;

    let challengeInfo = this.state.challengeInfo;
    challengeInfo.schedule[index].isEditing = false;
    challengeInfo.schedule[index].duration = newDuration;

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

  onClickAddToSchedule = async (e) => {
    let challengeInfo = this.state.challengeInfo;
    const { challenge, accountAddress } = this.props;

    let schedule = [];
    for (let i = 0; i < challengeInfo.schedule.length; i++) {
      if (challengeInfo.schedule[i].status === 'new') {
        schedule.push(challengeInfo.schedule[i].duration);
        challengeInfo.schedule[i].status = 'sent';
        if (schedule.length === 10) {
          break;
        }
      }
    }

    // Filling schedule to make it an array with length 10
    for (let i = schedule.length; i < 10; i++) {
      schedule.push(0);
    }

    await challenge.methods.addToSchedule(challengeInfo.id, schedule).send({from: accountAddress}).then(() => {
      let challengeInfo = this.state.challengeInfo;

      for (let i = 0; i < challengeInfo.schedule.length; i++) {
        if (challengeInfo.schedule[i].status !== 'saved') {
          challengeInfo.schedule[i].status = 'saved';
        }
      }

      console.log('Challenge Schedule is updated!');
      this.setState({challengeInfo});
    });

    this.setState({challengeInfo});
  }

  render() {
    let beginDateUnix = this.state.challengeInfo.start;
    let indexRow = 0;

    return (
      <div>
        <SpaceFlex>
          <label>Challenge ID:</label>
          <InputNumber id={"challengeId"} onChange={this.onChangeChallengeId} />
          <ButtonStyled type='primary' onClick={this.onClickChallengeId}>Get</ButtonStyled>
        </SpaceFlex>

        {(this.state.challengeInfo.gotten) ?
          <div>
            <Descriptions title={'Challenge Info'} style={{padding: '5px 0px 5px 0px'}}>
              <Descriptions.Item
                label={'Start date'}>{moment.unix(this.state.challengeInfo.start).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label={'My role'}>{this.state.challengeInfo.myRole}</Descriptions.Item>
              <Descriptions.Item
                label={'Participants amount'}>{this.state.challengeInfo.lastAchieverId}</Descriptions.Item>
              <Descriptions.Item
                label={'Observers amount'}>{this.state.challengeInfo.lastObserverId}</Descriptions.Item>
              <Descriptions.Item label={'Guarantee'}>{this.state.challengeInfo.guarantee}</Descriptions.Item>
              <Descriptions.Item label={'Fine'}>{this.state.challengeInfo.fine}</Descriptions.Item>
            </Descriptions>

            <Space>
              <h1>Challenge Schedule</h1>
              <ButtonStyled type='primary' onClick={this.onClickAddToSchedule}>Send schedule changes to blockchain</ButtonStyled>
            </Space>
            <RowStyled>
              <Col span={1}>#</Col>
              <Col span={4}>Begin date</Col>
              <Col span={4}>End date</Col>
              <Col span={6}>Actions</Col>
            </RowStyled>

            {(this.state.challengeInfo.schedule.length) ?
              this.state.challengeInfo.schedule.map((period, index) => {
                const beginDate = moment.unix(beginDateUnix);
                const endDate = moment.unix(beginDateUnix + period.duration);
                beginDateUnix += period.duration;

                return (
                  <ScheduleRow
                    key={indexRow}
                    index={indexRow++}
                    beginDate={beginDate}
                    endDate={endDate}
                    isEditing={period.isEditing}
                    isDeleting={period.isDeleting}
                    addButton={{
                      func: () => {
                      }, isAvailable: false,
                    }}
                    editButton={{
                      func: this.onEditSchedule,
                      isAvailable: period.status === 'new' && !this.state.isEditingSchedule,
                    }}
                    confirmEditButton={{func: this.onConfirmEditSchedule, isAvailable: period.isEditing}}
                    discardEditButton={{func: this.onDiscardEditSchedule, isAvailable: period.isEditing}}
                    confirmDeleteButton={{func: this.onConfirmDeleteSchedule, isAvailable: period.isDeleting}}
                    discardDeleteButton={{func: this.onDiscardDeleteSchedule, isAvailable: period.isDeleting}}
                    deleteButton={{
                      func: this.onDeleteSchedule,
                      isAvailable: period.status === 'new' && !this.state.isEditingSchedule,
                    }}
                  />
                );
              })
              : null}

            {!this.state.isEditingSchedule ?
              <ScheduleRow
                key={indexRow}
                index={indexRow++}
                beginDate={moment.unix(beginDateUnix)}
                endDate={moment.unix(beginDateUnix)}
                isEditing={false}
                isDeleting={false}
                addButton={{func: this.onAddSchedule, isAvailable: true}}
                editButton={{
                  func: () => {
                  }, isAvailable: false,
                }}
                confirmEditButton={{
                  func: () => {
                  }, isAvailable: false,
                }}
                discardEditButton={{
                  func: () => {
                  }, isAvailable: false,
                }}
                confirmDeleteButton={{
                  func: () => {
                  }, isAvailable: false,
                }}
                discardDeleteButton={{
                  func: () => {
                  }, isAvailable: false,
                }}
                deleteButton={{
                  func: () => {
                  }, isAvailable: false,
                }}
              />
              : null
            }
          </div>
          : <h1>Choose an existed challenge to see its info.</h1>
        }
      </div>
    );
  }
}

export default Challenge;
