import * as types from 'constants/ActionTypes';
import moment from 'moment'
import { dayNames, monthNames} from 'constants/config'

const _defaultState = { response: '', isFetching: false, error: null };

export const addNotification = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_ADDNOTIFICATION_FETCHING:

			return { ...state, isFetching: true, error: null };
		case types.FETCH_ADDNOTIFICATION_ERROR:

			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_ADDNOTIFICATION_SUCCESS:

			return { ...state, response: action.response, status: 204, isFetching: false, error: null };
		default:
			return state;
	}
}
export const updateNotifications = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_UPDATENOTIFICATIONS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_UPDATENOTIFICATIONS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_UPDATENOTIFICATIONS_SUCCESS:
			return { ...state, response: 200, isFetching: false, error: null };
		default:
			return state;
	}
}

export const getNotificationById = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_GETNOTIFICATIONBYID_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_GETNOTIFICATIONBYID_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_GETNOTIFICATIONBYID_SUCCESS:
			return { ...state, response: action.response && action.response[0] && action.response[0][1], isFetching: false, error: null };
		default:
			return state;
	}
}

export const getNotifications = (state = _defaultState, action) => {
	switch (action.type) {
		case types.FETCH_GETNOTIFICATIONS_FETCHING:
			return { ...state, isFetching: true, error: null };
		case types.FETCH_GETNOTIFICATIONS_ERROR:
			return { ...state, isFetching: false, response: '', error: action.error };
		case types.FETCH_GETNOTIFICATIONS_SUCCESS:

			let dataGroupedByDay = []

			if (action.response){

				const sortData = action.response && action.response.map(item => item[1]).sort((a, b) => b.date - a.date)

				const data = sortData

		    data.forEach(item => {
					const dateDay = Math.floor(item.date / (86400))
					const itemMoment = moment.unix(item.date)
					const itemTime = itemMoment.format('hh:mm a')

					let itemObj;

					switch (item.type) {
		      	case 'message':
			      	itemObj = {
		            type: item.type,
				        key: item.id,
				        time: itemTime.split(' ')[0],
				        midnight: itemTime.split(' ')[1],
				        topText: item.userBy.firstName + ' ' + item.userBy.lastName,
				        relationType: item.relationType,
				        avatar: item.userBy.avatar,
				        text: item.message || 'Test message',
				        fullDetails: item,
				        userIdFrom: item.userIdBy,
				        userIdTo: item.userIdTo,
					   }
		         break
		  		case 'makeIntroduction':
		  			itemObj = {
		          type: item.type,
				        key: item.id,
				        time: itemTime.split(' ')[0],
				        midnight: itemTime.split(' ')[1],
				        topText: item.userBy.firstName + ' ' + item.userBy.lastName,
				        relationType: item.relationType,
				        avatar: item.userBy.avatar,
				        text: item.message || 'Test message',
				        fullDetails: {
				          ...item,
				          fNameSecond: item.user2.fName,
				          sNameSecond: item.user2.sName
				        },
				        userIdFrom: item.userIdBy,
				        userIdTo: item.userIdTo,
					   }
		         break
		      }

					const findIndexOfDataByDateDay = dataGroupedByDay.findIndex(item => item.dateDay == dateDay)

					if (dataGroupedByDay.findIndex(item => item.dateDay == dateDay) == -1) {

					  dataGroupedByDay.push(
		          {
		            title: dayNames[itemMoment.isoWeekday() - 1].toUpperCase() + ' ' + monthNames[itemMoment.month()].toUpperCase() + ' ' + itemMoment.date() +' ' +itemMoment.year(),
		            data: [itemObj],
		            date: item.date,
		            dateDay: dateDay
		          })
		      }

					else {

						dataGroupedByDay[findIndexOfDataByDateDay].data.push(itemObj)

					}

				})

			}

			return { ...state, response: action.response && dataGroupedByDay || [], isFetching: false, error: null };
		default:
			return state;
	}
}
