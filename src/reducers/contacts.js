import * as types from 'constants/ActionTypes';

const _defaultState = { data: [] };

function sortContactList(a, b) {

	const sNameA = a.sName.toUpperCase(),
				sNameB = b.sName.toUpperCase(),
				fNameA = a.fName.toUpperCase(),
				fNameB = b.fName.toUpperCase()

	let comparison = 0;

	if (sNameA == sNameB){
		if (fNameA > fNameB){
			comparison = 1
		}
		else {
			comparison = -1
		}
	}
	else if (sNameA > sNameB) {
		comparison = 1
	}
	else if (sNameA < sNameB) {
		comparison = -1
	}
	return comparison;
}

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.RESET_CONTACTS:
			return { ...state, data: [] };
		case types.SET_CONTACTS:
		const contactsData = action.data && action.data.sort(sortContactList)
			return { ...state, data: contactsData, listType: action.listType};
		default:
			return state;
	}
}
