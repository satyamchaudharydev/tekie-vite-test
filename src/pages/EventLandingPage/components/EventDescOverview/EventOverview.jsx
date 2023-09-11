import React from 'react';
import { get } from 'lodash';
import ReactHtmlParser from 'react-html-parser'
import { isBase64, decodeBase64 } from '../../../../utils/base64Utility';
import './style.scss'
import DescriptionsSkeleton from '../../pages/EventDescription/DescriptionsSkeletons';

const EventOverview = (props) => {

    const checkOverview = () => {
        if (get(props, 'data.overview')) {
            const isBase64Str = isBase64(get(props, 'data.overview'))
            if (isBase64Str) {
                return ReactHtmlParser(decodeBase64(get(props, 'data.overview')))
            } else {
                return get(props, 'data.overview')
            }
        }
    }
    return (
        <div className="EventOverview_base" id='eventOverviewDiv'>
            {get(props, 'isEventDataFetching') ?
                <p className="EventOverview_head"><DescriptionsSkeleton forSection='eventDetails-text' /></p> : <p className="EventOverview_head">Overview</p>}
            {get(props, 'isEventDataFetching') ? <DescriptionsSkeleton forSection='overviewDetails' /> : <p className="EventOverview_Desc">{checkOverview()}</p>}
        </div>
    )
}

export default EventOverview;