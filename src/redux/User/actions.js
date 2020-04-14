import { UserActionTypes } from "../User/types"
import { AlertActionTypes } from "../Alerts/types"
import { AppActionTypes } from "../App/types"
import { Axios, AxiosForm, AxiosOffline } from "../Actions"
import { persistReduxState } from "../localState"
import { GetUserEntries } from "../Entries/actions"
import { clearReduxStoreFromLocalStorage } from "../localState"
import qs from "qs"

const SetUser = (payload) => ({
  type: UserActionTypes.USER_SET,
  payload,
})

const ChangeUser = (payload) => ({ type: UserActionTypes.USER_SET, payload })

const UserLogin = (payload, rememberMe) => async (dispatch) =>
  await Axios()
    .post("login/", qs.stringify(payload))
    .then(async ({ data }) => {
      const { id, token } = data
      await dispatch(RefreshPatchUser(id))
      await dispatch(SetUser(data))
      await dispatch(persistReduxState())
      await dispatch(GetUserEntries(1))

      return data
    })
    .catch((e) => console.log("UserLogin: ", e.response))

const RefreshPatchUser = (id) => (dispatch) =>
  Axios()
    .get(`users/${id}/refresh/`)
    .then(({ data }) => {
      dispatch({
        type: UserActionTypes.USER_SET,
        payload: data,
      })
      return data
    })
    .catch((e) =>
      e.response && e.response.status == 401
        ? dispatch({
            type: AppActionTypes.REDUX_RESET,
            payload: null,
          })
        : console.log(e)
    )

const UserLogout = () => ({ type: AppActionTypes.REDUX_RESET })

const CreateUser = (payload, rememberMe) => (dispatch) =>
  Axios()
    .post("users/", qs.stringify(payload))
    .then((res) => dispatch(UserLogin(payload, rememberMe)))
    .catch((e) => console.log("CreateUser: ", e.response))

const UpdateUser = (payload) => (dispatch, getState) => {
  const { id } = getState().User
  return Axios()
    .patch(`users/${id}/`, qs.stringify(payload))
    .then(({ data }) => {
      dispatch({ type: UserActionTypes.USER_SET, payload: data })
      dispatch({
        type: AlertActionTypes.ALERTS_SET_MESSAGE,
        payload: { title: "Updated", message: "Profile" },
      })
      return data
    })
    .catch((e) => console.log("UpdateUser ERROR: ", e))
}

const UpdateProfile = (payload) => (dispatch, getState) => {
  const { id } = getState().User
  // await dispatch({ type: USER_UPDATE_LOADING })
  return AxiosForm(payload)
    .patch(`users/${id}/`, payload)
    .then(({ data }) => {
      dispatch({
        type: UserActionTypes.USER_SET,
        payload: data,
      })
      return data
    })
    .catch((e) => console.log("UpdateProfile: ", e.response))
}

const SetUserLocation = (position) => (dispatch) => {
  if (!position) {
    return dispatch({ type: UserActionTypes.USER_RESET_LOCATION })
  }
  const {
    coords: {
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      latitude,
      longitude,
      speed,
    },
    timestamp,
  } = position

  dispatch({
    type: UserActionTypes.USER_SET_LOCATION,
    payload: {
      accuracy,
      altitude,
      altitudeAccuracy,
      heading,
      latitude,
      longitude,
      speed,
      timestamp,
    },
  })
}

const GetUserLocation = () => (dispatch) => {
  const { geolocation } = navigator
  return geolocation.getCurrentPosition(
    (position) => {
      //console.log("GetUserLocation:", position)
      dispatch(SetUserLocation(position))
    },
    (error) => console.log("GetUserLocation ERROR: ", error),
    { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 }
  )
}

const WatchUserLocation = (watchId) => (dispatch) => {
  const { geolocation } = navigator
  if (watchId) {
    dispatch(SetUserLocation(null))
    return geolocation.clearWatch(watchId)
  }

  return geolocation.watchPosition(
    (position) => {
      // console.log("WatchUserLocation:", position)
      dispatch(SetUserLocation(position))
    },
    (error) => console.log("WatchUserLocation ERROR: ", error),
    { enableHighAccuracy: true, timeout: 3000, maximumAge: 10000 }
  )
}

const PasswordReset = (payload) => (dispatch) =>
  Axios()
    .post("rest-auth/password/reset/", qs.stringify(payload))
    .then(({ data: { detail } }) => {
      dispatch({
        type: AlertActionTypes.ALERTS_SET_MESSAGE,
        payload: { title: "Password Reset", message: detail },
      })
    })
    .catch((e) => {
      console.log(JSON.parse(JSON.stringify(e)))
      dispatch({
        type: AlertActionTypes.ALERTS_SET_MESSAGE,
        payload: { title: "Password Reset", message: "ERROR" },
      })
    })

const GetUserSettings = () => (dispatch, getState) => {
  const { id } = getState().User
  return AxiosOffline()
    .get(`user/settings/${id}/view/`)
    .then(({ data }) => {
      dispatch({
        type: UserActionTypes.USER_SET_SETTINGS,
        payload: data,
      })
      return data
    })
    .catch((e) => console.log(e))
}

const PostSettings = (payload) => (dispatch) => {
  dispatch({
    type: UserActionTypes.USER_SET_SETTINGS,
    payload,
  })
  return AxiosOffline()
    .post(`user/settings/`, qs.stringify(payload))
    .then(({ data }) => {
      dispatch({
        type: UserActionTypes.USER_SET_SETTINGS,
        payload: data,
      })
      return data
    })
    .catch((e) => console.log("PostSettings: ", e.response))
}
const SetSettings = (payload) => (dispatch, getState) => {
  const { id } = getState().User.Settings
  dispatch({
    type: UserActionTypes.USER_SET_SETTINGS,
    payload,
  })

  return AxiosOffline()
    .patch(`user/settings/${id}/`, qs.stringify(payload))
    .then(({ data }) => {
      dispatch({
        type: AlertActionTypes.ALERTS_SET_MESSAGE,
        payload: { title: "Updated", message: "Setting" },
      })
      dispatch({
        type: UserActionTypes.USER_SET_SETTINGS,
        payload: data,
      })
      return data
    })
    .catch((e) => console.log("SetSettings: ", e.response))
}

const DeleteAccount = () => (dispatch, getState) => {
  const { id } = getState().User
  return Axios()
    .delete(`users/${id}/`)
    .then((res) => {
      dispatch({
        type: AlertActionTypes.ALERTS_SET_MESSAGE,
        payload: { title: "Deleted", message: "Account" },
      })
      clearReduxStoreFromLocalStorage()
      dispatch(UserLogout())
    })
    .catch((e) => console.log("DeleteAccount: ", e.response))
}

const SearchForUsers = (search) =>
  Axios.get(`/users?search=${search}/`)
    .then(({ data }) => {})
    .catch((e) => console.log("SearchForUsers: ", e.response))

export {
  SetUser,
  ChangeUser,
  UserLogin,
  RefreshPatchUser,
  UserLogout,
  CreateUser,
  UpdateUser,
  UpdateProfile,
  SetUserLocation,
  GetUserLocation,
  WatchUserLocation,
  PasswordReset,
  GetUserSettings,
  PostSettings,
  SetSettings,
  DeleteAccount,
  SearchForUsers,
}
