import { Notify } from 'notiflix/build/notiflix-notify-aio';
const axios = require('axios').default;
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });

const API_KEY = '43934204-71edb5ce863d740adbd705f51';
const BASE_URL = 'https://pixabay.com/api/';
let query = '';
let currentPage = '';

let gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  formSearch: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  target: document.querySelector('.js-guard'),
};

refs.formSearch.addEventListener('submit', onSubmit);

function onSubmit(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value;
  currentPage = 1;

  fetchQuery(query)
    .then(response => {
      // console.log(response.data.totalHits);
      if (response.data.totalHits) {
        refs.gallery.innerHTML = '';
        onSuccess(response.data.totalHits);
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          render(response.data.hits)
        );
        observer.observe(refs.target);
        // let gallery = new SimpleLightbox('.gallery a', {
        //   captionsData: 'alt',
        //   captionDelay: 250,
        // });
        gallery.refresh();
      } else {
        refs.gallery.innerHTML = '';
        observer.unobserve(refs.target);
        onError();
      }
    })
    .catch(err => console.log(err));
}

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;
      fetchQuery(query)
        .then(response => {
          refs.gallery.insertAdjacentHTML(
            'beforeend',
            render(response.data.hits)
          );
          const totalPages = Math.ceil(
            response.data.totalHits / response.data.hits.length
          );

          if (currentPage === totalPages) {
            observer.unobserve(refs.target);
            onEndOfResults();
          }

          // let gallery = new SimpleLightbox('.gallery a', {
          //   captionsData: 'alt',
          //   captionDelay: 250,
          // });
          gallery.refresh();
        })
        .catch(err => console.log(err));
    }
  });
}

async function fetchQuery(query) {
  const response = await axios.get(`${BASE_URL}`, {
    params: {
      key: API_KEY,
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: currentPage,
      per_page: 40,
    },
  });
  if (response.status !== 200) {
    throw new Error(response.message);
  }
  // console.log(response.data.hits); // masive
  return response;
}

function render(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
  <div class="photo-card gallery__item">
    <a href="${largeImageURL}" class="gallery__link">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
      <p class="info-item">
        <b>Likes </b>${likes}
      </p>
      <p class="info-item">
        <b>Views </b>${views}
      </p>
      <p class="info-item">
        <b>Comments </b>${comments}
      </p>
      <p class="info-item">
        <b>Downloads </b>${downloads}
      </p>
    </div>
  </div>
`
    )
    .join('');
}

function onSuccess(totalHits) {
  Notify.success(`Hooray! We found ${totalHits} images.`, {
    position: 'right-top',
    fontSize: '20px',
    width: '350px',
  });
}

function onError() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    {
      position: 'right-top',
      fontSize: '20px',
      width: '350px',
    }
  );
}

function onEndOfResults() {
  Notify.failure("We're sorry, but you've reached the end of search results.", {
    position: 'right-top',
    fontSize: '20px',
    width: '350px',
  });
}
