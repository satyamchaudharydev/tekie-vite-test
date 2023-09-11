import * as React from 'react';
import './DataTable.scss';

export default function Cell({
  height,
  content,
  fixed,
  header,
  width,
  maxWidth,
  headerClassName,
  rowClassName,
  homework
}) {

  const fixedClass = fixed ? ' dataTable-Cell-fixed' : '';
  const headerClass =  homework ? ' dataTable-homework' : header ? "dataTable-Cell-header": ' dataTable-Cell-row';
  const customHeaderClass = headerClassName ? headerClassName : '';
  const customRowClass = rowClassName ? rowClassName : '';
  const style = height ? {height: `${height}px`} : undefined;
  
  const className = (
    `dataTable-Cell${fixedClass}${headerClass} ${customHeaderClass} ${customRowClass}`
  );  

  const cellMarkup = header ? (
    // Add scope="col" to thead cells
    <th scope="col" className={className} style={style}>
      {content || '-'}
    </th>
  ) : (
    fixed ? (
      // Add scope="row" to the first cell of each tbody row
      <th scope="row" className={className} style={style}>
        {content || '-'}
      </th>
    ) : (
      <td className={className} style={{ ...style, minWidth: width, maxWidth: maxWidth}}>
        {content || '-'}
      </td>
    )
  );

  return (cellMarkup);
}