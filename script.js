// Configuración de colores y fuente para Tailwind
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        gold: '#D4AF37',
                        goldDark: '#a8842e',
                        navy: '#0a1128',
                        navyDark: '#05070d',
                        navyLight: '#131b30',
                    },
                    fontFamily: {
                        poppins: ['Poppins', 'sans-serif'],
                    }
                }
            }
        }


// Lógica del catálogo
        // Initial Mock Data (Fallback if LocalStorage is empty, approx 115 references simulation structure ready to be extended)
        const defaultProducts = [
            {
                id: 1,
                name: "Llavero Kawaii Osito Pastel",
                category: "Accesorios",
                price: 18000,
                description: "Llavero acrílico de alta durabilidad con diseño de osito tierno con gorro de cono de helado. Ideal para decorar tu bolso o llaves con un toque súper juvenil.",
                images: [
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Osito+Principal",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Osito+Detalle+1",
                    "https://placehold.co/600x600/0d1220/D4AF37?text=Osito+Detalle+2",
                    "https://placehold.co/600x600/13203a/D4AF37?text=Osito+Empaque"
                ]
            },
            {
                id: 2,
                name: "Agenda Pastel Estrellita Mágica",
                category: "Papelería",
                price: 35000,
                description: "Agenda argollada con hojas punteadas de 100g. Tapa dura con laminado brillante holográfico y tonos rosa y amarillo pastel. Perfecta para bullet journaling.",
                images: [
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Agenda+Principal",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Agenda+Interior",
                    "https://placehold.co/600x600/0d1220/D4AF37?text=Agenda+Stickers"
                ]
            },
            {
                id: 3,
                name: "Taza Cerámica Gato Dormilón",
                category: "Hogar & Cocina",
                price: 42000,
                description: "Taza de cerámica artesanal en tonos azul pastel con orejitas en relieve y detalles dorados. Capacidad de 350ml, apta para microondas.",
                images: [
                    "https://placehold.co/600x600/0d1220/D4AF37?text=Taza+Gato+Principal",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Taza+Vista+Lateral",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Taza+Empaque+Regalo"
                ]
            },
            {
                id: 4,
                name: "Set de Marcadores Pastel x6",
                category: "Papelería",
                price: 24000,
                description: "Marcadores tipo resaltador con tonos suaves pasteles (rosa, amarillo, azul, lila, verde menta y durazno). Punta cincel para subrayado perfecto.",
                images: [
                    "https://placehold.co/600x600/13203a/D4AF37?text=Marcadores+Set",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Swatches+Colores"
                ]
            },
            {
                id: 5,
                name: "Estuche Holográfico Estelar",
                category: "Accesorios",
                price: 29000,
                description: "Cartuchera o cosmetiquera transparente con efecto tornasol holográfico y cierre reforzado. Resistente al agua y muy espaciosa.",
                images: [
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Estuche+Abierto",
                    "https://placehold.co/600x600/0d1220/D4AF37?text=Estuche+Cerrado",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Estuche+Interior"
                ]
            },
            {
                id: 6,
                name: "Vela Aromática Vainilla Pastel",
                category: "Hogar & Cocina",
                price: 32000,
                description: "Vela de cera de soya natural en frasco de vidrio decorado con cintas rosa pastel. Aroma dulce y relajante a vainilla y caramelo.",
                images: [
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Vela+Vainilla",
                    "https://placehold.co/600x600/1a1a1a/D4AF37?text=Vela+Encendida"
                ]
            }
        ];

        // State variables
        let products = [];
        let currentCategory = 'todos';
        let searchQuery = '';
        let editingProductId = null; // null = modo "agregar"; con id = modo "editar"
        let existingImages = [null, null, null, null]; // fotos ya guardadas del producto que se está editando

        // --- CARRITO DE COMPRAS ---
        const WHATSAPP_NUMBER = "573005979420"; // 57 = Colombia + el número del footer
        let cart = loadCart(); // [{ id, name, price, image, qty }]
        let deepLinkHandled = false; // evita reabrir el modal de "?producto=" más de una vez

        const DEPARTAMENTOS_CO = [
            "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar", "Boyacá",
            "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba",
            "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta",
            "Nariño", "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
            "San Andrés y Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca",
            "Vaupés", "Vichada"
        ];

        // Initialize Application: escucha el catálogo en Firestore EN VIVO.
        // Cualquier producto que agregues o borres desde el panel se refleja
        // al instante para todas las personas que tengan la página abierta.
        function initApp() {
            db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
                products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderCategories();
                renderProducts();
                renderAdminProductsList();
                handleDeepLinkToProduct();
            }, (err) => {
                console.error(err);
                showToast("No se pudo conectar con la base de datos del catálogo.", "error");
            });
        }

        // Carga los 6 productos de ejemplo en Firestore, solo si la base de datos
        // está vacía (útil la primera vez que conectas la base de datos).
        async function seedDefaultProductsIfEmpty() {
            const snapshot = await db.collection('products').limit(1).get();
            if (!snapshot.empty) {
                showToast("Ya hay productos en la base de datos, no se cargaron los de ejemplo.", "error");
                return;
            }
            const batch = db.batch();
            defaultProducts.forEach(p => {
                const { id, ...rest } = p;
                const ref = db.collection('products').doc();
                batch.set(ref, { ...rest, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
            });
            await batch.commit();
            showToast("Productos de ejemplo cargados en la base de datos.", "success");
        }

        // Render Category Filter Buttons
        function renderCategories() {
            const container = document.getElementById('category-filters');
            // Extract unique categories
            const categoriesSet = new Set(products.map(p => p.category));
            const categories = ['todos', ...Array.from(categoriesSet)];

            let html = '';
            categories.forEach(cat => {
                const isActive = currentCategory === cat;
                const displayName = cat === 'todos' ? '✨ Todos los productos' : cat;
                const activeClass = isActive 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold shadow-md transform scale-105 border border-yellow-400' 
                    : 'bg-[#111a2e] text-gray-300 hover:bg-[#131b30] hover:text-yellow-400 font-medium border border-yellow-500/20 shadow-sm';
                
                html += `
                    <button onclick="filterCategory('${cat}')" class="px-5 py-2 rounded-2xl text-xs sm:text-sm transition duration-300 focus:outline-none ${activeClass}">
                        ${displayName}
                    </button>
                `;
            });
            container.innerHTML = html;
        }

        // Filter by category
        function filterCategory(cat) {
            currentCategory = cat;
            renderCategories();
            renderProducts();
        }

        // Handle Search input
        function handleSearch() {
            searchQuery = document.getElementById('search-input').value.toLowerCase().trim();
            renderProducts();
        }

        // Render Products Grid
        function renderProducts() {
            const grid = document.getElementById('products-grid');
            const emptyState = document.getElementById('empty-state');
            const counterEl = document.getElementById('product-counter');
            const titleEl = document.getElementById('product-count-title');

            // Filter logic
            let filtered = products.filter(p => {
                const matchesCategory = currentCategory === 'todos' || p.category.toLowerCase() === currentCategory.toLowerCase();
                const matchesSearch = p.name.toLowerCase().includes(searchQuery) || p.description.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery);
                return matchesCategory && matchesSearch;
            });

            counterEl.innerText = `${filtered.length} referencias`;
            titleEl.innerText = currentCategory === 'todos' ? 'Catálogo General' : `Categoría: ${currentCategory}`;

            if (filtered.length === 0) {
                grid.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            let html = '';

            filtered.forEach(p => {
                const mainImage = (p.images && p.images.length > 0) ? p.images[0] : 'https://placehold.co/600x600/1a1a1a/D4AF37?text=Sin+Imagen';
                const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price);

                html += `
                    <div onclick="openProductModal('${p.id}')" class="bg-[#0d1220] rounded-3xl p-4 card-shadow hover:shadow-xl transition duration-300 cursor-pointer flex flex-col justify-between group border border-yellow-500/20">
                        <div>
                            <!-- Image Container -->
                            <div class="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#111a2e] mb-4">
                                <img src="${mainImage}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.src='https://placehold.co/600x600/1a1a1a/D4AF37?text=Imagen+No+Disponible'">
                                <span class="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-[11px] font-bold text-yellow-400 px-3 py-1 rounded-full shadow-sm border border-yellow-500/30">
                                    ${p.category}
                                </span>
                            </div>
                            <!-- Product Name -->
                            <h4 class="font-bold text-white text-sm sm:text-base mb-1 line-clamp-1 group-hover:text-yellow-400 transition">${p.name}</h4>
                            <p class="text-xs text-gray-400 line-clamp-2 mb-3">${p.description}</p>
                        </div>
                        <div class="flex items-center justify-between pt-3 border-t border-yellow-500/10 mt-2">
                            <span class="font-extrabold text-yellow-400 text-sm sm:text-base">${formattedPrice}</span>
                            <div class="flex items-center gap-2">
                                <button onclick="event.stopPropagation(); addToCart('${p.id}')" title="Agregar al carrito" class="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black flex items-center justify-center transition duration-300 text-xs">
                                    <i class="fa-solid fa-cart-plus"></i>
                                </button>
                                <span class="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black flex items-center justify-center transition duration-300 text-xs">
                                    <i class="fa-solid fa-eye"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                `;
            });

            grid.innerHTML = html;
        }

        // Open Product Modal with Multiple Images Gallery
        function openProductModal(id) {
            const p = products.find(prod => prod.id === id);
            if (!p) return;

            const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price);
            const images = p.images && p.images.length > 0 ? p.images : ['https://placehold.co/600x600/1a1a1a/D4AF37?text=Sin+Imagen'];

            const modalContent = document.getElementById('modal-content');
            
            let thumbnailsHtml = '';
            images.forEach((img, index) => {
                thumbnailsHtml += `
                    <button onclick="changeModalMainImage('${img}', this)" class="w-16 h-16 rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-yellow-400' : 'border-transparent'} hover:border-yellow-300 transition focus:outline-none flex-shrink-0 bg-[#0d1220]">
                        <img src="${img}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/600x600/1a1a1a/D4AF37?text=Error'">
                    </button>
                `;
            });

            modalContent.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <!-- Gallery Area -->
                    <div class="space-y-4">
                        <div class="w-full aspect-square rounded-2xl overflow-hidden bg-[#0d1220] border border-yellow-500/20">
                            <img id="modal-main-img" src="${images[0]}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/600x600/1a1a1a/D4AF37?text=Sin+Imagen'">
                        </div>
                        ${images.length > 1 ? `
                            <div class="flex items-center gap-2 overflow-x-auto pb-2">
                                ${thumbnailsHtml}
                            </div>
                        ` : ''}
                    </div>
                    <!-- Details Area -->
                    <div class="space-y-4 flex flex-col justify-between h-full">
                        <div>
                            <span class="inline-block bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold text-xs px-3 py-1 rounded-full mb-2">
                                ${p.category}
                            </span>
                            <h2 class="text-2xl font-extrabold text-white mb-2">${p.name}</h2>
                            <div class="text-2xl font-black text-yellow-400 mb-4">${formattedPrice}</div>
                            <div class="bg-[#0d1220] p-4 rounded-2xl mb-4 border border-yellow-500/10">
                                <h5 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Descripción del Producto</h5>
                                <p class="text-sm text-gray-300 leading-relaxed">${p.description}</p>
                            </div>
                        </div>
                        <div class="pt-4 border-t border-yellow-500/10 space-y-2">
                            <button onclick="addToCart('${p.id}')" class="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold rounded-xl shadow-md transition duration-300 text-sm flex items-center justify-center gap-2">
                                <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
                            </button>
                            <button onclick="closeProductModal()" class="w-full py-3 bg-[#131b30] hover:bg-[#1a2338] text-gray-200 font-bold rounded-xl transition text-sm">
                                Volver al Catálogo
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const modal = document.getElementById('product-modal');
            modal.classList.remove('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-95');
            modal.querySelector('div > div').classList.add('scale-100');
        }

        // Change modal main image when clicking thumbnail
        function changeModalMainImage(src, btnEl) {
            document.getElementById('modal-main-img').src = src;
            // Update borders
            const container = btnEl.parentElement;
            Array.from(container.children).forEach(child => {
                child.classList.remove('border-yellow-400');
                child.classList.add('border-transparent');
            });
            btnEl.classList.remove('border-transparent');
            btnEl.classList.add('border-yellow-400');
        }

        // Close Product Modal
        function closeProductModal() {
            const modal = document.getElementById('product-modal');
            modal.classList.add('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-100');
            modal.querySelector('div > div').classList.add('scale-95');
        }

        // --- CARRITO DE COMPRAS: persistencia local ---

        function loadCart() {
            try {
                const saved = localStorage.getItem('mitiko_cart');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }

        function saveCart() {
            try {
                localStorage.setItem('mitiko_cart', JSON.stringify(cart));
            } catch (e) {
                console.error('No se pudo guardar el carrito localmente.', e);
            }
        }

        // Agrega un producto al carrito (o le suma 1 si ya estaba)
        function addToCart(id) {
            const p = products.find(prod => prod.id === id);
            if (!p) return;

            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.qty += 1;
            } else {
                cart.push({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: (p.images && p.images.length > 0) ? p.images[0] : '',
                    qty: 1
                });
            }
            saveCart();
            updateCartBadge();
            renderCart();
            showToast(`"${p.name}" se agregó al carrito.`, "success");
        }

        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            saveCart();
            updateCartBadge();
            renderCart();
        }

        function changeCartQty(id, delta) {
            const item = cart.find(i => i.id === id);
            if (!item) return;
            item.qty += delta;
            if (item.qty <= 0) {
                removeFromCart(id);
                return;
            }
            saveCart();
            updateCartBadge();
            renderCart();
        }

        function getCartTotal() {
            return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        }

        function getCartCount() {
            return cart.reduce((sum, item) => sum + item.qty, 0);
        }

        function updateCartBadge() {
            const badge = document.getElementById('cart-badge');
            const count = getCartCount();
            if (count > 0) {
                badge.innerText = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // Dibuja el contenido del modal de carrito
        function renderCart() {
            const container = document.getElementById('cart-items-container');
            const emptyState = document.getElementById('cart-empty-state');
            const footer = document.getElementById('cart-footer');
            const totalEl = document.getElementById('cart-total');
            const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

            if (cart.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                footer.classList.add('hidden');
                return;
            }

            emptyState.classList.add('hidden');
            footer.classList.remove('hidden');

            let html = '';
            cart.forEach(item => {
                const img = item.image || 'https://placehold.co/100x100/1a1a1a/D4AF37?text=Img';
                html += `
                    <div class="flex items-center gap-3 bg-[#111a2e] border border-yellow-500/10 rounded-2xl p-3">
                        <img src="${img}" class="w-16 h-16 rounded-xl object-cover flex-shrink-0" onerror="this.src='https://placehold.co/100x100/1a1a1a/D4AF37?text=Img'">
                        <div class="flex-grow min-w-0">
                            <h5 class="text-sm font-bold text-white truncate">${item.name}</h5>
                            <p class="text-xs text-yellow-400 font-semibold">${formatter.format(item.price)}</p>
                            <div class="flex items-center gap-2 mt-2">
                                <button onclick="changeCartQty('${item.id}', -1)" class="w-7 h-7 rounded-lg bg-[#16213a] hover:bg-[#22304f] text-gray-300 flex items-center justify-center text-xs">
                                    <i class="fa-solid fa-minus"></i>
                                </button>
                                <span class="text-sm font-bold text-white w-5 text-center">${item.qty}</span>
                                <button onclick="changeCartQty('${item.id}', 1)" class="w-7 h-7 rounded-lg bg-[#16213a] hover:bg-[#22304f] text-gray-300 flex items-center justify-center text-xs">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <button onclick="removeFromCart('${item.id}')" title="Quitar" class="w-8 h-8 rounded-full bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                            <i class="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                `;
            });
            container.innerHTML = html;
            totalEl.innerText = formatter.format(getCartTotal());
        }

        function openCartModal() {
            renderCart();
            const modal = document.getElementById('cart-modal');
            modal.classList.remove('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-95');
            modal.querySelector('div > div').classList.add('scale-100');
        }

        function closeCartModal() {
            const modal = document.getElementById('cart-modal');
            modal.classList.add('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-100');
            modal.querySelector('div > div').classList.add('scale-95');
        }

        // Pasa del carrito al formulario de datos de envío
        function goToCheckout() {
            if (cart.length === 0) {
                showToast("Tu carrito está vacío.", "error");
                return;
            }
            closeCartModal();
            openCheckoutModal();
        }

        function populateDepartmentSelect() {
            const select = document.getElementById('checkout-department');
            if (!select || select.options.length > 1) return; // ya está poblado
            DEPARTAMENTOS_CO.forEach(dep => {
                const opt = document.createElement('option');
                opt.value = dep;
                opt.innerText = dep;
                select.appendChild(opt);
            });
        }

        function openCheckoutModal() {
            populateDepartmentSelect();
            // recuerda los últimos datos usados, para no tener que escribirlos de nuevo
            try {
                const savedInfo = JSON.parse(localStorage.getItem('mitiko_checkout_info') || 'null');
                if (savedInfo) {
                    document.getElementById('checkout-name').value = savedInfo.name || '';
                    document.getElementById('checkout-city').value = savedInfo.city || '';
                    document.getElementById('checkout-department').value = savedInfo.department || '';
                }
            } catch (e) { /* sin problema si no hay datos guardados */ }

            const modal = document.getElementById('checkout-modal');
            modal.classList.remove('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-95');
            modal.querySelector('div > div').classList.add('scale-100');
        }

        function closeCheckoutModal() {
            const modal = document.getElementById('checkout-modal');
            modal.classList.add('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-100');
            modal.querySelector('div > div').classList.add('scale-95');
        }

        // Construye el link de un producto: abre el catálogo directo en ese producto
        // (foto y precio se ven apenas la persona toca el enlace).
        function buildProductLink(id) {
            const base = window.location.origin + window.location.pathname;
            return `${base}?producto=${id}`;
        }

        // Si la página se abre con "?producto=ID" (por ejemplo desde un link compartido
        // por WhatsApp), abre automáticamente el modal de ese producto.
        function handleDeepLinkToProduct() {
            if (deepLinkHandled) return;
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('producto');
            if (productId && products.find(p => p.id === productId)) {
                deepLinkHandled = true;
                openProductModal(productId);
            }
        }

        // Arma el mensaje de WhatsApp con el formato pedido y los productos del carrito
        function buildWhatsAppMessage(name, city, department) {
            const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
            let msg = `Hola soy ${name}, me encuentro en ${city}, ${department}. Me interesa hacer la compra de estos productos:\n\n`;

            cart.forEach(item => {
                const qtyText = item.qty > 1 ? ` x${item.qty}` : '';
                msg += `🛍️ ${item.name}${qtyText} - ${formatter.format(item.price)}\n${buildProductLink(item.id)}\n\n`;
            });

            msg += `Total: ${formatter.format(getCartTotal())}`;
            return msg;
        }

        // Valida los datos, arma el mensaje y abre WhatsApp con el pedido listo para enviar
        function handleCheckoutSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('checkout-name').value.trim();
            const city = document.getElementById('checkout-city').value.trim();
            const department = document.getElementById('checkout-department').value;

            if (!name || !city || !department) {
                showToast("Completa tu nombre, ciudad y departamento.", "error");
                return;
            }
            if (cart.length === 0) {
                showToast("Tu carrito está vacío.", "error");
                return;
            }

            // Guarda los datos para que no tenga que volver a escribirlos la próxima vez
            localStorage.setItem('mitiko_checkout_info', JSON.stringify({ name, city, department }));

            const message = buildWhatsAppMessage(name, city, department);
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            window.open(whatsappUrl, '_blank');

            closeCheckoutModal();
            cart = [];
            saveCart();
            updateCartBadge();
            showToast("¡Pedido listo! Solo confirma el envío desde WhatsApp.", "success");
        }

        // --- ADMIN AUTH & DASHBOARD LOGIC ---

        function openAdminLoginModal() {
            const modal = document.getElementById('admin-login-modal');
            modal.classList.remove('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-95');
            modal.querySelector('div > div').classList.add('scale-100');
        }

        function closeAdminLoginModal() {
            const modal = document.getElementById('admin-login-modal');
            modal.classList.add('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-100');
            modal.querySelector('div > div').classList.add('scale-95');
        }

        function handleAdminLogin(e) {
            e.preventDefault();
            const email = document.getElementById('admin-email').value.trim();
            const pass = document.getElementById('admin-password').value.trim();

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verificando...';

            auth.signInWithEmailAndPassword(email, pass)
                .then(() => {
                    closeAdminLoginModal();
                    openAdminDashboard();
                    document.getElementById('admin-email').value = '';
                    document.getElementById('admin-password').value = '';
                })
                .catch((err) => {
                    console.error(err);
                    showToast("Correo o contraseña incorrectos.", "error");
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                });
        }

        function openAdminDashboard() {
            cancelEditProduct(); // siempre abre en modo "agregar", sin edición a medias
            renderAdminProductsList();
            const modal = document.getElementById('admin-dashboard-modal');
            modal.classList.remove('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-95');
            modal.querySelector('div > div').classList.add('scale-100');
        }

        function closeAdminDashboard() {
            const modal = document.getElementById('admin-dashboard-modal');
            modal.classList.add('pointer-events-none', 'opacity-0');
            modal.querySelector('div > div').classList.remove('scale-100');
            modal.querySelector('div > div').classList.add('scale-95');
            // Refresh main view
            renderCategories();
            renderProducts();
        }

        function logoutAdmin() {
            auth.signOut();
            closeAdminDashboard();
            showToast("Sesión de administrador cerrada correctamente.", "success");
        }

        // --- Helpers para subir fotos reales (PNG/JPG) desde el administrador ---

        // Comprime y convierte una foto (File) en una imagen real embebida (data URL),
        // redimensionándola para que no ocupe demasiado espacio en el catálogo.
        function compressImage(file, maxDim = 800, quality = 0.75) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        let { width, height } = img;
                        if (width > maxDim || height > maxDim) {
                            if (width > height) {
                                height = Math.round(height * (maxDim / width));
                                width = maxDim;
                            } else {
                                width = Math.round(width * (maxDim / height));
                                height = maxDim;
                            }
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    };
                    img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
                    img.src = e.target.result;
                };
                reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
                reader.readAsDataURL(file);
            });
        }

        // Muestra la vista previa apenas se selecciona una foto en el panel de administración
        function previewNewImage(index, inputEl) {
            const file = inputEl.files[0];
            if (!file) return;

            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                showToast("Solo se permiten imágenes en formato PNG o JPG.", "error");
                inputEl.value = '';
                return;
            }
            if (file.size > 15 * 1024 * 1024) {
                showToast("Esa foto pesa demasiado (máx. 15MB). Usa una más liviana.", "error");
                inputEl.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById(`new-img-${index}-preview`);
                const placeholder = document.getElementById(`new-img-${index}-placeholder`);
                const clearBtn = document.getElementById(`new-img-${index}-clear`);
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
                clearBtn.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        // Quita la foto seleccionada (o existente) en un slot del formulario
        function clearNewImage(index) {
            const input = document.getElementById(`new-img-${index}`);
            const preview = document.getElementById(`new-img-${index}-preview`);
            const placeholder = document.getElementById(`new-img-${index}-placeholder`);
            const clearBtn = document.getElementById(`new-img-${index}-clear`);
            input.value = '';
            preview.src = '';
            preview.classList.add('hidden');
            placeholder.classList.remove('hidden');
            clearBtn.classList.add('hidden');
            existingImages[index - 1] = null;
        }

        // Alterna el título y el botón del formulario entre "Agregar" y "Editar"
        function syncProductFormUI() {
            const icon = document.getElementById('product-form-submit-icon');
            const text = document.getElementById('product-form-submit-text');
            const titleIcon = document.getElementById('product-form-title-icon');
            const titleText = document.getElementById('product-form-title-text');
            const cancelBtn = document.getElementById('cancel-edit-btn');
            const img1 = document.getElementById('new-img-1');

            if (editingProductId) {
                icon.className = 'fa-solid fa-floppy-disk';
                text.innerText = 'Guardar Cambios';
                titleIcon.className = 'fa-solid fa-pen text-blue-300';
                titleText.innerText = 'Editar Producto';
                cancelBtn.classList.remove('hidden');
                img1.removeAttribute('required');
            } else {
                icon.className = 'fa-solid fa-cloud-arrow-up';
                text.innerText = 'Guardar Producto en el Catálogo';
                titleIcon.className = 'fa-solid fa-plus-circle text-yellow-400';
                titleText.innerText = 'Agregar Nuevo Producto al Catálogo';
                cancelBtn.classList.add('hidden');
                img1.setAttribute('required', 'required');
            }
        }

        // Abre el formulario ya lleno con los datos de un producto para editarlo
        function openEditProduct(id) {
            const p = products.find(prod => prod.id === id);
            if (!p) return;

            editingProductId = id;
            const imgs = p.images || [];
            existingImages = [imgs[0] || null, imgs[1] || null, imgs[2] || null, imgs[3] || null];

            document.getElementById('new-name').value = p.name || '';
            document.getElementById('new-category').value = p.category || '';
            document.getElementById('new-price').value = p.price || '';
            document.getElementById('new-description').value = p.description || '';

            [1, 2, 3, 4].forEach(i => {
                const input = document.getElementById(`new-img-${i}`);
                const preview = document.getElementById(`new-img-${i}-preview`);
                const placeholder = document.getElementById(`new-img-${i}-placeholder`);
                const clearBtn = document.getElementById(`new-img-${i}-clear`);
                input.value = '';
                const existing = existingImages[i - 1];
                if (existing) {
                    preview.src = existing;
                    preview.classList.remove('hidden');
                    placeholder.classList.add('hidden');
                    clearBtn.classList.remove('hidden');
                } else {
                    preview.src = '';
                    preview.classList.add('hidden');
                    placeholder.classList.remove('hidden');
                    clearBtn.classList.add('hidden');
                }
            });

            syncProductFormUI();
            document.getElementById('product-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Sale del modo edición y deja el formulario listo para agregar un producto nuevo
        function cancelEditProduct() {
            editingProductId = null;
            existingImages = [null, null, null, null];
            document.getElementById('product-form').reset();
            [1, 2, 3, 4].forEach(i => clearNewImage(i));
            syncProductFormUI();
        }

        // Guarda el formulario: crea un producto nuevo, o actualiza uno existente si estás editando
        async function handleProductFormSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('new-name').value.trim();
            const category = document.getElementById('new-category').value.trim();
            const price = parseFloat(document.getElementById('new-price').value);
            const description = document.getElementById('new-description').value.trim();

            const fileInputs = [1, 2, 3, 4].map(i => document.getElementById(`new-img-${i}`));
            const files = fileInputs.map(inp => inp.files[0] || null);

            const hasAnyImage = files.some(Boolean) || existingImages.some(Boolean);
            if (!hasAnyImage) {
                showToast("Debes tener al menos la foto principal (PNG o JPG).", "error");
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const icon = document.getElementById('product-form-submit-icon');
            const text = document.getElementById('product-form-submit-text');
            submitBtn.disabled = true;
            icon.className = 'fa-solid fa-spinner fa-spin';
            text.innerText = 'Guardando...';

            try {
                // Por cada casilla: si elegiste una foto nueva se comprime; si no,
                // se conserva la que ya tenía (o se deja vacía si la borraste con la x).
                const images = [];
                for (let i = 0; i < 4; i++) {
                    if (files[i]) {
                        images.push(await compressImage(files[i]));
                    } else if (existingImages[i]) {
                        images.push(existingImages[i]);
                    }
                }

                const productData = { name, category, price, description, images };

                // Firestore no acepta documentos de más de ~1MB; con fotos comprimidas
                // casi nunca pasa, pero avisamos si llegara a suceder.
                const estimatedSize = new Blob([JSON.stringify(productData)]).size;
                if (estimatedSize > 950000) {
                    showToast("Las fotos juntas pesan demasiado. Sube menos fotos o de menor calidad.", "error");
                    return;
                }

                if (editingProductId) {
                    await db.collection('products').doc(editingProductId).update(productData);
                    showToast("¡Cambios guardados! Ya se actualizaron en el catálogo.", "success");
                } else {
                    productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    await db.collection('products').add(productData);
                    showToast("¡Producto agregado! Ya es visible para todas las personas que visiten tu catálogo.", "success");
                }

                cancelEditProduct(); // limpia el formulario y vuelve a modo "agregar"
            } catch (err) {
                console.error(err);
                showToast("Ocurrió un error guardando el producto. Intenta de nuevo.", "error");
            } finally {
                submitBtn.disabled = false;
                syncProductFormUI();
            }
        }

        // Render Admin Products List for management/deletion
        function renderAdminProductsList() {
            const container = document.getElementById('admin-products-list');
            document.getElementById('admin-prod-count').innerText = products.length;

            if (products.length === 0) {
                container.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">No hay productos registrados.</p>`;
                return;
            }

            let html = '';
            products.forEach(p => {
                const mainImage = (p.images && p.images.length > 0) ? p.images[0] : 'https://placehold.co/100x100/1a1a1a/D4AF37?text=Img';
                const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(p.price);

                html += `
                    <div class="flex items-center justify-between p-3 bg-[#161616] rounded-xl border border-yellow-500/15 shadow-sm gap-4">
                        <div class="flex items-center space-x-3 overflow-hidden">
                            <img src="${mainImage}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0" onerror="this.src='https://placehold.co/100x100/1a1a1a/D4AF37?text=Img'">
                            <div class="truncate">
                                <h5 class="text-xs font-bold text-white truncate">${p.name}</h5>
                                <p class="text-[11px] text-gray-400">${p.category} · <span class="text-yellow-400 font-semibold">${formattedPrice}</span></p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0">
                            <button onclick="openEditProduct('${p.id}')" class="w-9 h-9 rounded-lg bg-[#16213a] hover:bg-[#1c2c4f] text-blue-300 flex items-center justify-center transition text-xs" title="Editar producto">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button onclick="deleteProduct('${p.id}')" class="w-9 h-9 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition text-xs" title="Eliminar producto">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        // Delete Product (elimina también sus fotos, porque van embebidas en el producto)
        function deleteProduct(id) {
            if (confirm("¿Estás segura de eliminar este producto del catálogo? Sus fotos también se borrarán.")) {
                db.collection('products').doc(id).delete()
                    .then(() => showToast("Producto y fotos eliminados definitivamente.", "success"))
                    .catch((err) => {
                        console.error(err);
                        showToast("No se pudo eliminar el producto. Intenta de nuevo.", "error");
                    });
            }
        }

        // Simple Toast notification helper (replaces alert)
        function showToast(message, type = 'success') {
            const existingToast = document.getElementById('toast-notification');
            if (existingToast) existingToast.remove();

            const toast = document.createElement('div');
            toast.id = 'toast-notification';
            const bgClass = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';
            toast.className = `fixed bottom-6 right-6 z-50 ${bgClass} text-white px-5 py-3 rounded-2xl shadow-lg text-xs sm:text-sm font-bold flex items-center gap-2 transform translate-y-10 opacity-0 transition-all duration-300`;
            toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i> ${message}`;

            document.body.appendChild(toast);
            setTimeout(() => {
                toast.classList.remove('translate-y-10', 'opacity-0');
            }, 50);

            setTimeout(() => {
                toast.classList.add('translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Run initialization on load
        window.onload = function () {
            initApp();
            updateCartBadge(); // por si ya había productos guardados en el carrito de una visita anterior
        };
