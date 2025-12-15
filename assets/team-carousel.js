  document.addEventListener('DOMContentLoaded', function () {
    const carousel = Carousel(
      document.getElementById('team-carousel'),
      {
        fill: true,
        infinite: false,
      },
      { Dots }
    ).init();
  });