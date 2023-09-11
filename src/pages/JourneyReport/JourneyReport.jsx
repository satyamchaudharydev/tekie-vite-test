import React, { Component } from 'react'
import Tube from './components/Tube'
import withScale from '../../utils/withScale'
import withNoScrollBar from '../../components/withNoScrollBar'
import fetchUserProfile from '../../queries/fetchUserProfile'
import { Map } from 'immutable'
import { hs } from '../../utils/size'
import { minCap } from '../../utils/data-utils'

class JourneyReport extends Component {
  state = {
    report: Map({})
  }
  componentDidMount() {
    fetchUserProfile(this.props.user.get('id')).call()
    if (this.props.userProfileStatus.get('success')) {
      setTimeout(() => {
        this.setState({ report: this.props.userProfile.get(0, Map({})) })
      }, 500)
    }
  }
  
  componentDidUpdate(prevProps) {
    if (!prevProps.userProfileStatus.get('success') && this.props.userProfileStatus.get('success')) {
      setTimeout(() => {
        this.setState({ report: this.props.userProfile.get(0, Map({})) })
      }, 500)
    }
  }

  render() {
    const { styles } = this.props
    const report = this.state.report
    return (
      <div style={styles.container}>
        <div style={styles.drop}></div>
        <div style={styles.email}>{this.props.user.getIn(['parent', 'email'])}</div>
        <div style={styles.journeyCompleted}>Journey’s Completed- {minCap(report.get('topicsCompleted'), 0)}/{this.props.topic.size}</div>
        <div style={styles.tubeContainer}>
          <div style={{ 
            ...styles.tube,
          }}>
            <div style={styles.tubeWrapper}>
              <Tube
                type='familiar'
                count={report.get('familiarTopicCount')}
                total={report.get('topicsCompleted')}
                hasFetched={this.props.userProfileStatus.get('success')}
              />
            </div>
            <div style={styles.label}>
              Familiar
            </div>
          </div>
          <div style={{ 
            ...styles.tube,
          }}>
            <div style={styles.tubeWrapper}>
              <Tube
                type='master'
                count={report.get('masteredTopicCount')}
                total={report.get('topicsCompleted')}
                hasFetched={this.props.userProfileStatus.get('success')}
              />
            </div>
            <div style={{...styles.label, backgroundColor: '#8c61cb'}}>
              Master
            </div>
          </div>
          <div style={{ 
            ...styles.tube,
            ...styles.tubeMarginOverride
          }}>
            <div style={styles.tubeWrapper}>
              <Tube
                type='proficient'
                count={report.get('proficientTopicCount')}
                total={report.get('topicsCompleted')}
                hasFetched={this.props.userProfileStatus.get('success')}
              />
            </div>
            <div style={{...styles.label, backgroundColor: '#25a0e6'}}>
              Proficient
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const styles = {
  tubeMarginOverride: {
    marginRight: 0,
  },
  tubeWrapper: {
    width: 102,
    height: 407,
  },
  tube: {
    marginRight: 41,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  tubeContainer: {
    marginTop: 160,
    display: 'flex',
    flexDirection: 'row',
  },
  journeyCompleted: {
    fontFamily: 'Nunito',
    fontSize: 30,
    fontWeight: 'bold',
    color: '#004e64',
    marginTop: 6
  },
  email: {
    fontFamily: 'Nunito',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004e64',
    marginTop: 35
  },
  container: {
    minWidth: '100%',
    minHeight: '100%',
    background: `url(${require('../../assets/journeyBG.jpg')})`,
    backgroundPosition: 'center top',
    backgroundSize: 'cover',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  drop: {
    width: 95,
    height: 107,
    background: `url(${require('../../assets/drop.svg')})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    marginTop: 38,
    marginLeft: 5
  },
  label: {
    width: 145.2,
    minHeight: 40.3,
    borderRadius: 20,
    backgroundColor: '#f7941d',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Nunito',
    fontSize: 23,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 57.3
  }
}

export default withNoScrollBar(withScale(JourneyReport, styles, false))