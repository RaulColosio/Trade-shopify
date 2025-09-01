function updateQuoteCounter() {
  const quoteIcon = document.getElementById('quote-icon-bubble');
  if (!quoteIcon) {
    return;
  }

  const countBubble = quoteIcon.querySelector('.quote-count-bubble');
  if (!countBubble) {
    return;
  }

  // Ensure QuoteManager is available
  if (!window.QuoteManager) {
    console.error('QuoteManager is not available to update the counter.');
    return;
  }

  const itemCount = window.QuoteManager.getQuote().length;
  const countSpan = countBubble.querySelector('span[aria-hidden="true"]');
  const screenReaderSpan = countBubble.querySelector('span.visually-hidden');

  if (itemCount > 0) {
    countSpan.textContent = itemCount;
    screenReaderSpan.textContent = `${itemCount} artículos`;
    countBubble.style.display = 'flex'; // Use flex to align with theme's cart bubble
  } else {
    countBubble.style.display = 'none';
  }
}

// Update the counter when the page loads
document.addEventListener('DOMContentLoaded', updateQuoteCounter);

// We also need a way to update the counter without a page refresh.
// We can listen for a custom event that other scripts can trigger.
document.addEventListener('quote:changed', function() {
  updateQuoteCounter();
});
