export interface Product {
    id: number;
    code: number;
    name: string;
    description: string;
    discounts: number | null;
    is_new: boolean;
    price: number;
    amount: number;
    category: number;
    images: { id: number; image: string }[];
}

export interface ProductApiresponse {
    success: boolean;
    errMessage: string | null;
    errorCode: string | null;
    data: {
        items: Product[];
    };
}

export interface Category {
    id: number;
    name: string;
    min_price: number;
    max_price: number;
    parent_category: string | null;
    image: string;

}

export interface CategoryApiResponse {
    success: boolean;
    errorMessage: string | null;
    errorCode: string | null;
    data: {
        categories: Category[];
    };
}

export interface AppState {
    categories: Category[];
    products: Product[];
    loading: boolean;
    error: string | null;
}

export const ProductsActionTypes = {
    FETCH_PRODUCTS_REQUEST: "FETCH_PRODUCTS_REQUEST",
    FETCH_PRODUCTS_SUCCESS: "FETCH_PRODUCTS_SUCCESS",
    FETCH_PRODUCTS_FAILURE: "FETCH_PRODUCTS_FAILURE",
} as const;

export type ProductsActionTypes =
    typeof ProductsActionTypes;
export type ProductsActionType = ProductsActionTypes[keyof ProductsActionTypes];

interface FetchProductsRequestAction {
    type: typeof ProductsActionTypes.FETCH_PRODUCTS_REQUEST;
}

interface FetchProductsSuccessAction {
    type: typeof ProductsActionTypes.FETCH_PRODUCTS_SUCCESS;
    payload: Product[];
}

interface FetchProductsFailureAction {
    type: typeof ProductsActionTypes.FETCH_PRODUCTS_FAILURE;
    payload: string;
}

export type ProductsActions =
    | FetchProductsRequestAction
    | FetchProductsSuccessAction
    | FetchProductsFailureAction


export const CategoryActionTypes = {
    FETCH_CATEGORIES_REQUEST: "FETCH_CATEGORIES_REQUEST",
    FETCH_CATEGORIES_SUCCESS: "FETCH_CATEGORIES_SUCCESS",
    FETCH_CATEGORIES_FAILURE: "FETCH_CATEGORIES_FAILURE",
} as const;

export type CategoryActionTypes =
    typeof CategoryActionTypes;
export type CategoryActionType = CategoryActionTypes[keyof CategoryActionTypes];

interface FetchCategoriesRequestAction {
    type: typeof CategoryActionTypes.FETCH_CATEGORIES_REQUEST;
}

interface FetchCategoriesSuccessAction {
    type: typeof CategoryActionTypes.FETCH_CATEGORIES_SUCCESS;
    payload: Category[];    
}

interface FetchCategoriesFailureAction {
    type: typeof CategoryActionTypes.FETCH_CATEGORIES_FAILURE;
    payload: string;        
}

export type CategoryActions =
    | FetchCategoriesRequestAction
    | FetchCategoriesSuccessAction
    | FetchCategoriesFailureAction;
