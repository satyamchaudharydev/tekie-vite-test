import React from "react";
import ContentLoader from "react-content-loader";

import Skeleton from "../../UpdatedSessions/Practice/skeleton";
import cardStyles from "../SavedCodes/savedCodeCard.module.scss";
import cardWrapperStyles from "../SavedCodes/allSavedCodeCards.module.scss";

const SavedCardSkeleton = (props) => (
	<div className={cardWrapperStyles.cardsContainer}>
		{new Array(4).fill(0).map((_, i) => (
			<div key={i} className={cardStyles.card} style={{ display: "block" }}>
				<Skeleton fullSize />
			</div>
		))}
	</div>
);

export default SavedCardSkeleton;
