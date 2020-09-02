import * as types from 'constants/ActionTypes';

const _defaultState = { response: '', isFetching: false, error: null };

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.FETCH_INVITEFRIEND_FETCHING:
		console.log('fetching')
			return { ...state, isFetching: true, error: null};
		case types.FETCH_INVITEFRIEND_ERROR:
		console.log('error')
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_INVITEFRIEND_SUCCESS:
		console.log('success')
			return { ...state, response: action.response, isFetching: false, error: null };
		default:
			return state;
	}
}
