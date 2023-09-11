import * as React from 'react';
import Cell from './Cell';
import './DataTable.scss';

/** Custom DataTable
 *  @param tableData. - Data recieved from API. Example: tableData={[......]}
 *  @param tableHeight. Example: tableHeigt='100vh'
 *  @param columns - This accepts an array of objects consisting of 
 *    1. title - Table Header
 *    2. key - this should be same as the property in tableData. Example: Key: id then tableData = [{ id: 1 }]  <br />
 *    &bull; *Please Note: Nested key not supported yet*
 *    3. width - min-width of column
 *    4. maxWidth - max-width of column
 *    5. render - This is a callback function which maps the data you sent with custom JSX Element
 */ 
export default class DataTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cellHeights: [],
    };
    
    this.tableRef = React.createRef();
  }

  componentDidMount() {
    const { tableData, columns } = this.props
    if (columns && tableData && tableData.length || 0 > 0 ) {
      this.handleCellHeightResize();
    }
  }

  renderHeadingRow = (_cell, cellIndex) => {
    const {columns, headerClassName ,homework} = this.props;
    const {cellHeights} = this.state;

    return (
      <Cell
        key={`heading-${cellIndex}`}
        content={columns[cellIndex].title}
        header={true}
        height={cellHeights[0]}
        headerClassName={headerClassName}
        homework={homework}
      />
    );
  };
  
  renderRow = (_row, rowIndex) => {
    const {tableData, columns, rowClassName} = this.props;
    const {cellHeights} = this.state;
    const heightIndex = rowIndex + 1;

    return (
      <tr key={`row-${rowIndex}`} className='
      table-row'>
        {columns.map((column, cellIndex) => {
          if(column.render) {
              return (
                <Cell
                  key={`${rowIndex}-${cellIndex}`}
                  content={column.render(tableData[rowIndex][column.key], tableData[rowIndex])}
                  height={cellHeights[heightIndex]}
                  width={column.width || null}
                  maxWidth={column.maxWidth || null}
                  rowClassName={rowClassName}
                />
              )
          } else {
              return (
                <Cell
                  key={`${rowIndex}-${cellIndex}`}
                  content={tableData[rowIndex][column.key]}
                  height={cellHeights[heightIndex]}
                  width={column.width || null}
                  maxWidth={column.maxWidth || null}
                  rowClassName={rowClassName}
                />
              )
          }
        })}
      </tr>
    )
  };

  setTable = (table) => {
    this.table = table;
  }

  getTallestCellHeights = () => {
    const rows = Array.from(this.tableRef.current.getElementsByTagName('tr'));
    if (rows && rows.length > 0) {
      let {cellHeights} = this.state;
  
      cellHeights = rows.map((row) => {
        if (row && row.clientHeight) {
          const fixedCell = (row.childNodes)[0];
          return Math.max(row.clientHeight, fixedCell.clientHeight);
        }
        return 10
      })
  
      return cellHeights;
    }
  }

  handleCellHeightResize = () => {
    this.setState({cellHeights: this.getTallestCellHeights()});
  }

  render() {
    const { columns, tableData, tableHeight, isLoading, rowClassName ,homework} = this.props;

    if (isLoading) {
      return (
        <div className="DataTable" id='DataTable'>
          Loading...
        </div>
      )
    }
    this.renderHeadingRow = this.renderHeadingRow.bind(this);
    this.renderRow = this.renderRow.bind(this);
    let tbodyMarkup = null
    let theadMarkup = null
    
    if (columns) {
      theadMarkup = (
        <tr key="heading">
          {columns.map(this.renderHeadingRow)}
        </tr>
      );
      if (tableData && tableData.length > 0) {
        tbodyMarkup = tableData.map(this.renderRow);
      } else {
        tbodyMarkup = <div className={`dataTable-noContent ${rowClassName || ''}`}> No Record Found </div>
      }
    }
    return (
      <div className="DataTable" id='DataTable'>
        <div className="dataTable-ScrollContainer" style={{ maxHeight: tableHeight,padding: homework ? "0px":"12px" }}>
          <table className="dataTable-table-container" ref={this.tableRef}>
            <thead>{theadMarkup}</thead>
            <tbody>{tbodyMarkup || 'Not Found'}</tbody>
          </table>
        </div>
      </div>
    );
  }
}