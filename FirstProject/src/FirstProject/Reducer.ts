import {
  CategoryActionTypes, type AppState, ProductsActionTypes,
  type ProductsActions, type CategoryActions
} from "./types";

const initialState: AppState = {
  categories: [],
  products: [],
  loading: false,
  error: null,
}

export function appReducer(
  state = initialState,
  action: CategoryActions | ProductsActions
): AppState {
  switch (action.type) {
    // --- категории ---
    case CategoryActionTypes.FETCH_CATEGORIES_REQUEST:
      return { ...state, loading: true, error: null };

    case CategoryActionTypes.FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload, error: null,
      };

    case CategoryActionTypes.FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // --- товары (как было) ---
    case ProductsActionTypes.FETCH_PRODUCTS_REQUEST:
      return { ...state, loading: true, error: null };

    case ProductsActionTypes.FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload,
      };

    case ProductsActionTypes.FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
}

export type { AppState };
