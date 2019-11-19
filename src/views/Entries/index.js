import React, { Component, createRef } from "react"
import { connect as reduxConnect } from "react-redux"
import PropTypes from "prop-types"
import { Container, Row, Col } from "reactstrap"
import Entry from "../../components/Entry"
import Home from "../Home"
import { FixedSizeList } from "react-window"
import { SyncEntries, GetUserEntries } from "../../actions/Entries"
import "./styles.css"

const mapStateToProps = ({
  User,
  Entries: { items, next },
  Window: {
    screen: { availHeight }
  }
}) => ({
  UserId: User.id,
  entries: items.filter(item => !item.shouldDelete).sort(
    (a, b) =>
      new Date(b.date_created_by_author) - new Date(a.date_created_by_author)
  ),
  nextEntryPage: next,
  viewPortHeight: availHeight
})

const mapDispatchToProps = { SyncEntries, GetUserEntries }

class Entries extends Component {
  constructor(props) {
    super(props)

    this.listRef = createRef()

    this.state = {}
  }

  static propTypes = {
    UserId: PropTypes.number,
    SyncEntries: PropTypes.func.isRequired,
    GetUserEntries: PropTypes.func.isRequired
  }

  static defaultProps = {}

  static getDerivedStateFromProps(nextProps, prevState) {
    const { entries, nextEntryPage, viewPortHeight } = nextProps

    const inputHeight = 46

    const listHeight = viewPortHeight

    let listItemHeight = 500

    if (listHeight / 3 > listItemHeight) listItemHeight = listHeight / 3

    return { entries, nextEntryPage, listHeight, listItemHeight }
  }

  componentDidMount() {
    const { UserId, SyncEntries, GetUserEntries } = this.props
    if (UserId) {
      SyncEntries(() => new Promise(resolve => resolve(GetUserEntries(1))))
    }
  }

  componentWillUnmount() {}

  handleDeleteEntry = id => {
    const { DeleteEntry } = this.props
    DeleteEntry(id)
  }

  handleItemsRendered = ({
    overscanStartIndex,
    overscanStopIndex,
    visibleStartIndex,
    visibleStopIndex
  }) => {
    const { SyncEntries, GetUserEntries } = this.props
    const { entries, nextEntryPage } = this.state
    const { length } = entries
    const bottomOfListIndex = length === 0 ? length : length - 1
    const reachedBottomOfList =
      bottomOfListIndex !== 0 && visibleStopIndex === bottomOfListIndex
    // console.log("overscanStopIndex: ", overscanStopIndex)
    // console.log("visibleStopIndex: ", visibleStopIndex)
    // console.log("reachedBottomOfList: ", reachedBottomOfList)
    // console.log("---------------------------------------")

    if (!nextEntryPage) return
    const split = nextEntryPage.split(/\?page=(.*)&/)
    const pageNumber = split[1]
    if (reachedBottomOfList) {
      SyncEntries(
        () => new Promise(resolve => resolve(GetUserEntries(pageNumber)))
      )
    }
  }

  renderEntries = ({ data, index, style, isScrolling }) => {
    const entry = data[index]
    const { id, ...restOfProps } = entry

    return (
      <Col key={id} style={{ ...style /* background: "red" */ }} xs={12}>
        <Entry
          key={id}
          id={id}
          {...restOfProps}
          containerHeight={style.height}
          showDivider
        />
      </Col>
    )
  }

  render() {
    const { entries, listHeight, listItemHeight } = this.state

    return entries.length > 0 ? (
      <Container className="Entries Container">
        <Row>
          <FixedSizeList
            ref={this.listRef}
            height={listHeight}
            width="100%"
            itemData={entries}
            itemCount={entries.length}
            itemSize={listItemHeight}
            onItemsRendered={this.handleItemsRendered}
          >
            {this.renderEntries}
          </FixedSizeList>
        </Row>
      </Container>
    ) : (
      <Home />
    )
  }
}
export default reduxConnect(mapStateToProps, mapDispatchToProps)(Entries)
