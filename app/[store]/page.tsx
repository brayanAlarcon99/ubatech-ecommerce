'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Header from '@/components/header';
import ProductCard from '@/components/product-card';
import Hero from '@/components/hero';
import Footer from '@/components/footer';
import type { Product, Subcategory } from '@/types';
import { getDb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getSubcategoriesByCategory } from '@/lib/subcategories';
import { normalizeProducts } from '@/lib/normalize-products';
import { getPublicSiteStatus } from '@/lib/public-site-status';
import { normalizeProductPrice } from '@/lib/format-price';

export default function StorePage() {
  const params = useParams();
  const store = params.store as string;
  
  // Determinar color basado en la tienda
  const getPrimaryColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#a00009';
    return 'var(--primary-dark)';
  };
  
  const getTitleColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#000000';
    return 'var(--primary-dark)';
  };

  const getCategoryButtonColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#a00009';
    return 'var(--primary-dark)';
  };

  const getCategoryNameColor = (storeSlug: string) => {
    if (storeSlug === 'djcelutecnico') return '#a00009';
    return 'var(--primary-dark)';
  };
  
  const primaryColor = getPrimaryColor(store);
  const titleColor = getTitleColor(store);
  const categoryButtonColor = getCategoryButtonColor(store);
  const categoryNameColor = getCategoryNameColor(store);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showHero, setShowHero] = useState(true);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Map<string, Subcategory[]>>(new Map());
  const [categoriesMap, setCategoriesMap] = useState<Map<string, string>>(new Map());
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPublicStatus();
  }, [router]);

  async function checkPublicStatus() {
    try {
      const status = await getPublicSiteStatus();

      if (!status.isPublic) {
        router.push('/maintenance');
        return;
      }

      setCheckingStatus(false);
      loadProducts();
    } catch (error) {
      console.error('Error checking public status:', error);
      setCheckingStatus(false);
      loadProducts();
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowHero(window.scrollY < 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (category === 'all') {
      setSubcategories([]);
      setSubcategory('all');
    } else {
      loadSubcategoriesForCategory(category);
    }
  }, [category, subcategoriesMap]);

  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      const db = getDb();

      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      const productsWithNormalizedPrices = productsData.map(normalizeProductPrice);

      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      const subMap = new Map<string, Subcategory[]>();
      const catMap = new Map<string, string>();

      for (const catDoc of categoriesSnapshot.docs) {
        const categoryId = catDoc.id;
        const categoryName = catDoc.data().name;
        catMap.set(categoryId, categoryName);
        const subs = await getSubcategoriesByCategory(categoryId);
        subMap.set(categoryId, subs);
      }

      const normalizedProducts = normalizeProducts(productsWithNormalizedPrices, catMap);

      setProducts(normalizedProducts);
      setSubcategoriesMap(subMap);
      setCategoriesMap(catMap);
    } catch (error) {
      console.error('[v0] Error loading products:', error);
      setError('Error al cargar productos. Por favor, verifica tu conexión a Firebase.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubcategoriesForCategory(categoryId: string) {
    try {
      const subs = subcategoriesMap.get(categoryId) || [];
      setSubcategories(subs);
      setSubcategory('all');
    } catch (error) {
      console.error('[v0] Error loading subcategories:', error);
      setSubcategories([]);
    }
  }

  let filteredProducts = products;

  if (category !== 'all') {
    filteredProducts = filteredProducts.filter((p) => p.category === category);
  }

  if (subcategory !== 'all') {
    filteredProducts = filteredProducts.filter((p) => p.subcategory === subcategory);
  }

  if (searchTerm !== '') {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoriesMap.get(p.category)?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  const categories = Array.from(categoriesMap.entries())
    .map(([id, name]) => ({ id, name }))
    .filter((cat) => {
      return products.some((p) => p.category === cat.id);
    });

  return (
    <>
      {checkingStatus ? (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando tienda...</p>
          </div>
        </div>
      ) : (
        <>
          <Header />

          {showHero && <Hero storeId={store} />}

          <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-3xl font-bold" style={{ color: titleColor }}>
                  Nuestros Productos
                </h2>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder-gray-500"
                />
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-black">Categorías</p>
                  {subcategories.length > 0 && (
                    <button
                      onClick={() => setMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded font-medium text-sm transition-colors"
                    >
                      <Menu size={18} />
                      Subcategorías
                    </button>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setCategory('all')}
                    className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                      category === 'all' ? 'text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300 text-black'
                    }`}
                    style={category === 'all' ? { backgroundColor: categoryButtonColor } : {}}
                  >
                    Todas
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                        category === cat.id ? 'text-white shadow-lg' : 'bg-gray-200 hover:bg-gray-300 text-black'
                      }`}
                      style={category === cat.id ? { backgroundColor: categoryButtonColor } : {}}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-0 min-h-screen">
            {/* OVERLAY - Solo en móvil cuando está abierto */}
            {mobileFiltersOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                onClick={() => setMobileFiltersOpen(false)}
              />
            )}

            {/* SIDEBAR FILTROS - Drawer en móvil, sidebar en desktop */}
            {subcategories.length > 0 && (
              <aside
                className={`
                  fixed lg:sticky lg:relative
                  ${mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                  left-0 top-0
                  w-64 h-screen lg:h-auto
                  bg-gradient-to-b from-gray-50 to-gray-100
                  border-b lg:border-b-0 lg:border-r border-gray-200
                  overflow-y-auto
                  z-50
                  transition-transform duration-300 ease-in-out
                  lg:top-[104px] lg:max-h-[calc(100vh-104px)]
                  lg:w-56
                `}
              >
                {/* Header del Drawer - Solo móvil */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-300 sticky top-0 bg-white">
                  <h3 className="font-bold text-gray-900">Subcategorías</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X size={24} className="text-gray-700" />
                  </button>
                </div>

                {/* Contenido Filtros */}
                <div className="p-4">
                  <h3 className="hidden lg:block text-sm font-bold uppercase tracking-wide mb-4" style={{ color: categoryNameColor }}>
                    Subcategorías
                  </h3>
                  
                  <nav className="space-y-1">
                    {/* Ver todas */}
                    <button
                      onClick={() => {
                        setSubcategory('all');
                        setMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        subcategory === 'all'
                          ? 'text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      style={subcategory === 'all' ? { backgroundColor: 'var(--primary-dark)' } : {}}
                    >
                      Ver todas
                    </button>

                    {/* Listado de marcas */}
                    {subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setSubcategory(sub.id);
                          setMobileFiltersOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          subcategory === sub.id
                            ? 'text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                        style={subcategory === sub.id ? { backgroundColor: 'var(--primary-dark)' } : {}}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>
            )}

            <main className={`flex-1 px-4 py-12 transition-all duration-300 w-full ${subcategories.length > 0 ? '' : 'lg:max-w-7xl lg:mx-auto'}`}>
              {error && (
                <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div
                    className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"
                    style={{ borderTopColor: primaryColor }}
                  />
                </div>
              ) : filteredProducts.length > 0 ? (
                (() => {
                  const groupedByCategory = new Map<string, Product[]>();

                  filteredProducts.forEach((product) => {
                    const categoryName = categoriesMap.get(product.category) || 'Sin categoría';
                    if (!groupedByCategory.has(categoryName)) {
                      groupedByCategory.set(categoryName, []);
                    }
                    groupedByCategory.get(categoryName)!.push(product);
                  });

                  const categorySections = Array.from(groupedByCategory.entries())
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([categoryName, products]) => [
                      categoryName,
                      [...products].sort((a, b) => (a.price || 0) - (b.price || 0)),
                    ]) as [string, Product[]][];

                  return (
                    <div className="space-y-8">
                      {categorySections.map(([categoryName, categoryProducts], index) => (
                        <div key={categoryName}>
                          <h3 className="text-xl font-bold mb-4 pb-2" style={{ color: categoryNameColor }}>
                            {categoryName}
                          </h3>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                            {categoryProducts.map((product) => (
                              <ProductCard key={product.id} product={product} />
                            ))}
                          </div>

                          {index < categorySections.length - 1 && (
                            <div className="my-8 border-t-2" style={{ borderColor: '#d4d4d4' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">
                  No hay productos en esta categoría
                </p>
              )}
            </main>
          </div>

          <Footer storeId={store} />
        </>
      )}
    </>
  );
}
