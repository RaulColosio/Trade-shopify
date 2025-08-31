document.addEventListener('DOMContentLoaded', () => {
  const quoteCart = {
    getCart: function() {
      try {
        const cart = localStorage.getItem('customQuoteCart');
        return cart ? JSON.parse(cart) : [];
      } catch (e) {
        console.error("Error getting quote cart from localStorage", e);
        return [];
      }
    },
    saveCart: function(cart) {
      try {
        localStorage.setItem('customQuoteCart', JSON.stringify(cart));
      } catch (e) {
        console.error("Error saving quote cart to localStorage", e);
      }
    },
    updateIconCount: function() {
      const cart = this.getCart();
      const countElement = document.getElementById('QuoteIcon-Badge-Count');
      const iconBubble = document.getElementById('QuoteIcon-Bubble');

      if (countElement && iconBubble) {
        const count = cart.length;
        countElement.textContent = count;
        iconBubble.classList.toggle('hidden', count === 0);
      }
    },
    addToCart: function(variantId, quantity, productData) {
      console.log("[QuoteCart] Attempting to add to cart...");
      const cart = this.getCart();
      const existingItem = cart.find(item => item.id === variantId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const variant = productData.variants.find(v => v.id === parseInt(variantId, 10));
        if (!variant) {
          console.error('[QuoteCart] ERROR: Variant not found in product data for ID:', variantId);
          return;
        }

        let imageUrl = productData.featured_image || null;
        if (variant.featured_image) {
          imageUrl = variant.featured_image.src;
        }

        cart.push({
          id: variantId,
          quantity: quantity,
          product_id: productData.id,
          title: productData.title,
          price: variant.price,
          image: imageUrl,
          options_with_values: variant.options_with_values,
          handle: productData.handle
        });
      }
      this.saveCart(cart);
      this.updateIconCount();
      console.log("[QuoteCart] Item added successfully. New cart:", cart);
    }
  };

  function handleQuoteButtonClick(event) {
    const quoteButton = event.target.closest('[name="add-to-quote"]');
    if (!quoteButton) return;

    console.log('[QuoteCart] "Solicitar Cotización" button clicked.');
    event.preventDefault();

    const productFormElement = quoteButton.closest('product-form');
    if (!productFormElement) {
      console.error('[QuoteCart] ERROR: Could not find parent <product-form> element.');
      return;
    }

    const sectionId = productFormElement.dataset.sectionId;
    if (!sectionId) {
      console.error('[QuoteCart] ERROR: Could not find sectionId on product-form element.');
      return;
    }

    const productJsonScript = document.getElementById(`ProductJson-${sectionId}`);
    if (!productJsonScript) {
      console.error(`[QuoteCart] ERROR: Could not find product JSON script with ID #ProductJson-${sectionId}`);
      return;
    }

    try {
      const productData = JSON.parse(productJsonScript.textContent);
      const variantId = quoteButton.dataset.productId;
      const quantityInput = productFormElement.querySelector('[name="quantity"]');
      const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

      quoteCart.addToCart(variantId, quantity, productData);

      // UI Feedback
      const buttonTextSpan = quoteButton.querySelector('span');
      const originalText = buttonTextSpan.textContent;
      quoteButton.disabled = true;
      buttonTextSpan.textContent = '¡Añadido!';
      setTimeout(() => {
        buttonTextSpan.textContent = originalText;
        quoteButton.disabled = false;
      }, 2000);

    } catch (e) {
      console.error("[QuoteCart] Error processing product data or adding to cart:", e);
    }
  }

  // Initial state setup
  quoteCart.updateIconCount();
  document.addEventListener('click', handleQuoteButtonClick);
});
