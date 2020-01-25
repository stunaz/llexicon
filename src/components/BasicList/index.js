import React, { PureComponent, createRef } from 'react'
import PropTypes from 'prop-types'
import { FixedSizeList } from 'react-window'
import './styles.css'

class BasicList extends PureComponent {
  constructor(props) {
    super(props)
    this.listRef = createRef()
  }

  static propTypes = {
    list: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.any.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
        otherValue: PropTypes.any
      }).isRequired
    ),

    maxHeight: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    itemSize: PropTypes.number.isRequired,
    listPosition: PropTypes.oneOf([
      'static',
      'absolute',
      'fixed',
      'relative',
      'sticky',
      'initial',
      'inherit'
    ]),

    // Callback props
    onListItemClickCallback: PropTypes.func, // When an item is clicked
    onScrollToBottomOfListCallback: PropTypes.func // When scrolled to the bottom of the list,
  }

  static defaultProps = {
    maxHeight: 250,
    height: 250,
    width: '100%',
    itemSize: 25,
    list: [],
    listPosition: 'absolute',
    listItemHoverable: false
  }

  onListItemClick = (id, value) => {
    const { onListItemClickCallback } = this.props
    if (onListItemClickCallback) {
      onListItemClickCallback(id, value)
    }
  }

  renderList = ({ data, index, style, isScrolling }) => {
    const { listItemHoverable, onListItemClickCallback, itemSize } = this.props
    const { id, value, otherValue } = data[index]

    return typeof value === 'object' ? (
      value
    ) : (
      <div
        className={`basicListItem ${listItemHoverable && 'basicListItemHoverable'}`}
        style={{ ...style, padding: itemSize / 4 }}
        key={id}
        id={id}
        value={value}
        onClick={() => onListItemClickCallback && onListItemClickCallback(id, value)}
      >
        <span className="basicListItemValue FirstValue">{value}</span>
        {otherValue && <span className="basicListItemValue OtherValue">{otherValue}</span>}
      </div>
    )
  }

  handleItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex
  }) => {
    const { onScrollToBottomOfListCallback } = this.props
    if (!onScrollToBottomOfListCallback) return
    const listLength = this.props.list.length
    const bottomOfListIndex = listLength === 0 ? listLength : listLength - 1
    const reachedBottomOfList = bottomOfListIndex !== 0 && overscanStopIndex === bottomOfListIndex
    // console.log("overscanStopIndex: ", overscanStopIndex)
    // console.log("visibleStopIndex: ", visibleStopIndex)
    // console.log('reachedBottomOfList: ', reachedBottomOfList)
    // console.log('---------------------------------------')

    reachedBottomOfList && onScrollToBottomOfListCallback()
  }

  render() {
    const { itemSize, listPosition, list, height, width } = this.props

    return (
      <FixedSizeList
        ref={this.listRef}
        className="basicListContainer fade-in"
        style={{ position: listPosition }}
        height={height}
        width={width}
        itemData={list}
        itemCount={list.length}
        itemSize={itemSize}
        onItemsRendered={this.handleItemsRendered}
      >
        {this.renderList}
      </FixedSizeList>
    )
  }
}
export default BasicList