import React from 'react'
import styles from './FibBlock.module.scss'
import { Button3D } from '../../../photon'
import classNames from 'classnames';
class Draggable extends React.Component {
    constructor(props) {
        super(props);

        const defaultRect = { left: 0, width: 0 };

        this.state = {
            containerRect: defaultRect,
        };

        this.containerRef = React.createRef();
        this.getRectsInterval = undefined;
    }

    componentDidMount() {
        this.getRectsInterval = setInterval(() => {
            const containerRect = this.containerRef.current.getBoundingClientRect();
            if (JSON.stringify(containerRect) !== JSON.stringify(this.state.containerRect)) {
                this.setState({ containerRect })
                this.props.updateDraggableCoordinates(containerRect,this.props.index)
            }
        }, 10);
    }

    componentWillUnmount() {
        clearInterval(this.getRectsInterval);
    }

    render() {
        const { onDragStart, statement, onDragCapture,
            index, onDragEnd, fibAndEmptyBlockMap, withUpdatedDesign = false, isMobile } = this.props
        let activeElementStyles = { cursor: 'default' }
        let blockSelected = false;
        
        if (((fibAndEmptyBlockMap&&fibAndEmptyBlockMap.includes(index)) || !statement)){
            activeElementStyles= {
                backgroundColor:'#d4d5d6',
                color: '#d4d5d6',
                cursor: 'default'
            }
            blockSelected = true
        }

        return (
            <div
            ref={this.containerRef}
            className={classNames({
                [styles.block]: !this.props.isEmptyBlock && !isMobile,
                [styles.mbBlock]: !this.props.isEmptyBlock && isMobile,
                [styles.emptyBlock]: this.props.isEmptyBlock || (isMobile && blockSelected),  
            })
            }
            draggable={!this.props.isSeeAnswers && !this.props.isSubmittedForReview}
            style={{ 
                boxShadow: `${withUpdatedDesign ? 'none' : ''}`,
                backgroundColor: `${withUpdatedDesign ? 'transparent' : ''}`,
                ...activeElementStyles,
            }}
            onDragEnd={e => onDragEnd(e)}
            onDragCapture={e=>onDragCapture(e)}
            onDragStart={e=>onDragStart(e,index)}
            >
                {withUpdatedDesign ? (
                    <>
                        {blockSelected ? <div /> : (!isMobile || this.props.fromChatbot) ? (
                            <Button3D
                                style={{
                                    fontFamily: 'Nunito'
                                }}
                                title={statement}
                            />
                        ) : (
                            <button className={styles.mbOptionBtn}>{statement}</button>
                        )}
                    </>
                ) : (
                    <div className={styles.fibBlockText}>{statement}</div>
                )}
            </div>
        );
    }
}

export default Draggable
