import * as types from 'constants/ActionTypes';

const _defaultState = { data: 0 };

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.RESET_PHONEINDEX:
			return { ...state, data: 0 };
		case types.SET_PHONEINDEX:
			return { ...state, data: action.data};
		default:
			return state;
	}
}
