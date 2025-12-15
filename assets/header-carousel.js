  document.addEventListener('DOMContentLoaded', function () {
    const carousel = Carousel(document.getElementById('header-carousel'), {
      infinite: true,
      plugins: [window.Autoplay, window.Dots],
      Autoplay: {
        timeout: 5000,
      },
      style: {
        '--f-progressbar-height': '0px',
      },
    }).init();
  });