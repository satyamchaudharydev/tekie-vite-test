import React from 'react'
import Sidebar from '../components/sidebar'
import MainContent from '../components/MainContent'

import styles from './memory.module.scss';

class Rewatch extends React.Component{

    render(){
        return(
        <div className={styles.wrapper}>
            <Sidebar
            {...this.props}
            />
            <MainContent data={this.props.data}
              {...this.props}
            />
        </div>
        )
    }
}

export default Rewatch