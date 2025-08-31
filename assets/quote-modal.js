function openQuoteModal() {
  const modal = document.getElementById('QuoteModal');
  if (modal) {
    modal.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const quoteModal = {
    modal: document.getElementById('QuoteModal'),
    itemsContainer: document.getElementById('quote-modal-items-container'),
    emptyMessage: document.getElementById('quote-modal-empty-message'),
    formContainer: document.getElementById('quote-modal-form-container'),
    form: document.getElementById('QuoteModalForm'),
    formDetailsField: document.getElementById('QuoteModalForm-details'),
    itemTemplate: document.getElementById('quote-modal-item-template'),

    init: function() {
      if (!this.modal || !this.itemTemplate) {
        console.log('Quote Modal: Missing essential elements. Aborting initialization.');
        return;
      }
      this.addEventListeners();
      this.updateIconCount();
      // Expose a reference to the open method on the window object
      window.openQuoteModal = this.open.bind(this);
    },

    addEventListeners: function() {
      const closeButton = this.modal.querySelector('.quote-modal__close');
      if (closeButton) {
        closeButton.addEventListener('click', this.close.bind(this));
      }
      this.modal.addEventListener('click', (event) => {
        if (event.target === this.modal) {
          this.close();
        }
      });

      document.addEventListener('quote:updated', this.updateIconCount.bind(this));

      if (this.form) {
        this.form.addEventListener('submit', this.handleFormSubmit.bind(this));
      }
    },

    open: function() {
      this.render();
      this.modal.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    },

    close: function() {
      this.modal.removeAttribute('open');
      document.body.style.overflow = '';
    },

    getCart: function() {
      return JSON.parse(localStorage.getItem('customQuoteCart') || '[]');
    },

    saveCart: function(cart) {
      localStorage.setItem('customQuoteCart', JSON.stringify(cart));
      document.dispatchEvent(new CustomEvent('quote:updated'));
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

    render: function() {
      const cart = this.getCart();
      this.itemsContainer.innerHTML = '';

      if (cart.length === 0) {
        this.emptyMessage.style.display = 'block';
        if (this.formContainer) this.formContainer.style.display = 'none';
        return;
      }

      this.emptyMessage.style.display = 'none';
      if (this.formContainer) this.formContainer.style.display = 'block';

      cart.forEach(item => {
        const templateClone = this.itemTemplate.content.cloneNode(true);
        const itemElement = templateClone.querySelector('.cart-item');
        itemElement.dataset.id = item.id;

        templateClone.querySelector('.cart-item__image').src = item.image || '';
        templateClone.querySelector('.cart-item__name').textContent = item.title;
        templateClone.querySelector('.cart-item__name').href = `/products/${item.handle}`;

        const optionsHtml = item.options_with_values.map(opt => `<p style="margin: 0;">${opt.name}: ${opt.value}</p>`).join('');
        templateClone.querySelector('.product-option').innerHTML = optionsHtml;

        templateClone.querySelector('.quantity__input').value = item.quantity;

        this.itemsContainer.appendChild(templateClone);
      });

      this.addDynamicEventListeners();
    },

    addDynamicEventListeners: function() {
      this.itemsContainer.querySelectorAll('.quantity__input').forEach(input => {
        input.addEventListener('change', (event) => {
          const id = event.target.closest('.cart-item').dataset.id;
          const newQuantity = parseInt(event.target.value, 10);
          if (newQuantity > 0) {
            this.updateItemQuantity(id, newQuantity);
          } else {
            this.removeItem(id);
          }
        });
      });

      this.itemsContainer.querySelectorAll('[name="remove"]').forEach(button => {
        button.addEventListener('click', (event) => {
          const id = event.target.closest('.cart-item').dataset.id;
          this.removeItem(id);
        });
      });
    },

    updateItemQuantity: function(id, quantity) {
      let cart = this.getCart();
      const item = cart.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
      this.saveCart(cart);
      this.render();
    },

    removeItem: function(id) {
      let cart = this.getCart();
      cart = cart.filter(i => i.id !== id);
      this.saveCart(cart);
      this.render();
    },

    handleFormSubmit: function() {
      const cart = this.getCart();
      let formattedDetails = "Solicitud de Cotización:\n\n";
      cart.forEach(item => {
        formattedDetails += `----------------------------------------\n`;
        formattedDetails += `Producto: ${item.title}\n`;
        const options = item.options_with_values.map(o => o.value).join(' / ');
        if (options && options.toLowerCase() !== 'default title') {
          formattedDetails += `Variante: ${options}\n`;
        }
        formattedDetails += `Cantidad: ${item.quantity}\n`;
        formattedDetails += `Link: ${window.location.origin}/products/${item.handle}\n`;
      });

      this.formDetailsField.value = formattedDetails;

      setTimeout(() => {
        this.saveCart([]);
        this.close();
      }, 500);
    }
  };

  quoteModal.init();
});
