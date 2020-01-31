import React, { Component, Fragment } from "react"
import PropTypes from "prop-types"
import { connect as reduxConnect } from "react-redux"
import { RouteMap, RouterPush } from "../../../ReactRouter/Routes"
import { GetUserEntriesByDate } from "../../../actions/Entries"
import { withRouter } from "react-router-dom"
import EntryPreview from "./EntryPreview"
import MomentJS from "moment"
import deepEquals from "../../../helpers/deepEquals"
import "./styles.css"

const mapStateToProps = (
  { Calendar: { activeDate }, Entries: { items }, Window: { isMobile } },
  { date, view, staticContext }
) => {
  const calendarDay = MomentJS(date)
  const activeDay = MomentJS(activeDate)

  const shouldRenderEntryPreview = view === "month"

  const shouldRenderPlusButton =
    shouldRenderEntryPreview && isMobile ? calendarDay.isSame(activeDay, "day") : true

  const entries = items.filter(entry => {
    const { date_created_by_author, shouldDelete } = entry

    const entryDate = MomentJS(date_created_by_author)
    const eventFound = entryDate.isSame(calendarDay, "day")

    return !shouldDelete && eventFound
  })

  return {
    shouldRenderEntryPreview,
    shouldRenderPlusButton,
    calendarDay,
    entries,
    date,
    staticContext,
    view,
    isMobile
  }
}

const mapDispatchToProps = { GetUserEntriesByDate }

class TileContent extends Component {
  static propTypes = {
    GetUserEntriesByDate: PropTypes.func.isRequired
  }

  static defaultProps = {}

  shouldComponentUpdate(nextProps, nextState) {
    const propsChanged = !deepEquals(this.props, nextProps)
    return propsChanged
  }

  handleTodayClick = () => {
    const { history } = this.props

    setTimeout(() => RouterPush(history, RouteMap.NEW_ENTRY), 150)
  }

  handleTileClick = () => {
    const { onTileClick, date } = this.props

    onTileClick(date)
  }

  renderEntryPreviews = entries => {
    const { date, staticContext, view } = this.props

    return entries.map(entry => {
      const { id, ...restOfProps } = entry

      return (
        <EntryPreview
          key={id}
          id={id}
          {...restOfProps}
          date={date}
          staticContext={staticContext}
          view={view}
        />
      )
    })
  }

  render() {
    const { shouldRenderEntryPreview, shouldRenderPlusButton, entries } = this.props

    return (
      <Fragment>
        {shouldRenderPlusButton && (
          <i className="fas fa-feather-alt TileContentFeather" onClick={this.handleTodayClick} />
        )}
        {shouldRenderEntryPreview && (
          <div className="TileContentContainer">{this.renderEntryPreviews(entries)}</div>
        )}
      </Fragment>
    )
  }
}
export default withRouter(reduxConnect(mapStateToProps, mapDispatchToProps)(TileContent))
