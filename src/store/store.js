// import { applyMiddleware, combineReducers, compose,createStore,} from 'redux';
// import {PostsReducer, toggleMenu} from './reducers/PostsReducer';
// import {thunk} from 'redux-thunk';
// import { AuthReducer } from './reducers/AuthReducer';
// import todoReducers from './reducers/Reducers';
// const middleware = applyMiddleware(thunk);

// const composeEnhancers =
//     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const reducers = combineReducers({
//     sideMenu: toggleMenu,
//     posts: PostsReducer,
//     auth: AuthReducer,
// 		todoReducers,
	
// });

// export const store = createStore(reducers,  composeEnhancers(middleware));

import {
    applyMiddleware,
    combineReducers,
    compose,
    createStore,
} from "redux";

import { PostsReducer, toggleMenu } from "./reducers/PostsReducer";
import { thunk } from "redux-thunk";
import { AuthReducer } from "./reducers/AuthReducer";
import todoReducers from "./reducers/Reducers";

const reducers = combineReducers({
    sideMenu: toggleMenu,
    posts: PostsReducer,
    auth: AuthReducer,
    todoReducers,
});

const middleware = applyMiddleware(thunk);

const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
    reducers,
    composeEnhancers(middleware)
);

// Latest code 

// import { configureStore } from "@reduxjs/toolkit";
// import { PostsReducer, toggleMenu } from "./reducers/PostsReducer";
// import { AuthReducer } from "./reducers/AuthReducer";
// import todoReducers from "./reducers/Reducers";
// export const store = configureStore({
//     reducer: {
//         sideMenu: toggleMenu,
//         posts: PostsReducer,
//         auth: AuthReducer,
//         todoReducers,
//     },
// });