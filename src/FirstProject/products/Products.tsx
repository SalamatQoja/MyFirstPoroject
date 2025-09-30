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
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router";
import { fetchProducts } from "../productService.ts/productService";
import { type Category } from "../types";

export const ProductList: React.FC = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 1300,
        slidesToShow: 1,
        slidesToScroll: 1,

    };

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { products = [], error, categories = [], loading } = useSelector((state: RootState) => state.app);
    const [productFull, setProductFull] = useState<Product | null>(null);
    const [searchProduct, setSearchProduct] = useState("");
    const [items, setItems] = useState<Product[]>([]);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
    const [proloading, setproLoading] = useState(false);
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        dispatch(fetchProductsRequest());
        dispatch(fetchCategoriesRequest());
    }, [dispatch]);

    // -- вычисляем картинку для категории: либо у категории есть image, либо берём первую картинку товара в категории
    const categoryImageMap = useMemo(() => {
        const map = new Map<number | string, string | undefined>();
        for (const cat of categories) {
            // если у категории есть поле image, можно положить его здесь (в примере его нет)
            map.set(cat.id, (cat as any).image);
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
        const q = (searchProduct ?? '').trim().toLowerCase();
        return (products ?? []).filter((p: Product) => {
            const matchesSearch = !q || (p.name ?? '').toString().toLowerCase().includes(q);
            let matchesCategory = true;
            if (selectedCategory != null) {
                // пробуем несколько вариантов соответствия: id или name
                matchesCategory =
                    String(p.category) === String(selectedCategory) ||
                    String(p.id) === String(selectedCategory) ||
                    String(p.name ?? '') === String(selectedCategory);
            }
            return matchesSearch && matchesCategory;
        });
    }, [products, searchProduct, selectedCategory]);

    // when a category is selected, find its meta (name, min/max)
    // const selectedCategoryMeta = useMemo(() => {
    //     if (selectedCategory == null) return null;
    //     // ищем по id или по имени
    //     return categories.find(cat => String(cat.id) === String(selectedCategory) || String(cat.name) === String(selectedCategory) || String(cat.max_price) === String(selectedCategory)) ?? null;
    // }, [selectedCategory, categories]);

    const selectedCategoryMeta = useMemo<Category | null>(() => {
        if (selectedCategory == null) return null;
        return (
            (categories ?? []).find(
                (cat: Category) =>
                    String(cat.id) === String(selectedCategory) ||
                    String(cat.name) === String(selectedCategory) ||
                    String(cat.max_price ?? '') === String(selectedCategory)
            ) ?? null
        );
    }, [selectedCategory, categories])

    useEffect(() => {
        loadPage({ limit: 20, offset: 0 });
    }, []);

    const handleCategoryShow = (catIdOrName: number | string) => {
        setSelectedCategory(catIdOrName);
        // можно также прокрутить вверх: window.scrollTo(0, 0);
    };

    const handleProductShow = (product: Product) => {
        setProductFull(product);
    };

    const handleBack = () => {
        setProductFull(null);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchProduct(event.target.value);
    };

    const filterProduct = items.filter((product) => {
        const productSearch = product.name.toLowerCase().includes(searchProduct.toLowerCase());
        return productSearch;
    });

    //сброс фильтра категории
    const clearCategory = () => setSelectedCategory(null);

    const loadPage = async (opts: { url?: string; limit?: number; offset?: number }) => {
        try {
            setproLoading(true);
            const resp = await fetchProducts({ url: opts.url, limit: opts.limit, offset: opts.offset });
            // заменить список (или при необходимости — append)
            setItems(resp.data.items);
            setNextUrl(resp.data.next);
            setPrevUrl(resp.data.previous);
            setTotal(resp.data.total_records);
        } finally {
            setproLoading(false);
        }
    };

    // обработчики кнопок
    const onNext = () => {
        if (nextUrl) loadPage({ url: nextUrl });
    };
    const onPrev = () => {
        if (prevUrl) loadPage({ url: prevUrl });
    };

    // Loading skeleton
    if (loading && products.length === 0) return <div><CircularProgress /></div>;
    if (loading && categories.length === 0) return <div><CircularProgress /></div>;


    if (productFull) {
        const likelyProducts = products.filter((p) => String(p.category) === String(productFull.category) && p.id !== productFull.id);
        // const  categoriess = categories.filter((p) => String(p.image) ===  String(productFull.images) && p.name !== productFull.name );
        return (
            <div className="productShowModal">
                <div className="main-top"></div>
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
                <hr style={{ width: '1359px', marginTop: "20px" }} />
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
        // const catImg = categoryImageMap.get(String(selectedCategoryMeta.id)) ?? '/images/default.png';
        return (
            <div className="main">
                <div className="main-top"></div>
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
                            onClick={() => navigate('/login')}
                            className="globus-receiv">
                            Vxod <BiUser className="user-ikons" />
                        </button>
                        <button
                            onClick={() => navigate('/register')}
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
                            {(categories ?? []).map((cat: Category) => (
                                <div key={cat.id}
                                    className="categories-inner"
                                    onClick={() => handleCategoryShow(cat.id)}
                                    role="button"
                                    tabIndex={0}>
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
                            <img src={selectedCategoryMeta.images ?? ''} alt={selectedCategoryMeta.name} className="category-img2" />
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
                        {(filteredProducts.length > 0) ? (filteredProducts.map((item: Product) => (
                            <div key={item.id} className="products-row"
                                onClick={() => handleProductShow(item)}>
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
                        ))
                        ) : <p>Товары в этой категории не найдены</p>}
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="main">
            <div className="main-top"></div>
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
                        onClick={() => navigate('/login')}
                        className="globus-receiv">
                        Vxod <BiUser className="user-ikons" />
                    </button>
                    <button
                        onClick={() => navigate('/register')}
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
            <hr style={{ width: "1333px", marginLeft: "70px", marginTop: "5px" }} />
            <div className="products">
                {proloading && <div>Загрузка...</div>}
                {filterProduct.map(it => (
                    <div key={it.id}
                        className="products-row"
                        onClick={() => handleProductShow(it)}>
                        <div className="box-row">
                            {/* <strong>{it.name}</strong> — {it.price} — amount: {it.amount} */}
                            <img src={it.images[0]?.image} alt="" className="globus-img-size" />
                            <div className="product-title">
                                <p>{it.name}</p>
                                <div className="product-price">
                                    <p>{it.price} <span>sum</span></p>
                                    <button className="product-btn">
                                        <SlBasket className="product-basket"
                                        /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="product-next-prev">
                <p>Всего:{total}</p>
                <button onClick={onPrev} disabled={!prevUrl || loading} className="product-btn3">Prev</button>
                <button onClick={onNext} disabled={!nextUrl || loading} className="product-btn3">Next</button>
            </div>
        </div>
    );
};
