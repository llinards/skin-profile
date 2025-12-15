  document.addEventListener('DOMContentLoaded', function () {
    const carousel = Carousel(document.getElementById('product-banner-carousel'), {
      gestures: false,
      infinite: true,
      plugins: [window.Autoplay],
      Autoplay: {
        timeout: 3000,
      },
      style: {
        '--f-progressbar-height': '0px',
      },
    }).init();
  });