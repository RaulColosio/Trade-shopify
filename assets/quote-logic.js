window.QuoteManager = {
  STORAGE_KEY: 'shopifyQuote',

  /**
   * Retrieves the current quote from localStorage.
   * @returns {Array} The array of quote items.
   */
  getQuote: function() {
    try {
      const quoteJson = localStorage.getItem(this.STORAGE_KEY);
      return quoteJson ? JSON.parse(quoteJson) : [];
    } catch (e) {
      console.error('Error parsing quote from localStorage', e);
      return [];
    }
  },

  /**
   * Saves the quote to localStorage.
   * @param {Array} quote - The array of quote items to save.
   */
  saveQuote: function(quote) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quote));
  },

  /**
   * Adds an item to the quote or updates its quantity if it already exists.
   * @param {string|number} variantId - The ID of the product variant.
   * @param {number} quantity - The quantity to add.
   * @param {object} productInfo - An object containing product details like title, price, image, etc.
   */
  addToQuote: function(variantId, quantity, productInfo) {
    const quote = this.getQuote();
    const existingItemIndex = quote.findIndex(item => item.variantId == variantId);

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      quote[existingItemIndex].quantity = parseInt(quote[existingItemIndex].quantity, 10) + parseInt(quantity, 10);
    } else {
      // Add new item
      quote.push({
        variantId: variantId,
        quantity: parseInt(quantity, 10),
        ...productInfo
      });
    }

    this.saveQuote(quote);
  },

  /**
   * Removes an item from the quote.
   * @param {string|number} variantId - The ID of the product variant to remove.
   */
  removeFromQuote: function(variantId) {
    let quote = this.getQuote();
    quote = quote.filter(item => item.variantId != variantId);
    this.saveQuote(quote);
  },

  /**
   * Clears the entire quote.
   */
  clearQuote: function() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Updates the quantity of a specific item in the quote.
   * @param {string|number} variantId - The ID of the product variant to update.
   * @param {number} newQuantity - The new quantity.
   */
  updateQuantity: function(variantId, newQuantity) {
    let quote = this.getQuote();
    const itemIndex = quote.findIndex(item => item.variantId == variantId);

    if (itemIndex > -1) {
      const quantity = parseInt(newQuantity, 10);
      if (quantity > 0) {
        quote[itemIndex].quantity = quantity;
        this.saveQuote(quote);
      } else {
        // If quantity is 0 or less, remove the item
        this.removeFromQuote(variantId);
      }
    }
  },

  /**
   * Generates a summary of the quote for the email body.
   * @returns {string} A formatted string of the quote items.
   */
  getQuoteSummary: function() {
    const quote = this.getQuote();
    if (quote.length === 0) {
      return 'El cliente no seleccionó ningún artículo para cotizar.';
    }

    let summary = 'Solicitud de Cotización:\n\n';
    quote.forEach(item => {
      summary += `----------------------------------------\n`;
      summary += `Producto: ${item.title}\n`;
      if (item.variantTitle && item.variantTitle !== 'Default Title') {
        summary += `Variante: ${item.variantTitle}\n`;
      }
      summary += `SKU: ${item.sku || 'N/A'}\n`;
      summary += `Cantidad: ${item.quantity}\n`;
      summary += `Precio Unitario: ${item.price}\n`;
      summary += `Link: ${item.url}\n`;
    });
    summary += `----------------------------------------\n\n`;

    // Replace newlines with <br> tags for HTML email compatibility.
    return summary.replace(/\n/g, '<br>\n');
  }
};
