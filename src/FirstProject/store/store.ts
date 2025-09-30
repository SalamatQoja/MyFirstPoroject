// import { configureStore } from "@reduxjs/toolkit";
// import createSagaMiddleware from "redux-saga";
// import { appReducer } from "../Reducer";
// import { rootSaga } from "../Saga/rootSaga";


// const sagaMiddleWare = createSagaMiddleware();

// export const store = configureStore({
//     reducer: {
//         app: appReducer,
//     },
//     middleware: (getDefaultMiddleWare) => 
//         getDefaultMiddleWare({thunk: false}).concat(sagaMiddleWare),
// })

// sagaMiddleWare.run(rootSaga);

// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch;

// store.ts
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { rootReducer } from "../RootReducer/Rootreducer";
import  {rootSaga} from "../Saga/rootSaga";

const sagaMiddleWare = createSagaMiddleware();

export const store = configureStore({
    reducer: rootReducer,

    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({thunk: false}).concat(sagaMiddleWare),
});
sagaMiddleWare.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;