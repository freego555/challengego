import React, {Component} from "react";

class Home extends Component {
  constructor (props) {
    super(props);

    this.state = {
      arrayOfChallenges: [],
    }
  };


  getAllChallenges = async () => {
    const {challenge} = this.props;
    let lastChallengeId, guarantee, fine;
    let challengeObject = {id: 0, guarantee: 0, fine: 0};
    let arrayOfChallenges = [];

    await challenge.methods.lastChallengeId().call().then((value) => {
      console.log("lastChallengeId", value);
      lastChallengeId = value;
    });

    for (let id = 1; id <= lastChallengeId; id++) {
      challengeObject = {};
      challengeObject.id = id;

      await challenge.methods.guarantee(id).call().then((value) => {
        console.log("guarantee", value);
        challengeObject.guarantee = value;
      });

      await challenge.methods.fine(id).call().then((value) => {
        console.log("fine", value);
        challengeObject.fine = value;
      });

      await challenge.methods.start(id).call().then((value) => {
        console.log("start", value);
        challengeObject.start = value;
      });

      await challenge.methods.ownerOfChallenge(id).call().then((value) => {
        console.log("ownerOfChallenge", value);
        challengeObject.ownerOfChallenge = value;
        challengeObject.myRole = (value) ? 'owner' : challengeObject.myRole;
      });

      await challenge.methods.isAchiever(id, this.props.accountAddress).call().then((value) => {
        console.log("isAchiever", value);
        challengeObject.isAchiever = value;
        challengeObject.myRole = (value) ? 'achiever' : challengeObject.myRole;
      });

      await challenge.methods.isObserver(id, this.props.accountAddress).call().then((value) => {
        console.log("isObserver", value);
        challengeObject.isObserver = value;
        challengeObject.myRole = (value) ? 'observer' : challengeObject.myRole;
      });

      await challenge.methods.lastAchieverId(id).call().then((value) => {
        console.log("lastAchieverId", value);
        challengeObject.lastAchieverId = value;
      });

      await challenge.methods.lastObserverId(id).call().then((value) => {
        console.log("lastObserverId", value);
        challengeObject.lastObserverId = value;
      });

      await challenge.methods.lastSchedulePeriodId(id).call().then((value) => {
        console.log("lastSchedulePeriodId", value);
        challengeObject.lastSchedulePeriodId = value;
      });

      challengeObject.finish = challengeObject.start;
      for (let i = 1; i <= challengeObject.lastSchedulePeriodId; i++) {
        await challenge.methods.schedule(id, i).call().then((value) => {
          console.log(i, "schedule value", value);
          challengeObject.finish += value;
        });
      }

      arrayOfChallenges.push(challengeObject);
    }

    return arrayOfChallenges;
  }

  render() {
    return (
      <div>
        Home
        <button onClick={(e) => {this.getAllChallenges().then((result) => {
          console.log("ALL Challenges:", result);
        });}}>Get all challenges</button>
      </div>
    );
  }
}

export default Home;
