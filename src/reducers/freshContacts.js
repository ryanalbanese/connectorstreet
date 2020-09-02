import * as types from 'constants/ActionTypes';

const _defaultState = { data: [] };

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.SET_FRESH_CONTACTS:
		return { ...state, response: action.data, isFetching: false, error: null }
		default:
			return state;
	}
}
