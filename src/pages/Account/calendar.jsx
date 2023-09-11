import React from 'react'
import Calendar from 'react-calendar'
import styles from './calendar.module.scss';

class CalendarModal extends React.Component{
  componentDidMount(){
    document.addEventListener('click',this.handleOutsideClick)
  }
  componentWillUnmount(){
    document.removeEventListener('click',this.handleOutsideClick)
  }
  handleOutsideClick=(e)=>{
    if(e.target!==this.calendarWrapperRef){
      return;
    }
    this.props.closeCalendar()
  }
  render(){
    return(
      <div className={styles.fullScreen} 
        ref={node=>{this.calendarWrapperRef = node}}
      >
        <Calendar
          onChange={this.props.onDateChange}
          value={this.props.selectedDate}
          className={styles.calendar}
          maxDate={this.props.maxDate}
        />
      </div>
    )
  }
}

export default CalendarModal