document.addEventListener('DOMContentLoaded', () => {
    let currentAudio = null;
    let cart = [];

    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const audioSrc = card.getAttribute('data-audio');
        let audio = new Audio(audioSrc);
        audio.preload = 'none';

        // Воспроизведение аудио и вращение пластинки при наведении
        card.addEventListener('mouseenter', () => {
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            currentAudio = audio;
            audio.play().catch(() => {});
        });

        card.addEventListener('mouseleave', () => {
            if (currentAudio === audio) {
                audio.pause();
            }
        });

        // Клик по кнопке-сердечку (добавление/удаление в корзину)
        const favBtn = card.querySelector('.fav-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                const id = card.getAttribute('data-id');
                const title = card.getAttribute('data-title');
                const price = parseInt(card.getAttribute('data-price'));

                const itemIndex = cart.findIndex(item => item.id === id);

                if (itemIndex > -1) {
                    cart.splice(itemIndex, 1);
                    favBtn.classList.remove('active');
                } else {
                    cart.push({ id, title, price });
                    favBtn.classList.add('active');
                }

                updateCartUI();
            });
        }
    });

    // Управление модальными окнами и корзиной
    const cartModal = document.getElementById('cart-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const closeCheckoutBtn = document.getElementById('close-checkout');
    const goToCheckoutBtn = document.getElementById('go-to-checkout');
    const backToCartBtn = document.getElementById('back-to-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartCountEl = document.getElementById('cart-count');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutTotalEl = document.getElementById('checkout-total');
    const orderForm = document.getElementById('order-form');

    function updateCartUI() {
        cartCountEl.textContent = cart.length;
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="color: #a4b3a3; text-align: center; padding: 20px 0;">Ваша корзина пуста</p>';
        } else {
            cart.forEach((item) => {
                total += item.price;

                const itemEl = document.createElement('div');
                itemEl.classList.add('cart-item');
                itemEl.innerHTML = `
                    <div>
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">${item.price.toLocaleString()} тг</div>
                    </div>
                    <button class="delete-item-btn" data-id="${item.id}">&times;</button>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        cartTotalEl.textContent = `${total.toLocaleString()} тг`;
        checkoutTotalEl.textContent = `${total.toLocaleString()} тг`;

        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                cart = cart.filter(item => item.id !== id);

                const targetCard = document.querySelector(`.card[data-id="${id}"]`);
                if (targetCard) {
                    const favBtn = targetCard.querySelector('.fav-btn');
                    if (favBtn) favBtn.classList.remove('active');
                }

                updateCartUI();
            });
        });
    }

    openCartBtn.addEventListener('click', () => cartModal.classList.add('active'));
    closeCartBtn.addEventListener('click', () => cartModal.classList.remove('active'));
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('active'));

    goToCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert('Ваша корзина пуста!');
        cartModal.classList.remove('active');
        checkoutModal.classList.add('active');
    });

    backToCartBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
        cartModal.classList.add('active');
    });

    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Заказ успешно оформлен! Ожидайте доставку раритетного винила.');
        cart = [];
        document.querySelectorAll('.fav-btn').forEach(btn => btn.classList.remove('active'));
        updateCartUI();
        checkoutModal.classList.remove('active');
    });

    updateCartUI();
});