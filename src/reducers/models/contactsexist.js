import * as types from 'constants/ActionTypes';
import moment from 'moment'
import store from 'api/ReduxStore'
import _ from 'lodash'
const _defaultState = { response: '', isFetching: false, error: null };

export const contactsExist = (state = _defaultState, action) => {
	let uniqueContacts = _.uniqBy(action.response, 'newPhone')
	switch (action.type) {
		case types.FETCH_CONTACTSEXIST_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_CONTACTSEXIST_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_CONTACTSEXIST_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_CONTACTSEXIST_SUCCESS:
			return { ...state, response: uniqueContacts, found: action.response.length > 0 ? true : false, isFetching: false, error: null };
		default:
			return state;
	}
}
