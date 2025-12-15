  document.addEventListener('DOMContentLoaded', function () {
    const carousel = Carousel(document.getElementById('services-carousel'), {
      fill: true,
      infinite: false,
      plugins: [window.Dots],
    }).init();
  });