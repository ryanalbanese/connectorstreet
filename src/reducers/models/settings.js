import * as types from 'constants/ActionTypes';

const _defaultState = { response: '', isFetching: false, error: null };

export const setSettings = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_SETSETTINGS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_SETSETTINGS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_SETSETTINGS_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: null };
		default:
			return state;
	}
}

export const updateSettings = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_UPDATESETTINGS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_UPDATESETTINGS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_UPDATESETTINGS_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: null };
		default:
			return state;
	}
}

export const getSettings = (state = _defaultState, action) => {

	switch (action.type) {
		case types.FETCH_GETSETTINGS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_GETSETTINGS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_GETSETTINGS_SUCCESS:
			return { ...state, response: action.response && action.response[0] && action.response[0][1] || null, isFetching: false, error: null };
		default:
			return state;
	}
}

export const getUsersSettings = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_GETUSERSSETTINGS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_GETUSERSSETTINGS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_GETUSERSSETTINGS_SUCCESS:
			return { ...state, response: action.response && action.response.map(item => item[1]) || null, isFetching: false, error: null };
		default:
			return state;
	}
}
