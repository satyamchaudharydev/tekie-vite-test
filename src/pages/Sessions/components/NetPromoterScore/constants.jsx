import React from 'react'

const getConstants = (name) => {
    const goodNpsPrimaryTitles = [
      "How was your experience?",
      <p><span>We're glad!</span>{" "} What did you like the most about our App?</p>,
      "We are glad! Would you like to tell us more about your experience?",
      <>
        Thanks for your feedback! <br />
      </>,
    ];
    const goodNpsSecondaryTitles = ["","",""]
    const avgNpsPrimaryTitles = ["How was your experience?","We're Sorry!","We are sorry!", <>Thanks for your feedback! <br /> Here’s your cookie :)</>]
    const avgNpsSecondaryTitles = ["","Please let us know what was your issue","Where can we improve?"]
    const mbNpsPrimaryTitles =["How was your experience?","Please give us more insights on","Please give us more insights on", <>Thanks for your feedback! <br /> Here’s your cookie :)</>]
    const mbNpsSecondaryTitles = ["","why you have choose that score?","why you have choose that score?"]
    return [goodNpsPrimaryTitles,goodNpsSecondaryTitles,avgNpsPrimaryTitles,avgNpsSecondaryTitles,mbNpsPrimaryTitles,mbNpsSecondaryTitles]
}

export default getConstants