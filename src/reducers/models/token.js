import * as types from 'constants/ActionTypes';

const _defaultState = { response: '', isFetching: false, error: null };

export const parseToken = (state = _defaultState, action) => {

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
