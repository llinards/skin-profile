
  document.addEventListener('DOMContentLoaded', function () {
    Carousel(
      document.getElementById('product-view'),
      {},
      {
        Lazyload,
        Dots,
      }
    ).init();
    Carousel(
      document.getElementById('product-view-mobile'),
      {},
      {
        Lazyload,
        Dots,
      }
    ).init();
  });
