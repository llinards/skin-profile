
  document.addEventListener('DOMContentLoaded', function () {
    Carousel(
      document.getElementById('product-view'),
      {},
      {
        Arrows,
        Lazyload,
        Dots,
      }
    ).init();
    Carousel(
      document.getElementById('product-view-mobile'),
      {},
      {
        Arrows,
        Lazyload,
        Dots,
      }
    ).init();
  });
