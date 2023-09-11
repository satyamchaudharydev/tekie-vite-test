import React from 'react'
import styles from './FibBlock.module.scss'
import hs from '../../../utils/scale'

class Droppable extends React.Component {
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
            if (JSON.stringify(containerRect) !== JSON.stringify(this.state.containerRect)){
                this.setState({containerRect})
                this.props.updateDropAreaCoordinates(containerRect,this.props.id-1)
            }
        }, 10);
    }

    componentWillUnmount() {
        clearInterval(this.getRectsInterval);
    }

    render() {
        const { onDrop, 
                id,
                expandEmptyBlockIndex, 
                blockTexts,
                removeTextFromDroppable,
                fibCorrectOptions,
                reviewMode,
            } = this.props
        const isMobile = window !== 'undefined' ? window.innerWidth <= 768 : false
        let expandStyles = {}
        if (id === expandEmptyBlockIndex+1) {
            expandStyles = {
                width: isMobile ? '63px' : hs(68),
                height: isMobile ? '48px' : hs(68),
            }
        }
        const textToShow = blockTexts && blockTexts[id - 1] ? blockTexts[id - 1] : ''
        /** Additional Styles for HomeworkReview Flow */
        const additionalStyles = {}
        if (reviewMode) {
            additionalStyles.borderColor = '#FFF'
            additionalStyles.borderRadius = '5px'
            additionalStyles.color = '#65DA7A'
        }
        if (reviewMode && fibCorrectOptions && fibCorrectOptions.length && fibCorrectOptions[id - 1] && blockTexts && blockTexts[id - 1]) {
            if (fibCorrectOptions[id - 1] === blockTexts[id - 1]) {
                additionalStyles.color = '#65DA7A'
            } else {
                additionalStyles.color = '#FF5744'
            }
        }
        return (
            <div
                onClick={() => removeTextFromDroppable(id-1)}
                ref={this.containerRef}
                id={id}
                key={id}
                className={styles.dropArea}
                onDrop={(e) => onDrop(e, id)}
                style={{...expandStyles, ...additionalStyles}}
                drageenter={(event)=> {event.preventDefault();}}
            >
                {textToShow}
            </div>
        );
    }
}

export default Droppable