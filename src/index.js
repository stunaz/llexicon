import "./styles/index.css"
import React, { Suspense, lazy } from "react"
import ReactDOM from "react-dom"
import App from "./App"
import storeFactory from "./redux"
import { getUserClientId } from "./redux/localState"
import { Provider } from "react-redux"
import { BrowserRouter, Router } from "react-router-dom"
import { createBrowserHistory } from "history"
import { LoadingScreen } from "./components"
import { PersistGate } from "redux-persist/integration/react"
import * as serviceWorker from "./serviceWorker"
import { GetAppVersion } from "./redux/App/actions"
import ReactGA from "react-ga"

const { store, persistor } = storeFactory()

const history = createBrowserHistory()

const AlertNotifications = lazy(() => import("./components/AlertNotifications"))

const { NODE_ENV, REACT_APP_GOOGLE_TRACKING_ID } = process.env

const inDevelopmentMode = NODE_ENV === "development"

const { userId, version, appVersion, userIdUsernameEmail } = getUserClientId()

ReactGA.initialize(REACT_APP_GOOGLE_TRACKING_ID, {
  debug: inDevelopmentMode,
  // titleCase: false,
  // dimension14: "userIdUsernameEmail",
  gaOptions: {
    userId,
    version,
    appVersion,
    userIdUsernameEmail,
  },
})
// Initialize google analytics page view tracking
history.listen((location) => {
  const { userId, version, appVersion, userIdUsernameEmail } = getUserClientId()
  const page = location.pathname

  // ReactGA.set({ dimension1: "test" })
  // ReactGA.pageview(page, { dimension1: "test" }) // Record a pageview for the given page

  ReactGA.set({ userId, version, appVersion, userIdUsernameEmail, page }) // Update the user's current page
  ReactGA.pageview(page) // Record a pageview for the given page
})

// ReactGA.ga((tracker) => {

//   ReactGA.set({ dimension1: profileId });

//   ReactGA.pageview(pageName, { dimension1: profileId });
// })

// const initialState = getReduxState()
// const ReduxStore = storeFactory(initialState)

ReactDOM.render(
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Suspense fallback={<LoadingScreen />}>
        <AlertNotifications />
        <Router history={history}>
          <App />
        </Router>
      </Suspense>
    </PersistGate>
  </Provider>,
  // </React.StrictMode>,
  document.getElementById("root")
)

// Doesn't get called in development since there is no service worker
inDevelopmentMode && store.dispatch(GetAppVersion())

serviceWorker.register(serviceWorker.serviceWorkerConfig(store))
