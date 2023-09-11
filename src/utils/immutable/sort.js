const sort = {}

sort.descend = (data, path = []) =>
  data.sort((a, b) => {
    return b.getIn(path) - a.getIn(path)
  })

sort.ascend = (data, path) =>
  data.sort((a, b) => {
    return a.getIn(path) - b.getIn(path)
  })

export default sort
