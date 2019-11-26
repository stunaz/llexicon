import { ReduxActions } from "../../constants.js"

const DEFAULT_STATE_USER = {
  token: null,
  id: null,
  picture: null,
  username: null,
  email: null,
  first_name: null,
  last_name: null,
  is_superuser: null,
  is_staff: null,
  is_active: null,
  last_login: null,
  opt_in: null,
  date_joined: null,
  SocialAuthentications: [],
  groups: [],
  user_permissions: [],
  Settings: { show_footer: false, push_messages: false, offline_mode: false },
  location: {}
}

const User = (state = DEFAULT_STATE_USER, action) => {
  const { type, payload } = action
  switch (type) {
    case ReduxActions.USER_SET:
      return { ...state, ...payload }
    case ReduxActions.USER_SET_SOCIAL_AUTHENTICATION:
      return {
        ...state,
        SocialAuthentication: payload
      }
    case ReduxActions.USER_UPDATE_LOADING:
      return {
        ...state,
        updating: true,
        updated: false
      }
    case ReduxActions.USER_UPDATE_SUCCESS:
      return {
        ...state,
        ...payload,
        updating: false,
        updated: true,
        error: null
      }
    case ReduxActions.USER_CLEAR_API:
      return {
        ...state,
        posting: false,
        posted: false,
        updating: false,
        updated: false,
        error: null
      }
    case ReduxActions.SET_USER_LOCATION:
      return { ...state, location: { ...state.location, ...payload } }
    case ReduxActions.USER_SET_SETTINGS:
      return {
        ...state,
        Settings: { ...state.Settings, ...payload }
      }
    case ReduxActions.REDUX_RESET:
      return DEFAULT_STATE_USER
    default:
      return state
  }
}

export { DEFAULT_STATE_USER, User }
