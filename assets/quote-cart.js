class QuoteCart {
  constructor() {
    this.cart = this.getCart();
    this.initEventListeners();
    this.updateIconCount();
  }

  getCart() {
    const cart = localStorage.getItem('customQuoteCart');
    return cart ? JSON.parse(cart) : [];
  }

  saveCart() {
    localStorage.setItem('customQuoteCart', JSON.stringify(this.cart));
  }

  addToCart(variantId, quantity, productData) {
    const existingItem = this.cart.find(item => item.id === variantId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const variant = productData.variants.find(v => v.id === parseInt(variantId, 10));
      if (!variant) {
        console.error('Variant not found for ID:', variantId);
        return;
      }

      this.cart.push({
        id: variantId,
        quantity: quantity,
        product_id: productData.id,
        title: productData.title,
        price: variant.price,
        original_price: variant.compare_at_price,
        image: variant.featured_image ? variant.featured_image.src : productData.featured_image,
        options_with_values: variant.options_with_values,
        handle: productData.handle
      });
    }
    this.saveCart();
    this.updateIconCount();
  }

  getCartCount() {
    return this.cart.length;
  }

  updateIconCount() {
    const countElement = document.getElementById('QuoteIcon-Badge-Count');
    const iconBubble = document.getElementById('QuoteIcon-Bubble');

    if (!countElement || !iconBubble) return;

    const count = this.getCartCount();
    countElement.textContent = count;
    iconBubble.classList.toggle('hidden', count === 0);
  }

  initEventListeners() {
    document.addEventListener('click', (event) => {
      const quoteButton = event.target.closest('[name="add-to-quote"]');
      if (quoteButton) {
        event.preventDefault();

        const form = quoteButton.closest('product-form');
        if (!form) return;

        const variantId = quoteButton.dataset.productId;
        const quantityInput = form.querySelector('[name="quantity"]');
        const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

        const sectionId = form.dataset.sectionId;
        const productJsonScript = document.getElementById(`ProductJson-${sectionId}`);

        if (!productJsonScript) {
          console.error('Product JSON script not found for section:', sectionId);
          return;
        }

        const productData = JSON.parse(productJsonScript.textContent);

        const spinner = quoteButton.querySelector('.loading-overlay__spinner');
        const buttonTextSpan = quoteButton.querySelector('span');
        const originalText = buttonTextSpan ? buttonTextSpan.textContent.trim() : 'Solicitar Cotización';

        if(spinner) spinner.hidden = false;
        quoteButton.disabled = true;
        if(buttonTextSpan) buttonTextSpan.textContent = 'Añadiendo...';

        // Simulate adding to cart
        setTimeout(() => {
          this.addToCart(variantId, quantity, productData);

          if(spinner) spinner.hidden = true;
          if(buttonTextSpan) buttonTextSpan.textContent = '¡Añadido!';

          setTimeout(() => {
            quoteButton.disabled = false;
            if(buttonTextSpan) buttonTextSpan.textContent = originalText;
          }, 2000);
        }, 500);
      }
    });
  }
}

if (typeof QuoteCart !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new QuoteCart();
  });
}
