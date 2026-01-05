/**
 * Stats Carousel Initialization
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Stats Carousel
  const statsCarousel = document.querySelector('.stats-carousel');
  
  if (statsCarousel) {
    new Swiper('.stats-carousel', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      speed: 600,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 30,
        },
      },
    });
  }
});

