import React from 'react'
import styles from './styles.module.scss'
import { ReactComponent as TriangleBG } from '../../assets/triangleBG.svg'
import capitalize from '../../utils/text/capitalize'
import BadgeItem from './Badge/badge'
import fetchUserBadges from '../../queries/fetchUserBadges'
import { List } from 'immutable'
import BadgeModal from './BadgeModal'

export default class Achievements extends React.Component {
  state={
    showModal: false,
    openModalData:null
  }
  componentDidMount(){
    if(!this.props.badgeFetchSuccess){
      fetchUserBadges()
    }
  }
  openModal=(data)=>{
    if(data.get('isUnlocked')){
      this.setState({
        showModal: true,
        openModalData:data
      })
    }
  }
  closeModal=()=>{
    this.setState({
      showModal: false,
      openModalData: null
    })
  }
  render() {
    const { match,badges } = this.props
    const achievementHeaderTitle = capitalize(match.params.type)
    const badgesToShow = (badges || List()).get(`${match.params.type}`)
    return (
      <div className={styles.container}>
        <div className={styles.triangleBGContainer}>
          <TriangleBG />
        </div>
        <div className={styles.itemsHolder}>
          <div className={styles.header}>
            <span className={styles.headerText}>
              {achievementHeaderTitle}
            </span>
          </div>
          <div className={styles.itemsBody}>
            {
              badgesToShow && badgesToShow.map((badge,index)=>
                <BadgeItem data={badge} key={index} openModal={this.openModal}/>)
            }
          </div>
        </div>
        {
          this.state.showModal && <BadgeModal data={this.state.openModalData} closeModal={this.closeModal}/>
        }
      </div>
    )
  }
}
