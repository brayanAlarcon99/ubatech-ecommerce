module.exports = [
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/lib/firebase.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "app",
    ()=>app,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getDb",
    ()=>getDb
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [instrumentation] (ecmascript)");
;
;
const firebaseConfig = {
    apiKey: "AIzaSyB6Yczsu4sF8cjD4H1Jz2KU4TO9f0biCoQ",
    authDomain: "ubatech-a8650.firebaseapp.com",
    projectId: "ubatech-a8650",
    storageBucket: "ubatech-a8650.firebasestorage.app",
    messagingSenderId: "609393850830",
    appId: "1:609393850830:web:567d90bdc33dd65fe2d39f",
    measurementId: "G-G2DW96480G"
};
let app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApp"])();
let db = null;
try {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApps"])().length === 0) {
        app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig);
    } else {
        app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApp"])();
    }
    const initFirestore = ()=>{
        try {
            db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["getFirestore"])(app);
            console.log("[v0] Firestore initialized successfully");
            return db;
        } catch (error) {
            console.warn("[v0] Firestore not ready yet, will retry on access");
            return null;
        }
    };
    db = initFirestore();
} catch (error) {
    console.error("[v0] Firebase initialization error:", error);
}
const getDb = ()=>{
    if (!db) {
        try {
            db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["getFirestore"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__["getApp"])());
        } catch (error) {
            console.error("[v0] Failed to get Firestore instance:", error);
            throw new Error("Firestore is not available. Please ensure Firestore Database is created in Firebase Console.");
        }
    }
    return db;
};
;
const __TURBOPACK__default__export__ = db;
}),
"[project]/lib/init-demo-data.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "initializeDemoData",
    ()=>initializeDemoData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [instrumentation] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [instrumentation] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [instrumentation] (ecmascript)");
;
;
async function initializeDemoData() {
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["getDb"])();
        console.log("🔄 Inicializando datos de demostración...");
        // 1. Crear Categorías
        console.log("📁 Creando categorías...");
        const categoriesData = [
            {
                id: "celulares",
                name: "Celulares"
            },
            {
                id: "electronica",
                name: "Electrónica"
            },
            {
                id: "accesorios",
                name: "Accesorios"
            }
        ];
        const categoriesMap = new Map();
        for (const catData of categoriesData){
            const categoryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["doc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["collection"])(db, "categories"), catData.id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["setDoc"])(categoryRef, {
                name: catData.name,
                createdAt: new Date()
            });
            categoriesMap.set(catData.id, catData.name);
            console.log(`✅ Categoría creada: ${catData.name}`);
        }
        // 2. Crear Subcategorías
        console.log("📂 Creando subcategorías...");
        const subcategoriesData = [
            {
                name: "Samsung",
                categoryId: "celulares"
            },
            {
                name: "Redmi",
                categoryId: "celulares"
            },
            {
                name: "iPhone",
                categoryId: "celulares"
            },
            {
                name: "Laptops",
                categoryId: "electrónica"
            },
            {
                name: "Tablets",
                categoryId: "electrónica"
            },
            {
                name: "Fundas",
                categoryId: "accesorios"
            },
            {
                name: "Protectores",
                categoryId: "accesorios"
            }
        ];
        for (const subData of subcategoriesData){
            const subcategoryRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["doc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["collection"])(db, "subcategories"), subData.name.toLowerCase().replace(" ", "_"));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["setDoc"])(subcategoryRef, {
                name: subData.name,
                categoryId: subData.categoryId,
                createdAt: new Date()
            });
            console.log(`✅ Subcategoría creada: ${subData.name}`);
        }
        // 3. Crear Productos
        console.log("📦 Creando productos...");
        const productsData = [
            {
                name: "NOTE14PRO+",
                description: "Celular de última generación Redmi",
                price: 1560000,
                stock: 1,
                category: "Celulares",
                subcategory: "redmi",
                image: "https://via.placeholder.com/300x300?text=NOTE14PRO"
            },
            {
                name: "Galaxy A13",
                description: "Celular Samsung económico",
                price: 299999,
                stock: 50,
                category: "Celulares",
                subcategory: "samsung",
                image: "https://via.placeholder.com/300x300?text=GalaxyA13"
            },
            {
                name: "Galaxy S23",
                description: "Celular Samsung premium",
                price: 1099999,
                stock: 12,
                category: "Celulares",
                subcategory: "samsung",
                image: "https://via.placeholder.com/300x300?text=GalaxyS23"
            },
            {
                name: "iPhone 15",
                description: "iPhone última generación",
                price: 1499999,
                stock: 8,
                category: "Celulares",
                subcategory: "iphone",
                image: "https://via.placeholder.com/300x300?text=iPhone15"
            },
            {
                name: "Note 13",
                description: "Celular Redmi gama media",
                price: 899999,
                stock: 25,
                category: "Celulares",
                subcategory: "redmi",
                image: "https://via.placeholder.com/300x300?text=Note13"
            },
            {
                name: "Laptop Dell",
                description: "Laptop Dell última generación",
                price: 2499999,
                stock: 5,
                category: "Electrónica",
                subcategory: "laptops",
                image: "https://via.placeholder.com/300x300?text=DellLaptop"
            },
            {
                name: "Funda Celular",
                description: "Funda protectora para celular",
                price: 49999,
                stock: 100,
                category: "Accesorios",
                subcategory: "fundas",
                image: "https://via.placeholder.com/300x300?text=Funda"
            }
        ];
        for (const prodData of productsData){
            const productRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["doc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["collection"])(db, "products"), prodData.name.toLowerCase().replace(/\\s+/g, "_"));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$instrumentation$5d$__$28$ecmascript$29$__["setDoc"])(productRef, {
                name: prodData.name,
                description: prodData.description,
                price: prodData.price,
                stock: prodData.stock,
                category: prodData.category,
                subcategory: prodData.subcategory,
                image: prodData.image,
                createdAt: new Date()
            });
            console.log(`✅ Producto creado: ${prodData.name}`);
        }
        console.log("✅ ¡Datos inicializados correctamente!");
        return true;
    } catch (error) {
        console.error("❌ Error inicializando datos:", error);
        return false;
    }
}
}),
"[project]/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "register",
    ()=>register
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$init$2d$demo$2d$data$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/init-demo-data.ts [instrumentation] (ecmascript)");
;
let initialized = false;
async function register() {
    if (!initialized && ("TURBOPACK compile-time value", "development") === "development") {
        try {
            console.log("🔄 Verificando datos de demostración...");
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$init$2d$demo$2d$data$2e$ts__$5b$instrumentation$5d$__$28$ecmascript$29$__["initializeDemoData"])();
            if (result) {
                console.log("✅ Datos inicializados correctamente en Firestore");
                initialized = true;
            }
        } catch (error) {
            console.error("⚠️ Error al inicializar datos:", error);
        }
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3fb4f3ef._.js.map