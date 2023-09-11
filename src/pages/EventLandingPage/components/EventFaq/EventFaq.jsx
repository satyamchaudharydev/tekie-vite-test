import React from 'react';
import './faqStyle.scss'

const EventFaq = () => {
    const faqsArray = [
        {
            question: 'Is there any registration fee for the event?',
            answer: 'No! Tekie events are absolutuely free of cost. Feel free to register in any of them and we promise you that you will love the experience.'
        },
        {
            question: 'Is this event online only?',
            answer: 'Yes, this is an online event. You will receive the joining link on your registered contact details. '
        },
        {
            question: 'How can I become a part of the Tekie student community?',
            answer: 'You can start by attending our community events. To receive regular updates, join our community groups on WhatsApp or Facebook.'
        },
        {
            question: 'Does this event require any prior coding knowledge?',
            answer: 'No. All you need is a little curiosity and enthusiasm. We\'ll take care of the rest!'
        }
    ]
    return (
        <div className="EventFaq">
            <div className="head">
                FAQs
            </div>
            <div className="quests">
                {faqsArray.map(({ question, answer }) => (
                    <>
                        <p className="ques"><span>&bull;</span> <span>{question}</span></p>
                        <p className="ans">  {answer}</p>
                        <p className="event-divider"></p>
                    </>
                ))}
            </div>
        </div>
    )
}

export default EventFaq;