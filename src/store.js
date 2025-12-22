import { createStore, combineReducers } from 'redux';

const initialState = {
  loggedInUser: null,
  sidebarShow: true,
  theme: 'light',
  isAuthenticated: false
};

const authReducer = (state = initialState, action) => {
  const { type, payload} = action;

  switch (type) {
    case 'set':
      return { ...state, sidebarShow: !state.sidebarShow };
    case 'LOGIN_SUCCESS':
      sessionStorage.setItem("userName", JSON.stringify(payload.username));
      sessionStorage.setItem("auth", payload.username.tok);
      return {
        ...state,
        isAuthenticated: true,
        loggedInUser: payload.username,
        message: ""
      };
    case 'LOGIN_FAILURE':
          return {
            ...state,
            isAuthenticated: false,
            message: "Invalid username or password"
          };
    case 'LOGOUT':
    sessionStorage.removeItem('userName');
    localStorage.removeItem('cust');
    sessionStorage.removeItem('auth');
          return {
            ...state,
            isAuthenticated: false,
            username: null
          };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  auth: authReducer,
});

const store = createStore(rootReducer);

export default store;
