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
        <Col>{this.props.key+1}</Col>

        <Col>{this.props.beginDate}</Col>

        <Col>
          {this.props.isEditing ?
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              defaultValue={this.state.endDate}
              onChange={(dateMoment) => {
                if (dateMoment.isAfer(this.props.beginDate)) {
                  this.setState({endDate: dateMoment})
                }
              }}
            />
            : this.state.endDate
          }
        </Col>

        <Col>
          <Row>
            <Col>
              {this.props.addButton.isAvailable && <Button type='primary' onClick={(e) => this.props.addButton.func(this.props.beginDate, this.state.endDate)}>Add new period</Button>}

              {this.props.editButton.isAvailable && <Button type='primary' onClick={(e) => this.props.editButton.func(e, this.props.index)}>Edit</Button>}
              {this.props.isEditing && <Button type='primary' onClick={(e) => this.props.confirmEditButton.func(this.props.beginDate, this.state.endDate, this.props.index)}>Confirm</Button>}
              {this.props.isEditing && <Button type='primary' onClick={(e) => this.props.discardEditButton.func(e, this.props.index)}>Discard</Button>}

              {this.props.deleteButton.isAvailable && <Button type='primary' onClick={(e) => this.props.deleteButton.func(e, this.props.index)}>Delete</Button>}
              {this.props.isDeleting && <Button type='primary' onClick={(e) => this.props.confirmDeleteButton.func(e, this.props.index)}>Confirm</Button>}
              {this.props.isDeleting && <Button type='primary' onClick={(e) => this.props.discardDeleteButton.func(e, this.props.index)}>Discard</Button>}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default ScheduleRow;