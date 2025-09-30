import {
    ProductsActionTypes, CategoryActionTypes,
    type CategoryActions,
    type Category,
    type Product,
} from "./types";

export const fetchProductsRequest = () => ({
    type: ProductsActionTypes.FETCH_PRODUCTS_REQUEST,
})

export const fetchProductsSuccess = (products: Product[]) => ({
    type: ProductsActionTypes.FETCH_PRODUCTS_SUCCESS,
    payload: products,
})

export const fetchProductsFailure = (error: string) => ({
    type: ProductsActionTypes.FETCH_PRODUCTS_FAILURE,
    payload: error,
})

export const fetchCategoriesRequest = () => ({
    type: CategoryActionTypes.FETCH_CATEGORIES_REQUEST,
});

export const fetchCategoriesSuccess = (
    categories: Category[]
): CategoryActions => ({
    type: CategoryActionTypes.FETCH_CATEGORIES_SUCCESS,
    payload: categories,
});

export const fetchCategoriesFailure = (
    error: string
): CategoryActions => ({
    type: CategoryActionTypes.FETCH_CATEGORIES_FAILURE,
    payload: error,
});
