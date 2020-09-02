import * as types from 'constants/ActionTypes';
import moment from 'moment'
import store from 'api/ReduxStore'

const _defaultState = { response: '', isFetching: false, error: null };

export const logger = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_LOGGER_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_LOGGER_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_LOGGER_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_LOGGER_SUCCESS:
			return { ...state, response: action.response, isFetching: false, error: null };
		default:
			return state;
	}
}
