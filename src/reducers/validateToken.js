import * as types from 'constants/ActionTypes';

const _defaultState = { response: '', isFetching: false, error: null };

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.FETCH_VALIDATETOKEN_FETCHING:
			return { ...state, isFetching: true, error: '' };
		case types.FETCH_VALIDATETOKEN_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_VALIDATETOKEN_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: '' };
		default:
			return state;
	}
}
