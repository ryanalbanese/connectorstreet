import * as types from 'constants/ActionTypes';

const _defaultState = { response: '', isFetching: false, error: null, hasSavedMessages: false };

export const setCustomMessages = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_SETCUSTOMMESSAGES_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_SETCUSTOMMESSAGES_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_SETCUSTOMMESSAGES_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: null };
		default:
			return state;
	}
}
export const getUserCustomMessages = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_GETUSERCUSTOMMESSAGES_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_GETUSERCUSTOMMESSAGES_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_GETUSERCUSTOMMESSAGES_SUCCESS:

			const messagesObj = action.response[0][1]

			var hasMessages = false

			delete messagesObj.id

			const messagesArr = Object.values(messagesObj)

			if (!messagesArr === undefined || !messagesArr.length == 0) {
					hasMessages = true
			}

			return { ...state, response: messagesArr.reverse(), isFetching: false, error: null, hasSavedMessages: hasMessages };

		default:
			return state;
	}
}
export const getUsersCustomMessages = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_GETUSERSCUSTOMMESSAGES_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_GETUSERSCUSTOMMESSAGES_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_GETUSERSCUSTOMMESSAGES_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: null };
		default:

			return state;
	}
}
export const updateCustomMessages = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_UPDATECUSTOMMESSAGES_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_UPDATECUSTOMMESSAGES_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_UPDATECUSTOMMESSAGES_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: null };
		default:
			return state;
	}
}
