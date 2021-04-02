import React, {Component} from 'react';
import { DatePicker } from 'antd';
import { Row, Col } from 'antd';
import { ButtonStyled } from '../../../../styled';

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
        <Col span={1}>{this.props.index + 1}</Col>

        <Col span={4}>{this.props.beginDate.format("YYYY-MM-DD HH:mm:ss")}</Col>

        <Col span={4}>
          {this.props.isEditing || this.props.addButton.isAvailable ?
            <DatePicker
              showTime
              allowClear={false}
              format="YYYY-MM-DD HH:mm:ss"
              defaultValue={this.state.endDate}
              onChange={(dateMoment) => {
                if (dateMoment.isAfter(this.props.beginDate)) {
                  this.setState({endDate: dateMoment});
                }
              }}
            />
            : this.state.endDate.format("YYYY-MM-DD HH:mm:ss")
          }
        </Col>

        <Col span={6}>
          <Row>
            <Col>
              {this.props.addButton.isAvailable && <ButtonStyled type='primary' onClick={(e) => this.props.addButton.func(this.props.beginDate, this.state.endDate)}>Add new period</ButtonStyled>}

              {this.props.editButton.isAvailable && <ButtonStyled type='default' onClick={(e) => this.props.editButton.func(e, this.props.index)}>Edit</ButtonStyled>}
              {this.props.isEditing && <ButtonStyled type='primary' onClick={(e) => this.props.confirmEditButton.func(this.props.beginDate, this.state.endDate, this.props.index)}>Confirm</ButtonStyled>}
              {this.props.isEditing && <ButtonStyled type='primary' onClick={(e) => this.props.discardEditButton.func(e, this.props.index)}>Discard</ButtonStyled>}

              {this.props.deleteButton.isAvailable && <ButtonStyled type='default' onClick={(e) => this.props.deleteButton.func(e, this.props.index)}>Delete</ButtonStyled>}
              {this.props.isDeleting && <ButtonStyled type='primary' onClick={(e) => this.props.confirmDeleteButton.func(e, this.props.index)}>Confirm</ButtonStyled>}
              {this.props.isDeleting && <ButtonStyled type='primary' onClick={(e) => this.props.discardDeleteButton.func(e, this.props.index)}>Discard</ButtonStyled>}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default ScheduleRow;