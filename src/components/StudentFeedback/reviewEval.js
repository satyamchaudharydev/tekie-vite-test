import negativeConji from '../../assets/conji/negativeConji.png'
import positiveConji from '../../assets/conji/positiveConji.png'
import neutralConji from '../../assets/conji/neutralConji.png'

const reviewEval = [
    {
        review: 1,
        label: 'Very Poor',
        question: 'What went wrong?',
        placeholder: 'Tell us what you didn’t like (optional)',
        characterImg: negativeConji,
    },
    {
        review: 2,
        label: 'Poor',
        question: 'What went wrong?',
        placeholder: 'Tell us what you didn’t like (optional)',
        characterImg: negativeConji,
    },
    {
        review: 3,
        label: 'Neutral',
        question: 'What could be improved?',
        placeholder: 'Tell us more (optional)',
        characterImg: neutralConji,
    },
    {
        review: 4,
        label: 'Somewhat Good',
        question: 'What could make it a 5?',
        placeholder: 'Tell us more (optional)',
        characterImg: positiveConji,
    },
    {
        review: 5,
        label: 'Excellent',
        question: 'What did you like?',
        placeholder: 'Tell us what you liked (optional)',
        characterImg: positiveConji,
    }
    
]
export default reviewEval
