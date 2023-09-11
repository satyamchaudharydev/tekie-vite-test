import React from 'react'
import { Link } from 'react-router-dom'

const ConditionalLink = ({
  children,
  isLink,
  to,
  onClickIfNotLink,
  ...props
}) =>
   (!!isLink && to)
      ? <Link to={to} {...props}>{children}</Link>
      : <div onClick={onClickIfNotLink} {...props}>{children}</div>

export default ConditionalLink