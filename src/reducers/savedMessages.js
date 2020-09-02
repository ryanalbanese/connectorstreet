import * as types from "constants/ActionTypes";

const _defaultState = {
	data: [
		{
				value : "I have told you about each other. I will leave it to the two of you to connect.",
				type: "default",
		},
		{
				value : "Here’s the introduction I promised. I will leave it to the two of you to connect.",
				type: "default",
		},
		{
				value : "You two need to meet. Please let me know if you’d like more information.",
				type: "default",
		},
		{
				value : "You should connect. Please let me know if you'd like more information.",
				type: "default",
		},
		{
				value : "You need to meet! 😊",
				type: "default",
		},
		{
				value : "Here’s the introduction I promised. 😊",
				type: "default",
		},
		{
				value : "You should connect! You will like each other. 😊",
				type: "default",
		},
		{
				value : "You have a lot in common. You should connect!",
				type: "default",
		},
		{
				value : "Following up on our conversation, here is the introduction I promised",
				type: "default",
		},
		{
				value : "You graduated from the same school. You need to meet! 😊 🎓",
				type: "default",
		},
		{
				value : "You two are neighbors! You should connect! 🏠 😊",
				type: "default",
		},
		{
				value : "You are both big readers. You should connect. 📚 😊",
				type: "default",
		},
		{
				value : "You can thank me later! 😉 😉",
				type: "romance",
		},
		{
				value : "You two need to meet! 😉 😊 ❤️",
				type: "romance",
		},
		{
				value : "You two are perfect for each other ❤️, I just know it!",
				type: "romance",
		},
		{
				value : "This is a perfect match! ❤️",
				type: "romance",
		},
		{
				value : "Meet your beschert! ❤️",
				type: "romance",
		},

		{
				value : "Trust me, this is a good match! 😉",
				type: "romance",
		},
		{
				value : "I have a hunch you two will hit it off. 😊😊 ",
				type: "romance",
		},
		{
				value : "You two are kindred spirits. 😊",
				type: "romance",
		},
		{
				value : "I think you two will like each other. 👍",
				type: "romance",
		},
		{
				value : "You two are meant to be! ❤️ ❤️",
				type: "romance",
		},
		{
				value : "You two are a good match. ❤️",
				type: "romance",
		},
		{
				value : "This is an inspired match!  ❤️ 😊",
				type: "romance",
		},
		{
				value : "Thanks for awesome introduction. 👍🏻",
				type: "tym",
		},
		{
				value : "Thanks for the intro.",
				type: "tym",
		},
		{
				value : "⭐️⭐️⭐️⭐️⭐️. Excellent intro. Thanks!",
				type: "tym",
		},
		{
				value : "Perfect match. Thank you.",
				type: "tym",
		},
		{
				value : "😀 Thanks for the intro.",
				type: "tym",
		},
		{
				value : "I’m following up. Thanks.",
				type: "tym",
		},
		{
				value : "Huge help. Thanks.",
				type: "tym",
		},
		{
				value : "Keep them coming. Thanks.",
				type: "tym",
		},
		,
		{
				value : "We were just introduced. Great to meet you!",
				type: "introduced",
		}
	]
};

export default function (state = _defaultState, action) {
	switch (action.type) {
		case types.ADD_SAVED_MESSAGE:
			let newDataState = state.data
			newDataState.push(action.data)
			return { ...state, data: newDataState };
		default:
			return state;
	}
}
