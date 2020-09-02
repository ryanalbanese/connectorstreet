import * as types from 'constants/ActionTypes';
import moment from 'moment'
import store from 'api/ReduxStore'

const _defaultState = { response: '', isFetching: false, error: null };

export const remoteContacts = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_REMOTECONTACTS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_REMOTECONTACTS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_REMOTECONTACTS_SUCCESS:
			return { ...state, response: action.response, found: action.response.length > 0 ? true : false, isFetching: false, error: null };
		default:
			return state;
	}
}
