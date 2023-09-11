import React from 'react'
import cx from 'classnames'
import { get, orderBy } from 'lodash'
import DataTable from '../DataTableV1/DataTable'
import Select from '../Select'
import CloseIcon from '../../../../assets/SchoolDashboard/icons/CloseIcon'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import View from '../../../../assets/SchoolDashboard/icons/View'
import Report from '../../../../assets/SchoolDashboard/icons/Report'
import './BatchDetailsModal.scss'
import '../../SchoolDashboard.common.scss'
import '../modal.scss'

const BatchDetailsModal = ({
    batchDetails = null,
    isModalVisible = false,
    closeBatchDetailsModal,
    match
}) => {
    const [tableColumns, setTableColumns] = React.useState([])
    const [tableData, setTableData] = React.useState([])
    const [orderByFilter, setOrderByFilter] = React.useState({ value: 'asc', label: 'SortBy: A-Z' })
    const [gradesToDisplay, setGradesToDisplay] = React.useState([])
    
    React.useEffect(() => {
        if (isModalVisible) {
            const columns = [
                {
                    title: 'Student',
                    key: 'studentName',
                },
                {
                    title: 'Section',
                    key: 'section',
                },
                {
                    title: 'Action',
                    key: 'studentId',
                    render: (studentId, record) => (
                        <div className='school-dashboard-action-container'>
                            <Link
                                to={`/dashboard/${match.params.schoolSlug}/students/${studentId}`}
                                data-tooltip data-tooltip-position="top"
                                className='school-dashboard-actionBtn'>
                                <View />
                            </Link>
                            {/* <button className='school-dashboard-actionBtn'><Report /></button> */}
                        </div>
                    )
                },
            ];
            setTableColumns(columns)
            const mappedTableData = get(batchDetails, 'students', []).map(student => ({
                studentId: get(student, 'userData.id'),
                studentName: get(student, 'userData.name'),
                section: get(student, 'section'),
            }))
            const { value: sortValue } =  orderByFilter
            setTableData(orderBy(mappedTableData, ['studentName', 'section'], sortValue))
            const grades = new Set(get(batchDetails, 'classes', []).map(el => el.grade))
            setGradesToDisplay(grades)
        }
    }, [batchDetails])
    
    React.useEffect(() => {
        const { value: sortValue } =  orderByFilter
        setTableData(orderBy(tableData, ['studentName', 'section'], sortValue))
    }, [orderByFilter])

    /** Utils */
    const closeModal = () => {
        closeBatchDetailsModal(false)
    }

    return (
        <div className={cx('modal-Backdrop', isModalVisible && 'modal-Backdrop-visible')}>
            <div className={cx('modalBox', isModalVisible && 'modalBox-visible')}>
                <div style={{ position: 'relative' }}>
                    <div className={cx('modal-header-container')} style={{ paddingBottom: '12px' }}>
                        <div className={cx('batchDM-header-details')}>
                            <div className={cx('batchDM-details-container')}>
                                <div className={cx('batchDM-details-grade')}>
                                   {[...gradesToDisplay].map(grade => (
                                       <span>{grade}</span>
                                    ))}
                                </div>
                                <div className={cx('batchDM-details-batchText')}>
                                    Batch: <span>{get(batchDetails, 'code')}</span>
                                </div>
                                <div className={cx('batchDM-details-courseDetails')}>
                                    Course: {get(batchDetails, 'course.title')}
                                </div>
                            </div>
                        </div>
                        <CloseIcon className='modal-closeIcon' onClick={() => closeModal()}/>
                    </div>
                    <div className={cx('batchDM-modal-content-container')}>
                        <div style={{ width: '100%' }}>
                            <Select
                                style={{ width: 'fitContent' }}
                                defaultValue={orderByFilter}
                                options={[
                                    { value: 'asc', label: 'SortBy: A-Z' },
                                    { value: 'desc', label: 'SortBy: Z-A' },
                                ]}
                                placeholder='Sort'
                                value={orderByFilter}
                                className={'batchDM-modal-filter-dropdown'}
                                onChange={(sortByObj) => {
                                    setOrderByFilter(sortByObj)
                                }}
                                isSearchable={false}
                            />
                            <DataTable
                                columns={tableColumns}
                                tableData={tableData}
                                tableHeight='40vh'
                                isLoading={false}
                                headerClassName='batchDM-modal-content-tableHeader'
                                rowClassName='batchDM-modal-content-tableRow'
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BatchDetailsModal