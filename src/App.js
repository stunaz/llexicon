import React, { useEffect, lazy, memo, Fragment } from "react"
import PropTypes from "prop-types"
import { UserProps } from "./redux/User/propTypes"
import { connect as reduxConnect } from "react-redux"
import { withRouter, Route, Switch, Redirect } from "react-router-dom"
import { SetWindow } from "./redux/App/actions"
import { GetUserSettings } from "./redux/User/actions"
import { SetCalendar } from "./redux/Calendar/actions"
import {
  SyncEntries,
  GetUserEntries,
  GetUserEntryTags,
  GetUserEntryPeople,
  ResetEntriesSortAndFilterMaps,
} from "./redux/Entries/actions"
import { RouteMap, RouterGoBack } from "./routes"
import { About, Home, Entries, PrivacyPolicy } from "./views"
import { NavBar } from "./components"
import { RouterLinkPush } from "./routes"
import memoizeProps from "./helpers/memoizeProps"
import { useAddToHomescreenPrompt } from "./components/AddToHomeScreen/prompt"

const Account = lazy(() => import("./views/Account"))
const BackgroundImage = lazy(() => import("./components/BackgroundImage"))
const Settings = lazy(() => import("./views/Settings"))
const Support = lazy(() => import("./views/Support"))
const EntryDetail = lazy(() => import("./views/EntryDetail"))
const PageNotFound = lazy(() => import("./views/PageNotFound"))

const {
  ABOUT,
  HOME,
  ROOT,
  NEW_ENTRY,
  LOGIN,
  SIGNUP,
  PASSWORD_RESET,
  SETTINGS,
  SETTINGS_ENTRIES,
  SETTINGS_PREFERENCES,
  SETTINGS_PROFILE,
  SUPPORT,
  ENTRIES_CALENDAR,
  ENTRY_DETAIL,
  ENTRIES,
  ENTRIES_LIST,
  ENTRIES_FOLDERS,
  ENTRIES_TABLE,
  ENTRIES_MAP,
  PRIVACY_POLICY,
} = RouteMap

const mapStateToProps = ({ User }) => ({ User })

const mapDispatchToProps = {
  SetWindow,
  GetUserSettings,
  SetCalendar,
  SyncEntries,
  GetUserEntries,
  GetUserEntryTags,
  GetUserEntryPeople,
  ResetEntriesSortAndFilterMaps,
}

const App = ({
  GetUserSettings,
  User,
  SetWindow,
  SetCalendar,
  SyncEntries,
  GetUserEntries,
  GetUserEntryTags,
  GetUserEntryPeople,
  ResetEntriesSortAndFilterMaps,
  history,
  location,
  match,
}) => {
  const [prompt, promptToInstall] = useAddToHomescreenPrompt()
  const addToHomeScreenProps = { prompt, promptToInstall }
  useEffect(() => {
    const activeDate = new Date()

    SetCalendar({ activeDate })
    ResetEntriesSortAndFilterMaps()

    const handleResize = () => SetWindow()

    window.addEventListener("resize", handleResize)

    handleResize()

    if (User.id) {
      SyncEntries(() => new Promise((resolve) => resolve(GetUserEntries(1))))
      GetUserSettings()
      GetUserEntryTags()
      GetUserEntryPeople()
    }

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const renderRedirectOrComponent = (shouldRedirect, component, route) => {
    if (shouldRedirect && route === "GoBack")
      return () => RouterGoBack(history, true)
    const directTo = () => RouterLinkPush(history, route)
    return shouldRedirect ? () => <Redirect push to={directTo} /> : component
  }

  return (
    <Fragment>
      <NavBar {...addToHomeScreenProps} />
      <main className="App RouteOverlay">
        <BackgroundImage />
        <Switch>
          <Route
            exact={true}
            strict={false}
            path={[ABOUT]}
            render={({ history }) => (
              <About {...addToHomeScreenProps} history={history} />
            )}
          />
          <Route
            exact={true}
            strict={false}
            path={[ROOT, HOME]}
            render={({ history }) => (
              <Home {...addToHomeScreenProps} history={history} />
            )}
          />
          <Route
            exact
            path={[LOGIN, SIGNUP, PASSWORD_RESET]}
            component={renderRedirectOrComponent(
              !!User.token,
              Account,
              "GoBack"
            )}
          />
          <Route
            exact
            path={[
              SETTINGS,
              SETTINGS_ENTRIES,
              SETTINGS_PREFERENCES,
              SETTINGS_PROFILE,
            ]}
            component={Settings}
          />
          <Route exact path={[SUPPORT]} component={Support} />
          <Route
            exact={true}
            strict={false}
            path={[ENTRY_DETAIL]}
            render={({
              match: {
                params: { entryId },
              },
            }) => <EntryDetail entryId={entryId} />}
          />
          <Route
            exact={true}
            strict={false}
            path={[
              ENTRIES,
              NEW_ENTRY,
              ENTRIES_CALENDAR,
              ENTRIES_FOLDERS,
              ENTRIES_LIST,
              ENTRIES_TABLE,
              ENTRIES_MAP,
              NEW_ENTRY,
            ]}
            render={(routeProps) => <Entries {...routeProps} />}
          />
          <Route exact path={[PRIVACY_POLICY]} component={PrivacyPolicy} />
          <Route component={PageNotFound} />
        </Switch>
      </main>
    </Fragment>
  )
}

App.propTypes = {
  User: UserProps,
  SetWindow: PropTypes.func.isRequired,
  GetUserSettings: PropTypes.func.isRequired,
  SetCalendar: PropTypes.func.isRequired,
  SyncEntries: PropTypes.func.isRequired,
  GetUserEntries: PropTypes.func.isRequired,
  GetUserEntryTags: PropTypes.func.isRequired,
  GetUserEntryPeople: PropTypes.func.isRequired,
  ResetEntriesSortAndFilterMaps: PropTypes.func.isRequired,
  SetWindow: PropTypes.func.isRequired,
}

const isEqual = (prevProps, nextProps) =>
  memoizeProps(prevProps, nextProps, ["User"])

export default withRouter(
  reduxConnect(mapStateToProps, mapDispatchToProps)(memo(App, isEqual))
)
