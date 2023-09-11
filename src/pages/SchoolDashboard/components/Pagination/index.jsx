import React, { Component, Fragment } from "react";
import './Pagination.scss';

const LEFT_PAGE = "LEFT";
const RIGHT_PAGE = "RIGHT";

const range = (from, to, step = 1) => {
  let i = from;
  const range = [];

  while (i <= to) {
    range.push(i);
    i += step;
  }

  return range;
};

class Pagination extends Component {
  constructor(props) {
    super(props);
    const { totalRecords = null, pageLimit = 12, pageNeighbours = 0 } = props;

    this.pageLimit = typeof pageLimit === "number" ? pageLimit : 12;
    this.totalRecords = typeof totalRecords === "number" ? totalRecords : 0;

    this.pageNeighbours =
      typeof pageNeighbours === "number"
        ? Math.max(0, Math.min(pageNeighbours, 2))
        : 0;

    this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);

    this.state = { currentPage: this.props.currentPage };
  }

  componentDidMount() {
    this.gotoPage(this.props.currentPage);
  }

  componentDidUpdate(prevProps) {
    const { totalRecords, currentPage } = this.props;
    if (prevProps.totalRecords !== totalRecords) {
      this.totalRecords = typeof totalRecords === "number" ? totalRecords : 0;
      this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);
      this.setState({
        currentPage: 1
      })
      this.gotoPage(1);
    }
    if (prevProps.currentPage !== currentPage) {
      this.setState({
        currentPage: currentPage || 1
      })
    }
  }

  gotoPage = page => {
    const { onPageChanged = f => f } = this.props;

    const currentPage = Math.max(0, Math.min(page, this.totalPages));

    const paginationData = {
      currentPage,
      totalPages: this.totalPages,
      pageLimit: this.pageLimit,
      totalRecords: this.totalRecords
    };

    this.setState({ currentPage }, () => onPageChanged(paginationData));
  };

  handlePageChange = (page) => {
    this.gotoPage(page);
  };

  handleMoveLeft = () => {
    this.gotoPage(this.state.currentPage - this.pageNeighbours * 2 - 1);
  };

  handleMoveRight = () => {
    this.gotoPage(this.state.currentPage + this.pageNeighbours * 2 + 1);
  };

  fetchPageNumbers = () => {
    const totalPages = this.totalPages;
    const currentPage = this.state.currentPage;
    const pageNeighbours = this.pageNeighbours;

    const totalNumbers = this.pageNeighbours * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      let pages = [];

      const leftBound = currentPage - pageNeighbours;
      const rightBound = currentPage + pageNeighbours;
      const beforeLastPage = totalPages - 1;

      const startPage = leftBound > 2 ? leftBound : 2;
      const endPage = rightBound < beforeLastPage ? rightBound : beforeLastPage;

      pages = range(startPage, endPage);

      const pagesCount = pages.length;
      const singleSpillOffset = totalNumbers - pagesCount - 1;

      const leftSpill = startPage > 2;
      const rightSpill = endPage < beforeLastPage;

      const leftSpillPage = LEFT_PAGE;
      const rightSpillPage = RIGHT_PAGE;

      if (leftSpill && !rightSpill) {
        const extraPages = range(startPage - singleSpillOffset, startPage - 1);
        pages = [leftSpillPage, ...extraPages, ...pages];
      } else if (!leftSpill && rightSpill) {
        const extraPages = range(endPage + 1, endPage + singleSpillOffset);
        pages = [...pages, ...extraPages, rightSpillPage];
      } else if (leftSpill && rightSpill) {
        pages = [leftSpillPage, ...pages, rightSpillPage];
      }

      return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
  };

  render() {
    if (!this.totalRecords) return null;

    if (this.totalPages === 1) return null;

    const { currentPage } = this.state;
    const pages = this.fetchPageNumbers();
    return (
      <Fragment>
        <nav className="pagination-holder" aria-label='Pagination'>
          <ul className="pagination">
            <li>
              <div
                onClick={() => {
                  if (currentPage > 1) {
                    this.handlePageChange(this.state.currentPage - 1)
                  }
                }}
                style={{
                  cursor: `${currentPage === 1 ? 'no-drop' : 'pointer'}`
                }}
                className='page-item'
              >
                <span
                  style={{
                    cursor: `${currentPage === 1 ? 'no-drop' : 'pointer'}`
                  }}
                  className='pagination-arrow pagination-leftArrow'
                />
              </div>
            </li>
            {pages.map((page, index) => {
              if (page === LEFT_PAGE)
                return (
                  <li>
                    <div
                      key={index}
                      onClick={this.handleMoveLeft}
                      className="page-item page-item-skip-btn">
                      <span>...</span>
                    </div>
                  </li>
                );

              if (page === RIGHT_PAGE)
                return (
                  <li>
                    <div
                      key={index}
                      onClick={this.handleMoveRight}
                      className="page-item page-item-skip-btn">
                      <span >...</span>
                    </div>
                  </li>
                );

              return (
                <li>
                  <div
                    key={index}
                    className={`page-item ${currentPage === page ? " active" : ""
                      }`}
                    onClick={() => this.handlePageChange(page)}
                  >
                    {page}
                  </div>
                </li>
              );
            })}
            <li>
              <div
                onClick={() => {
                  if (currentPage < this.totalPages) {
                    this.handlePageChange(currentPage + 1)
                  }
                }}
                style={{
                  cursor: `${currentPage >= this.totalPages ? 'no-drop' : 'pointer'}`
                }}
                className='page-item'
              >
                <span
                  style={{
                    cursor: `${currentPage >= this.totalPages ? 'no-drop' : 'pointer'}`
                  }}
                  className='pagination-arrow pagination-rightArrow'
                />
              </div>
            </li>
          </ul>
        </nav>
      </Fragment>
    );
  }
}


export default Pagination;