import * as types from 'constants/ActionTypes';

const _defaultState = { data: [] };

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.SET_PUSH_NOTIF_DATA:
			return { ...state, data: action.data };
		default:
			return state;
	}
}
