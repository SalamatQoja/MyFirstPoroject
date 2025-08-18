import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategoriesRequest, fetchProductsRequest } from "../Action";
import type { RootState } from "../store/store";
import "../Products.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick"
import slickSlider from "../Slider";
import LogotipGlobus from "../img/logotipGlobus.png";
import { SlBasket } from "react-icons/sl";
import { IoSearchSharp } from "react-icons/io5";
import { GiCheckMark } from "react-icons/gi";
import { BiUser } from "react-icons/bi";
import { GiArchiveRegister } from "react-icons/gi";
import { SlBasketLoaded } from "react-icons/sl";
import { ImExit } from "react-icons/im";
import type { Product } from "../types";
import { RegistrationForm } from "../Avtorizatsya/Registration";
import { AuthoritaionLogin } from "../Avtorizatsya/Login";
import { useNavigate } from "react-router";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { addItemStart } from "../Cart/CartSlice";
import CircularProgress from "@mui/material/CircularProgress";
import { GoListOrdered } from "react-icons/go";

export const ProductListRegistration: React.FC = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 1300,
        slidesToShow: 1,
        slidesToScroll: 1,

    };

    // const CategorySlidersettings: Settings = {
    //     dots: true,
    //     infinite: true,
    //     speed: 100,
    //     rows: 1,
    //     slidesToShow: 9,
    //     slidesToScroll: 1,
    //     centerMode: true,
    //     centerPadding: "60px",
    // };

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { products, categories, error, loading } = useSelector((state: RootState) => state.app);
    const [productFull, setProductFull] = useState<Product | null>(null);
    const [searchProduct, setSearchProduct] = useState("");
    const [authShow, setAuthshow] = useState(false);
    const [loginShow, setLoginShow] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);


    const handleProductShow = (product: Product) => {
        setProductFull(product);
        // setQuantity(1);
    };

    const handleBack = () => {
        setProductFull(null);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchProduct(event.target.value);
    };

    const handleAuthClose = () => {
        setAuthshow(false);
    };


    const handleAuthClick = () => {
        setAuthshow(true);
    };

    const handleLoginClose = () => {
        setLoginShow(false);
    };


    const handleLoginClick = () => {
        setLoginShow(true);
    };

    useEffect(() => {
        dispatch(fetchProductsRequest());
        dispatch(fetchCategoriesRequest());
    }, [dispatch]);

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


    if (loading && products.length === 0) return <div><CircularProgress /></div>;
    if (loading && categories.length === 0) return <div><CircularProgress /></div>;


    const filterProduct = products.filter((product) => {
        const productSearch = product.name.toLowerCase().includes(searchProduct.toLowerCase());
        return productSearch;
    });

    if (productFull) {
        const likelyProducts = products.filter((p) => p.category === productFull.category && p.id !== productFull.id);
        return (
            <div className="productShowModal">
                <nav className="header">
                    <img src={LogotipGlobus} alt="" className="logotip" />
                    <input type="text"
                        className="globus-input"
                        onChange={handleChange} />
                    <IoSearchSharp className="ikons-search" />
                    <div className="btn-row2" >
                        <button className="pr-register-exit"
                            onClick={() => navigate("/")}>
                            Выйты
                            < ImExit className="pr-register-exit-btn" />
                        </button>
                        <button type="submit" className="pr-register-myorders"
                            onClick={() => navigate('/my_orders')}>
                            Мой заказ
                            </button>
                        <button type="submit" className="pr-register-basket-btn1"
                            onClick={() => navigate("/cart")}>
                            Korzina
                            <SlBasketLoaded className="pr-registerbasket2" />
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="globus-receiv">
                            Vxod <BiUser className="user-ikons" />
                        </button>
                        <button
                            onClick={() => navigate("/register")}
                            className="globus-basket">
                            Регистрация
                            <GiArchiveRegister className="basket-ikons" />
                        </button>
                    </div>
                </nav>

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
                    <div className="productShow-price">
                        <div className="price">
                            <div className="price-code-row">
                                <p className="price-p">{productFull.price} Sum</p>
                                <GiCheckMark className="amount-mark" />
                                <p className="amount-p">Kolichestvo {productFull.amount}</p>
                                <p className="code-p">Kod: {productFull.code}</p>

                            </div>
                            <div>
                                <div className="globus-logotip2"></div>
                            </div>
                            <div className="productShow-basket-btn">
                                <button className="price-basket"
                                    onClick={() => {
                                        dispatch(addItemStart({ product: productFull.id, quantity }));
                                        navigate("/cart");
                                    }}>
                                    <SlBasketLoaded className="productShow-price-ikons" />
                                    Добавить Корзина</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="likely-product">
                    <h2 className="likely-title">Похожие продукты</h2>
                    <div className="likely-list">
                        {likelyProducts.length > 0 ? (
                            likelyProducts.map((p) => (
                                <div key={p.id} className="likely-item"
                                    onClick={() => handleProductShow(p)}>
                                    <img
                                        src={p.images[0]?.image}
                                        alt={p.name}
                                        className="likely-img"
                                    />
                                    <div className="likely-info">
                                        <p className="likely-p">{p.name}</p>
                                        <p className="likely-p2">Tsena: {p.price.toLocaleString()} UZS</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Poxojiye tovari ne naydeno </p>
                        )}
                    </div>
                </div>
            </div>
        );
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
                    <div className="btn-row2" >
//                     <button className="pr-register-exit"
                            onClick={() => navigate("/product")}>
                            Выйты
                            < ImExit className="pr-register-exit-btn" />
                        </button>
                        <button type="submit" className="pr-register-myorders"
                            onClick={() => navigate('/my_orders')}>
                            Мой заказ
                            <GoListOrdered /></button>
                        <button type="submit" className="pr-register-basket-btn1"
                            onClick={() => navigate("/cart")}>
                            Korzina
                            <SlBasketLoaded className="pr-registerbasket2" />
                        </button>
                        <button
                            onClick={() => navigate("/login")}
                            className="globus-receiv">
                            Vxod <BiUser className="user-ikons" />
                        </button>
                        <button
                            onClick={() => navigate("/register")}
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
                <div className="btn-row2" >
                    <button className="pr-register-exit"
                        onClick={() => navigate("/product")}>
                        Выйты
                        < ImExit className="pr-register-exit-btn" />
                    </button>
                    <button type="submit" className="pr-register-myorders"
                        onClick={() => navigate('/my_orders')}>
                        Мой заказ</button>
                    <button type="submit" className="pr-register-basket-btn1"
                        onClick={() => navigate("/cart")}>
                        Korzina
                        <SlBasketLoaded className="pr-registerbasket2" />
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        className="globus-receiv">
                        Vxod <BiUser className="user-ikons" />
                    </button>
                    <button
                        onClick={() => navigate("/register")}
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
                    <RegistrationForm />
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

//     return (
//         <div className="main">
//             <div className="main-row"></div>
//             <div className="header">
//                 <img src={LogotipGlobus} alt="" className="logotip" />
//                 <input type="text"
//                     className="globus-input"
//                     onChange={handleChange} />
//                 <div className="ikons-1">
//                     <IoSearchSharp className="ikons-search" />
//                 </div>
//                 <div className="btn-row2" >
//                     <button className="pr-register-exit"
//                         onClick={() => navigate("/product")}>
//                         Выйты
//                         < ImExit className="pr-register-exit-btn" />
//                     </button>
//                     <button type="submit" className="pr-register-basket-btn1"
//                         onClick={() => navigate("/cart")}>
//                         Korzina
//                         <SlBasketLoaded className="pr-registerbasket2" />
//                     </button>
//                     <button
//                         onClick={() => navigate("/login")}
//                         className="globus-receiv">
//                         Vxod <BiUser className="user-ikons" />
//                     </button>
//                     <button
//                         onClick={() => navigate("/register")}
//                         className="globus-basket">
//                         Регистрация
//                         <GiArchiveRegister className="basket-ikons" />
//                     </button>
//                 </div>
//             </div>
//             <div className="header-slider">
//                 <Slider {...settings} >
//                     {slickSlider.map((d) => (
//                         <div className="slick-slider">
//                             <li>
//                                 <img src={d.image} alt="" className="img-size" />
//                             </li>
//                         </div>
//                     ))}
//                 </Slider>
//             </div>
//             <div className="categories-main">
//                 <h2 className="category-title">Vse kategory</h2>
//                 <div className="category-row">
//                     {/* <Slider {...CategorySlidersettings} className="category-slider">
//                         {categories.map(cat => (
//                             <div key={cat.id}
//                                 className="categories-inner">
//                                 <p className="category-p">{cat.name}</p>
//                             </div>
//                         ))}
//                     </Slider> */}
//                 </div>
//             </div>
//             {authShow && (
//                 <div>
//                     <RegistrationForm onClose={handleAuthClose} />
//                 </div>
//             )}
//             {loginShow && (
//                 <div>
//                     <AuthoritaionLogin onClose={handleLoginClose} />
//                 </div>
//             )}
//             <div className="products">
//                 {filterProduct.map((item) => (
//                     <div key={item.id}
//                         className="products-row"
//                         onClick={() => handleProductShow(item)}>
//                         <div className="box-row">
//                             <img
//                                 src={item.images[0]?.image}
//                                 alt="picture" className="globus-img-size" />
//                             <div className="product-title">
//                                 <p>{item.name}</p>
//                                 <div className="product-price">
//                                     <p>{item.price} <span>sum</span></p>
//                                     <button className="product-btn">
//                                         <SlBasket className="product-basket"
//                                         /></button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

