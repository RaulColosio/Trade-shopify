document.addEventListener('DOMContentLoaded', function() {
  // Check if we are on a product page by looking for the quote button
  const quoteBtn = document.getElementById('add-to-quote-btn');
  if (!quoteBtn) {
    return; // Exit if the button is not found
  }

  const modal = document.getElementById('quote-confirmation-modal');
  const productForm = quoteBtn.closest('product-form');
  const productInfoElement = document.querySelector('product-info[data-product-id]');

  if (!modal || !productForm || !productInfoElement) {
    console.error('Quote system elements not found. Aborting.');
    return;
  }

  // --- Modal Handling ---
  const closeTriggers = modal.querySelectorAll('[data-close-modal]');

  function openModal() {
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('is-visible'), 10);
  }

  function closeModal() {
    modal.classList.remove('is-visible');
    // Allow animation to finish before hiding
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300); // Animation duration
  }

  closeTriggers.forEach(trigger => {
    trigger.addEventListener('click', closeModal);
  });

  // --- Button Click Handling ---
  quoteBtn.addEventListener('click', function() {
    const variantIdInput = productForm.querySelector('input[name="id"]');
    const quantityInput = productForm.querySelector('input[name="quantity"]');

    // Fallback for themes without a specific quantity input near the form
    const quantityEl = document.getElementById(`Quantity-${productInfoElement.dataset.section}`) || document.querySelector('.quantity__input');

    const variantId = variantIdInput ? variantIdInput.value : null;
    const quantity = quantityInput ? quantityInput.value : (quantityEl ? quantityEl.value : 1);

    if (!variantId) {
      console.error('Could not find variant ID.');
      alert('Error: No se pudo seleccionar la variante del producto.');
      return;
    }

    // --- Gather Product Information ---
    // This part can be theme-dependent. We make some safe assumptions.
    const productTitle = document.querySelector('.product__title h1, .product__title h2')?.textContent.trim();
    const priceElement = document.querySelector(`#price-${productInfoElement.dataset.section} .price-item--regular, #price-${productInfoElement.dataset.section} .price-item--sale`);
    const skuElement = document.querySelector(`#Sku-${productInfoElement.dataset.section}`);
    const imageElement = document.querySelector('.product__media-gallery .product-media-gallery__image, .product__media-wrapper img');

    // Get variant-specific data
    let variantTitle = '';
    let currentVariant = null;
    if (window.productJSON) {
      // Some themes expose a global product JSON
      currentVariant = window.productJSON.variants.find(v => v.id == variantId);
    } else if (productInfoElement.product) {
       // Some themes attach data to the custom element
       currentVariant = productInfoElement.product.variants.find(v => v.id == variantId);
    }

    if(currentVariant) {
        variantTitle = currentVariant.title;
    } else {
        // Fallback for variant title
        const variantPicker = document.querySelector('variant-radios, variant-selects');
        if (variantPicker) {
            const selectedOption = variantPicker.querySelector('input:checked + label');
            if(selectedOption) variantTitle = selectedOption.textContent.trim();
        }
    }


    const productInfo = {
      title: productTitle || 'Producto Desconocido',
      price: priceElement ? priceElement.textContent.trim() : 'N/A',
      sku: skuElement ? skuElement.textContent.trim() : 'N/A',
      variantId: variantId,
      variantTitle: variantTitle,
      quantity: parseInt(quantity, 10),
      imageUrl: imageElement ? imageElement.src.split('?')[0] + '?width=100' : '',
      url: productInfoElement.dataset.url
    };

    window.QuoteManager.addToQuote(variantId, quantity, productInfo);

    // Dispatch a custom event so other parts of the site can react
    document.dispatchEvent(new CustomEvent('quote:changed'));

    openModal();
  });
});
