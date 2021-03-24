import React, {Component} from 'react';
import { Button, DatePicker } from 'antd';
import { Row, Col } from 'antd';

class ScheduleRow extends Component {
  constructor (props) {
    super(props);

    this.state = {
      endDate: props.endDate,
    }
  }

  render() {
    return (
      <Row>
        <Col>{props.index}</Col>

        <Col>{props.beginDate}</Col>

        <Col>
          {props.isEditing ?
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" onChange={(dateMoment, dateString) => this.setState({endDate: new Date(dateMoment.unix())})} />
            : this.state.endDate
          }
        </Col>

        <Col>
          <Row>
            <Col>
              {props.editButton.isAvailable && <Button type='primary' onClick={(e) => props.editButton.func(e, props.index)}>Edit</Button>}
              {props.isEditing && <Button type='primary' onClick={(e) => props.confirmEditButton.func(e, props.index)}>Confirm</Button>}
              {props.isEditing && <Button type='primary' onClick={(e) => props.discardEditButton.func(e, props.index)}>Discard</Button>}

              {props.deleteButton.isAvailable && <Button type='primary' onClick={(e) => props.deleteButton.func(e, props.index)}>Delete</Button>}
              {props.isDeleting && <Button type='primary' onClick={(e) => props.confirmDeleteButton.func(e, props.index)}>Confirm</Button>}
              {props.isDeleting && <Button type='primary' onClick={(e) => props.discardDeleteButton.func(e, props.index)}>Discard</Button>}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default ScheduleRow;