const widgetConfig = {
    headerProperty: {
        appName: 'Tekie',
        fontName: 'Nunito',
        fontUrl: 'https://fonts.googleapis.com/css?family=Nunito',
        hideChatButton: true
    },
    content: {
        fontName: 'Nunito Sans',
        actions: {
            csat_yes: 'Yes',
            csat_no: 'No',
            push_notify_yes: 'Yes',
            push_notify_no: 'No',
            tab_chat: 'Chat',
            csat_submit: 'Submit'
        },
        headers: {
            chat: 'Chat with Us',
            chat_help: 'Reach out to us if you have any questions',
            faq_help: 'Browse our articles',
            faq_not_available: 'No Articles Found',
            faq_search_not_available: 'No articles were found for {{query}}',
            faq_useful: 'Was this article helpful?',
            faq_thankyou: 'Thank you for your feedback',
            faq_message_us: 'Message Us',
            push_notification: 'Don\'t miss out on any replies! Allow push notifications?',
            csat_question: 'Did we address your concerns??',
            csat_yes_question: 'How would you rate this interaction?',
            csat_no_question: 'How could we have helped better?',
            csat_thankyou: 'Thanks for the response',
            csat_rate_here: 'Submit your rating here',
            channel_response: {
                offline: 'We are currently away. Please leave us a message',
                online: {
                minutes: {
                    one: "Currently replying in {!time!} minutes ",
                    more: "Typically replies in {!time!} minutes"
                },
                hours: {
                    one: "Currently replying in under an hour",
                    more: "Typically replies in {!time!} hours",
                }
                }
            }
        }
    }
}

export default widgetConfig