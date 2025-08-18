import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoriesRequest, fetchProductsRequest } from "../Action";
import type { RootState } from "../store/store";
import "../Products.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import slickSlider from "../Slider";
import LogotipGlobus from "../img/logotipGlobus.png";
import Slider from "react-slick"
import { SlBasket } from "react-icons/sl";
import { IoSearchSharp } from "react-icons/io5";
import { BiUser } from "react-icons/bi";
import { GiArchiveRegister } from "react-icons/gi";
import type { Product } from "../types";
import { RegistrationForm } from "../Avtorizatsya/Registration";
import { AuthoritaionLogin } from "../Avtorizatsya/Login";
import CircularProgress from "@mui/material/CircularProgress";

export const ProductList: React.FC = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 1300,
        slidesToShow: 1,
        slidesToScroll: 1,

    };

    const dispatch = useDispatch();
    const { products, error, categories, loading } = useSelector((state: RootState) => state.app);
    const [productFull, setProductFull] = useState<Product | null>(null);
    const [searchProduct, setSearchProduct] = useState("");
    const [authShow, setAuthshow] = useState(false);
    const [loginShow, setLoginShow] = useState(false);
    // const [categoryshow, SetCategoryShow] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);

    const handleProductShow = (product: Product) => {
        setProductFull(product);
    };

    const handleBack = () => {
        setProductFull(null);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchProduct(event.target.value);
    };

    const handleAuthClick = () => {
        setAuthshow(true);
    };

    const handleLoginClick = () => {
        setLoginShow(true);
    };

    useEffect(() => {
        dispatch(fetchProductsRequest());
        dispatch(fetchCategoriesRequest());
    }, [dispatch]);

    const filterProduct = products.filter((product) => {
        const productSearch = product.name.toLowerCase().includes(searchProduct.toLowerCase());
        return productSearch;
    });
    const handleCategoryShow = (catIdOrName: number | string) => {
        setSelectedCategory(catIdOrName);
        // можно также прокрутить вверх: window.scrollTo(0, 0);
    };

    // сброс фильтра категории
    const clearCategory = () => setSelectedCategory(null);

    // --- вычисляем картинку для категории: либо у категории есть image, либо берём первую картинку товара в категории
    const categoryImageMap = useMemo(() => {
        const map = new Map<number | string, string | undefined>();
        for (const cat of categories) {
            // если у категории есть поле image, можно положить его здесь (в примере его нет)
            // map.set(cat.id, (cat as any).image);
            map.set(cat.id, undefined);
        }
        // заполним из products (первое встречное изображение)
        for (const p of products) {
            const keyById = p.category ?? p.id ?? null; // попытка найти поле
            if (keyById != null && !map.get(keyById)) {
                const img = p.images?.[0]?.image;
                if (img) map.set(keyById, img);
            }
            // также попытка сопоставить по имени (если product.category === category.name)
            for (const cat of categories) {
                if (!map.get(cat.id) && String(p.category) === String(cat.name)) {
                    const img = p.images?.[0]?.image;
                    if (img) map.set(cat.id, img);
                }
            }
        }
        return map;
    }, [categories, products]);

    // фильтрация: если выбрана категория — показываем только её продукты
    const filteredProducts = useMemo(() => {
        const q = searchProduct.trim().toLowerCase();
        return products.filter(p => {
            const matchesSearch = !q || p.name?.toLowerCase().includes(q);
            let matchesCategory = true;
            if (selectedCategory != null) {
                // пробуем несколько вариантов соответствия: id или name
                matchesCategory =
                    String(p.category) === String(selectedCategory) ||
                    String(p.id ?? p.id) === String(selectedCategory) ||
                    String(p.name ?? p.name) === String(selectedCategory);
            }
            return matchesSearch && matchesCategory;
        });
    }, [products, searchProduct, selectedCategory]);

    // when a category is selected, find its meta (name, min/max)
    const selectedCategoryMeta = useMemo(() => {
        if (selectedCategory == null) return null;
        // ищем по id или по имени
        return categories.find(cat => String(cat.id) === String(selectedCategory) || String(cat.name) === String(selectedCategory) || String(cat.max_price) === String(selectedCategory)) ?? null;
    }, [selectedCategory, categories]);

    // const categoryImageMap = useMemo(() => {
    //     const map = new Map<string, string>();

    //     // helper сделать ключи в строку
    //     const keyOf = (k: any) => (k === null || k === undefined) ? '' : String(k);

    //     // 1. пройдём по продуктам и положим первую подходящую картинку для каждой категории-ключа
    //     for (const p of products) {
    //         const img = p.images?.[0]?.image;
    //         if (!img) continue;
    //         // возможные поля, где может лежать ссылка на категорию
    //         const candidates = [
    //             p.category,       // возможно id или name
    //             p.id,     // часто id
    //             p.name,   // возможно имя
    //         ];
    //         for (const c of candidates) {
    //             const key = keyOf(c);
    //             if (!key) continue;
    //             if (!map.has(key)) map.set(key, img);
    //         }
    //     }

    //     // 2. дополнительно, если у нас есть categories и у некоторых нет картинки — попробуем найти продукт по имени категории
    //     for (const cat of categories) {
    //         const catKey = keyOf(cat.id);
    //         if (map.has(catKey)) continue;
    //         // найти product где product.category (или categoryName) === cat.name
    //         const p = products.find(pr =>
    //             keyOf(pr.category) === keyOf(cat.id) ||
    //             keyOf(pr.category) === keyOf(cat.name) ||
    //             keyOf(pr.id) === keyOf(cat.id) ||
    //             keyOf(pr.name) === keyOf(cat.name)
    //         );
    //         const img = p?.images?.[0]?.image;
    //         if (img) map.set(catKey, img);
    //     }

    //     return map;
    // }, [products, categories]);

    // // 2) toggle selection (multi-select)
    // const toggleCategory = (catId: string | number) => {
    //     const key = String(catId);
    //     setSelectedCategory(prev => {
    //         if (prev.some(x => String(x) === key)) {
    //             return prev.filter(x => String(x) !== key);
    //         } else {
    //             return [...prev, key];
    //         }
    //     });
    // };

    // // 3) фильтрация продуктов с поддержкой множественного выбора
    // const filteredProducts = useMemo(() => {
    //     const q = searchProduct.trim().toLowerCase();
    //     return products.filter(p => {
    //         const matchesSearch = !q || (p.name ?? '').toLowerCase().includes(q);

    //         // получить все category-ключи продукта
    //         const keys = [p.category, p.id, p.name].map(k => (k == null ? '' : String(k)));

    //         const matchesCategory = selectedCategory.length === 0
    //             ? true
    //             : selectedCategory.some(sel => keys.includes(String(sel)));

    //         return matchesSearch && matchesCategory;
    //     });
    // }, [products, searchProduct, selectedCategory]);


    // const selectedCategoryMetas = useMemo(() => {
    //     if (!selectedCategory || selectedCategory.length === 0) return [];
    //     return categories.filter(cat =>
    //         selectedCategory.some(sel =>
    //             String(sel) === String(cat.id) || String(sel) === String(cat.name)
    //         )
    //     );
    // }, [selectedCategory, categories]);


    // Loading skeleton
    if (loading && products.length === 0) return <div><CircularProgress /></div>;
    if (loading && categories.length === 0) return <div><CircularProgress /></div>;


    if (productFull) {
        const likelyProducts = products.filter((p) => String(p.category) === String(productFull.category) && p.id !== productFull.id);
        // const  categoriess = categories.filter((p) => String(p.image) ===  String(productFull.images) && p.name !== productFull.name );
        return (
            <div className="productShowModal">
                <nav className="header">
                    <img src={LogotipGlobus} alt="" className="logotip" />
                    <input type="text"
                        className="globus-input"
                        onChange={handleChange} />
                    <IoSearchSharp className="ikons-search" />
                    <div className="btn-row">
                        <button className="globus-receiv">
                            Vxod <BiUser className="user-ikons" />
                        </button>
                        <button
                            className="globus-basket">
                            Регистрация
                            <GiArchiveRegister className="basket-ikons"
                            /></button>
                    </div>
                </nav>
                <hr style={{ width: '1359px' }} />
                <div className="productShow-row">
                    <div className="productShow-item">
                        <div className="product-wrapper">
                            <button onClick={handleBack} className="productShow-btn">Nazad</button>
                            <div className="productShow-inner">
                                <img
                                    src={productFull.images[0]?.image}
                                    alt="products"
                                    className="product-modal-img"
                                />
                                <div className="productShow-information">
                                    <p className="productShow-title1">{productFull.name}</p>
                                    <p className="productShow-ppp">Kratko o produkte</p>
                                    <p className="productShow-pp">{productFull.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="likely-product">
                    <h2 className="likely-title">Похожие продукты</h2>
                    <div className="likely-list">
                        {likelyProducts.length ? (
                            likelyProducts.map((p) => (
                                <div key={p.id} className="likely-item" onClick={() => handleProductShow(p)}>
                                    <img
                                        src={p.images[0]?.image}
                                        alt={p.name}
                                        className="likely-img"
                                    />
                                    <div className="likely-info">
                                        <p className="likely-p">{p.name}</p>
                                        <p className="likely-p2">Tsena: {p.price} UZS</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Poxojiye tovari ne naydeno </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }
    if (selectedCategoryMeta) {
        // const meta = selectedCategoryMeta[0];
        const catImg = categoryImageMap.get(String(selectedCategoryMeta.id)) ?? '/images/default.png';
        return (
            <div className="main">
                <div className="header">
                    <img src={LogotipGlobus} alt="" className="logotip" />
                    <input type="text"
                        className="globus-input"
                        onChange={handleChange} />
                    <div className="ikons-1">
                        <IoSearchSharp className="ikons-search" />
                    </div>
                    <div className="btn-row">
                        <button
                            onClick={handleLoginClick}
                            className="globus-receiv">
                            Vxod <BiUser className="user-ikons" />
                        </button>
                        <button
                            onClick={handleAuthClick}
                            className="globus-basket">
                            Регистрация
                            <GiArchiveRegister className="basket-ikons" />
                        </button>
                    </div>
                </div>
                <div className="product-slider-row">
                    <div className="header-slider">
                        <Slider {...settings}>
                            {slickSlider.map((d) => (
                                <div className="slick-slider">
                                    <div className="product-slider1">
                                        <img src={d.image} alt="" className="img-size" />
                                    </div>
                                </div>
                            ))}
                        </Slider>
                    </div>
                    <div className="categories-main">
                        <h2 className="category-title">Все категоры</h2>
                        <div className="category-row">
                            {categories.map(cat => (
                                <div key={cat.id}
                                    className="categories-inner"
                                    onClick={() => handleCategoryShow(cat.id)}>
                                    <p className="category-p">{cat.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <hr style={{ width: "1332px", marginTop: "12px", marginLeft: "69px" }} />
                <div className="categoryShow">
                    <button onClick={clearCategory}
                        className="categoryShow-btn">
                        ← Назад</button>
                    <div>
                        {/* <img src={catImg} alt={selectedCategoryMeta.name} style={{ width: 120, height: 120, borderRadius: 8 }} /> */}
                        <div className="categoryShow-inner">
                            <img src="" alt="" className="category-img2" />
                            <h2 className="category-title2">{selectedCategoryMeta.name}</h2>
                            <div className="category-price-row">

                                <p >{selectedCategoryMeta.min_price} - {selectedCategoryMeta.max_price} UZS</p>
                                <button className="product-btn">
                                    <SlBasket className="product-basket"
                                    /></button>
                            </div>
                        </div>
                    </div>
                    <div className="products">
                        {filteredProducts.length ? filteredProducts.map(item => (
                            <div key={item.id} className="products-row" onClick={() => handleProductShow(item)}>
                                <div className="box-row">
                                    <img src={item.images[0]?.image} alt={item.name} className="globus-img-size" />
                                    <div className="product-title">
                                        <p>{item.name}</p>
                                        <div className="product-price">
                                            <p>{item.price} <span>sum</span></p>
                                            <button className="product-btn"><SlBasket className="product-basket" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : <p>Товары в этой категории не найдены</p>}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="main">
            <div className="header">
                <img src={LogotipGlobus} alt="" className="logotip" />
                <input type="text"
                    className="globus-input"
                    onChange={handleChange} />
                <div className="ikons-1">
                    <IoSearchSharp className="ikons-search" />
                </div>
                <div className="btn-row">
                    <button
                        onClick={handleLoginClick}
                        className="globus-receiv">
                        Vxod <BiUser className="user-ikons" />
                    </button>
                    <button
                        onClick={handleAuthClick}
                        className="globus-basket">
                        Регистрация
                        <GiArchiveRegister className="basket-ikons" />
                    </button>
                </div>
            </div>
            <div className="product-slider-row">
                <div className="header-slider">
                    <Slider {...settings}>
                        {slickSlider.map((d) => (
                            <div className="slick-slider">
                                <div className="product-slider1">
                                    <img src={d.image} alt="" className="img-size" />
                                </div>
                            </div>
                        ))}
                    </Slider>
                </div>
                <div className="categories-main">
                    <h2 className="category-title">Все категоры</h2>
                    <div className="category-row">
                        {categories.map(cat => (
                            <div key={cat.id}
                                className="categories-inner"
                                onClick={() => handleCategoryShow(cat.id)}>
                                <p className="category-p">{cat.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {authShow && (
                <div>
                    <RegistrationForm  />
                </div>
            )}
            {loginShow && (
                <div>
                    <AuthoritaionLogin />
                </div>
            )}
            <hr style={{ width: "1333px", marginLeft: "70px", marginTop: "5px" }} />
            <div className="products">
                {filterProduct.map((item) => (
                    <div key={item.id}
                        className="products-row"
                        onClick={() => handleProductShow(item)}>
                        <div className="box-row">
                            <img
                                src={item.images[0]?.image}
                                alt="picture" className="globus-img-size" />
                            <div className="product-title">
                                <p>{item.name}</p>
                                <div className="product-price">
                                    <p>{item.price} <span>sum</span></p>
                                    <button className="product-btn">
                                        <SlBasket className="product-basket"
                                        /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// import React, { useEffect, useMemo, useState } from 'react';
// import Slider from 'react-slick';
// import { useDispatch, useSelector } from 'react-redux';
// import { CircularProgress } from '@mui/material';
// import { IoSearchSharp } from 'react-icons/io5';
// import { RegistrationForm } from '../Avtorizatsya/Registration';
// import { AuthoritaionLogin } from '../Avtorizatsya/Login';
// import { BiUser } from 'react-icons/bi';
// import { GiArchiveRegister } from 'react-icons/gi';
// import { SlBasket } from 'react-icons/sl';
// import { fetchProductsRequest, fetchCategoriesRequest } from '../Action'; // поправьте путь
// import {type RootState } from '../RootReducer/Rootreducer';
// import type { Product } from '../types'; // если есть

// export const ProductList: React.FC = () => {
//     const settings = { dots: true, infinite: true, speed: 1300, slidesToShow: 1, slidesToScroll: 1 };

//     const dispatch = useDispatch();
//     const { products, error, categories, loading } = useSelector((state: RootState) => state.app);

//     const [productFull, setProductFull] = useState<Product | null>(null);
//     const [searchProduct, setSearchProduct] = useState('');
//     const [authShow, setAuthshow] = useState(false);
//     const [loginShow, setLoginShow] = useState(false);

//     // NEW: выбранная категория (null = ничего не выбрано)
//     const [selectedCategory, setSelectedCategory] = useState<number | string | null>(null);

//     useEffect(() => {
//         dispatch(fetchProductsRequest());
//         dispatch(fetchCategoriesRequest());
//     }, [dispatch]);

//     const handleProductShow = (product: Product) => setProductFull(product);
//     const handleBack = () => setProductFull(null);
//     const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchProduct(event.target.value);
//     const handleAuthClick = () => setAuthshow(true);
//     const handleAuthClose = () => setAuthshow(false);
//     const handleLoginClick = () => setLoginShow(true);
//     const handleLoginClose = () => setLoginShow(false);

//     // NEW: открыть просмотр категории — передаём id (или имя) категории
//     const handleCategoryShow = (catIdOrName: number | string) => {
//         setSelectedCategory(catIdOrName);
//         // можно также прокрутить вверх: window.scrollTo(0, 0);
//     };

//     // сброс фильтра категории
//     const clearCategory = () => setSelectedCategory(null);

//     // --- вычисляем картинку для категории: либо у категории есть image, либо берём первую картинку товара в категории
//     const categoryImageMap = useMemo(() => {
//         const map = new Map<number | string, string | undefined>();
//         for (const cat of categories) {
//             // если у категории есть поле image, можно положить его здесь (в примере его нет)
//             map.set(cat.id, (cat as any).image);
//             map.set(cat.id, undefined);
//         }
//         // заполним из products (первое встречное изображение)
//         for (const p of products) {
//             const keyById = p.category ?? p.id ?? null; // попытка найти поле
//             if (keyById != null && !map.get(keyById)) {
//                 const img = p.images?.[0]?.image;
//                 if (img) map.set(keyById, img);
//             }
//             // также попытка сопоставить по имени (если product.category === category.name)
//             for (const cat of categories) {
//                 if (!map.get(cat.id) && String(p.category) === String(cat.name)) {
//                     const img = p.images?.[0]?.image;
//                     if (img) map.set(cat.id, img);
//                 }
//             }
//         }
//         return map;
//     }, [categories, products]);

//     // фильтрация: если выбрана категория — показываем только её продукты
//     const filteredProducts = useMemo(() => {
//         const q = searchProduct.trim().toLowerCase();
//         return products.filter(p => {
//             const matchesSearch = !q || p.name?.toLowerCase().includes(q);
//             let matchesCategory = true;
//             if (selectedCategory != null) {
//                 // пробуем несколько вариантов соответствия: id или name
//                 matchesCategory =
//                     String(p.category) === String(selectedCategory) ||
//                     String(p.id ?? p.id ) === String(selectedCategory) ||
//                     String(p.name ?? p.name) === String(selectedCategory);
//             }
//             return matchesSearch && matchesCategory;
//         });
//     }, [products, searchProduct, selectedCategory]);

//     // when a category is selected, find its meta (name, min/max)
//     const selectedCategoryMeta = useMemo(() => {
//         if (selectedCategory == null) return null;
//         // ищем по id или по имени
//         return categories.find(cat => String(cat.id) === String(selectedCategory) || String(cat.name) === String(selectedCategory)) ?? null;
//     }, [selectedCategory, categories]);

//     // Loading skeleton
//     if (loading && products.length === 0) return <div><CircularProgress /></div>;
//     if (loading && categories.length === 0) return <div><CircularProgress /></div>;

//     // Если открыт просмотр отдельного продукта
//     if (productFull) {
//         const likelyProducts = products.filter(p => String(p.category) === String(productFull.category) && p.id !== productFull.id);
//         return (
//             <div className="productShowModal">
//                 {/* header (оставлено ваше содержимое) */}
//                 <nav className="header"> ... ваш header ... </nav>
//                 <hr />
//                 <div className="productShow-row">
//                     <div className="productShow-item">
//                         <div className="product-wrapper">
//                             <button onClick={handleBack} className="productShow-btn">Назад</button>
//                             <div className="productShow-inner">
//                                 <img src={productFull.images[0]?.image} alt={productFull.name} className="product-modal-img" />
//                                 <div className="productShow-information">
//                                     <p className="productShow-title1">{productFull.name}</p>
//                                     <p className="productShow-ppp">Кратко о продукте</p>
//                                     <p className="productShow-pp">{productFull.description}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="likely-product">
//                     <h2 className="likely-title">Похожие продукты</h2>
//                     <div className="likely-list">
//                         {likelyProducts.length ? likelyProducts.map(p => (
//                             <div key={p.id} className="likely-item" onClick={() => handleProductShow(p)}>
//                                 <img src={p.images[0]?.image} alt={p.name} className="likely-img" />
//                                 <div className="likely-info">
//                                     <p className="likely-p">{p.name}</p>
//                                     <p className="likely-p2">Цена: {p.price} UZS</p>
//                                 </div>
//                             </div>
//                         )) : <p>Похожие товары не найдены</p>}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Если выбрана категория — показываем её блок сверху и список только её товаров
//     if (selectedCategoryMeta) {
//         const catImg = categoryImageMap.get(selectedCategoryMeta.image) ?? '/images/default.png';
//         return (
//             <div className="main">
//                 <div className="header"> ... ваш header ... </div>

//                 <div style={{ padding: 16 }}>
//                     <button onClick={clearCategory}>← Назад к категориям</button>

//                     <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
//                         {/* <img src={catImg} alt={selectedCategoryMeta.name} style={{ width: 120, height: 120, borderRadius: 8 }} /> */}
//                         <div>
//                             <h2>{selectedCategoryMeta.name}</h2>
//                             <p>Цена: {selectedCategoryMeta.min_price} — {selectedCategoryMeta.max_price} UZS</p>
//                         </div>
//                     </div>

//                     <hr style={{ margin: '16px 0' }} />

//                     <div className="products">
//                         {filteredProducts.length ? filteredProducts.map(item => (
//                             <div key={item.id} className="products-row" onClick={() => handleProductShow(item)}>
//                                 <div className="box-row">
//                                     <img src={item.images[0]?.image} alt={item.name} className="globus-img-size" />
//                                     <div className="product-title">
//                                         <p>{item.name}</p>
//                                         <div className="product-price">
//                                             <p>{item.price} <span>sum</span></p>
//                                             <button className="product-btn"><SlBasket className="product-basket" /></button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )) : <p>Товары в этой категории не найдены</p>}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // MAIN view: категории + все продукты
//     return (
//         <div className="main">
//             <div className="header"> ... ваш header ... </div>

//             <div className="product-slider-row">
//                 <div className="header-slider"><Slider {...settings}>{/* ... */}</Slider></div>

//                 <div className="categories-main">
//                     <h2 className="category-title">Все категории</h2>
//                     <div className="category-row" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
//                         {  categories.map(cat => {
//                             // const catImg = categoryImageMap.get(cat.id) ?? '/images/default.jpg';
//                             return (
//                                 <div key={cat.id} className="categories-inner" onClick={() => handleCategoryShow(cat.id)} style={{ cursor: 'pointer' }}>
//                                     {/* <img src={catImg} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 8 }} /> */}
//                                     <p className="category-p">{cat.name}</p>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             </div>

//             {authShow && <RegistrationForm onClose={handleAuthClose} />}
//             {loginShow && <AuthoritaionLogin onClose={handleLoginClose} />}

//             <hr style={{ width: '100%', marginTop: 20 }} />

//             <div className="products">
//                 {filteredProducts.map(item => (
//                     <div key={item.id} className="products-row" onClick={() => handleProductShow(item)}>
//                         <div className="box-row">
//                             <img src={item.images[0]?.image} alt={item.name} className="globus-img-size" />
//                             <div className="product-title">
//                                 <p>{item.name}</p>
//                                 <div className="product-price">
//                                     <p>{item.price} <span>sum</span></p>
//                                     <button className="product-btn"><SlBasket className="product-basket" /></button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//                 {filteredProducts.length === 0 && <p style={{ padding: 12 }}>Товары не найдены</p>}
//             </div>
//         </div>
//     );
// };


