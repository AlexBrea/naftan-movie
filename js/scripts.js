(async function () {
  /* INICIO INITIAL VARIABLES */
  const initialPage = 1
  const mainSection = 'main'
  /* FIN INITIAL VARIABLES */

  /* INICIO DOM VARIABLES */
  const $body = document.querySelector('body')
  const $searchMovieContainer = document.getElementById('searchMovieContainer')
  const $searchFormContainer = $searchMovieContainer.querySelector('.search-form')
  const $searchResultContainer = $searchMovieContainer.querySelector('.movie-result-container')
  const $searchInput = $searchFormContainer.querySelector('input')
  const $searchResultList = $searchMovieContainer.querySelector('.movie-list')
  const $categoryList = document.getElementById('categoryList')
  const $suggestMoviesContainer = document.getElementById('suggestMoviesContainer')
  const $mainMoviesContainer = document.getElementById('mainMoviesContainer')
  const $movieTitle = document.getElementById('movieTitle')
  const $movieModal = document.getElementById('movieModal')
  const $pageNumberContainer = document.getElementById('pageNumberContainer')
  const $backPage = $pageNumberContainer.querySelector('.back')
  const $nextPage = $pageNumberContainer.querySelector('.next')
  const $categoryMoviesContainer = document.getElementById('categoryMoviesContainer')
 /* FIN DOM VARIABLES */


 /* INICIO SERVER PETITION */
  const BASE_API_MOVIELIST_URL = 'https://yts.mx/api/v2/list_movies.json'

  async function getMovieList(url) {
    try{
      const response = await fetch(url)
      const data = await response.json()
      return data
    } catch {
      throw Error('No se ha podido conectar con el servidor')
    }
  }
  /* FIN SERVER PETITION */


  /* INICIO SEARCH MOVIE */
  function searchMovieString(movie) {
    return (
      `<li>
        <div class="cover-result-movie-details"></div>
        <figure class="result-movie-img">
          <img src="${movie.medium_cover_image}" alt="${movie.title}">
        </figure>
        <div class="result-movie-details">
          <strong class="title">${movie.title}</strong>
          <span class="year">${movie.year}</span>
        </div>
      </li>`
    )
  }

  function searchMovieHTML(movie) {
    const movieString = searchMovieString(movie)
    const HTML = document.implementation.createHTMLDocument()
    HTML.body.innerHTML = movieString
    return HTML.body.children[0]
  }

  function renderSearchMovies(searchMovies) {
    $searchResultList.textContent = ''
    searchMovies.forEach(movie => {
      const $searchHTML = searchMovieHTML(movie)
      $searchResultList.append($searchHTML)
      const $searchItem = $searchHTML.querySelector('.cover-result-movie-details')
      $searchItem.addEventListener('click', () => {
        showModalInfo(movie, 'search')
      })
    })
  }

  function showElements() {
    $searchResultList.classList.remove('hide')
    $searchInput.classList.add('search-input-active')
  }

  function hideElements() {
    $searchResultList.classList.add('hide')
    $searchInput.classList.remove('search-input-active')
  }

  function clickBody(event) {
    if(event.target === $searchInput || event.target === $searchResultContainer || event.target === $searchResultList) {
      showElements()
    } else if(event.target.className !== 'cover-result-movie-details') {
      hideElements()
    }
  }
  async function getSearchMovies(data) {
    try {
      $body.addEventListener('mousedown', clickBody)
      showHideLoader('search')
      const {data: {movies: searchMovies}} = await getMovieList(`${BASE_API_MOVIELIST_URL}?query_term=${data}`)
      if(searchMovies) {
        showHideLoader('search')
        renderSearchMovies(searchMovies)
        $searchResultList.classList.remove('error-style')
        showElements()
      } else {
        showHideLoader('search')
        $searchResultList.classList.add('error-style')
        showElements()
        return $searchResultList.textContent = 'No hemos podido encontrar lo que buscas'
      }
    } catch (error) {
      showHideLoader('search')
      $searchResultList.classList.add('error-style')
      showElements()
      return $searchResultList.textContent = error.message
    }
  }

  $searchFormContainer.addEventListener('submit', event => {
    event.preventDefault()
    const data = new FormData($searchFormContainer)
    const value = data.get('searchMovie')
    getSearchMovies(value)
  })
  /* FIN SEARCH MOVIE */


  /* INICIO LOADER RENDER */
  function createLoader(section) {
    const $loader = document.createElement('img')
    $loader.setAttribute('src', 'assets/images/loader.gif')
    document.getElementById(`${section}Loader`).append($loader)
  }

  function showHideLoader(section) {
    const $loaderContainer = document.getElementById(`${section}Loader`)
    $loaderContainer.textContent = ""
    createLoader(section)
    if($loaderContainer.classList.contains('hide')) {
      $loaderContainer.classList.remove('hide')
    } else {
      $loaderContainer.classList.add('hide')
    }
  }
  /* FIN LOADER RENDER */
  

  /* INICIO MODAL RENDER */
  function downloadButtonsString(torrent) {
    return (
        `<a href="${torrent.url}">
        <button type="button" class="torrent-download-button"><b>Formato:</b> ${torrent.type}<br><b>Calidad:</b> ${torrent.quality}<br><b>Peso:</b> ${torrent.size}</button>
      </a>`
    )
  }

  function downloadButtonsHTML(torrents) {
    const HTML = document.implementation.createHTMLDocument()
    torrents.forEach(torrent => {
      const buttonString = downloadButtonsString(torrent)
      HTML.body.append(buttonString)
    })
    return HTML.body.textContent
  }

  function movieTrailerString(trailer) {
    return (
        `<iframe class="yt-trailer" width="560" height="315" src="https://www.youtube.com/embed/${trailer}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    )
  }

  function movieTrailerHTML(trailer) {
    const HTML = document.implementation.createHTMLDocument()
    if(trailer) {
      const buttonString = movieTrailerString(trailer)
      HTML.body.append(buttonString)
      return HTML.body.textContent
    } else {
      HTML.body.textContent = '<span>Tráiler no disponible aún...</span>'
      return HTML.body.textContent
    }
  }

  function modalTemplateString(movie) {
    return (
      `<div class="movie-details">
        <figure class="close-movie-details"></figure>
        <div class="img-description-container">
          <div class="movie-details-header">
            <h3 class="movie-details-title">${movie.title}</h3>
            <span class="movie-details-language"><b>Idioma:</b> ${movie.language}</span>
          </div>
          <figure class="movie-details-img">
            <img src="${movie.medium_cover_image}" alt="${movie.title}">
          </figure>
          <p class="movie-details-description">${movie.synopsis}</p>
        </div>
        <div class="info-container">
          <div class="trailer-title">
            <strong>TRÁILER</strong>
          </div>
          <div class="yt-trailer-container">
            ${movieTrailerHTML(movie.yt_trailer_code)}
          </div>
          <div class="download-title">
            <strong>DESCARGA DIRECTA (TORRENT)</strong>
          </div>
          <div class="movie-downloads-container">
            ${downloadButtonsHTML(movie.torrents)}
          </div>
        </div>
      </div>`
    )
  }

  function modalTemplateHTML(movie) {
    const modalString = modalTemplateString(movie)
    const HTML = document.implementation.createHTMLDocument()
    HTML.body.innerHTML = modalString
    return HTML.body.children[0]
  }

  function clickModal(event, origin) {
    if(event.target === $movieModal) {
      hideModalInfo(origin)
    }
  }
  function activeModalEventsListener(origin) {
    $movieModal.querySelector('.close-movie-details').addEventListener('click', () => hideModalInfo(origin))
    $movieModal.addEventListener('click', event => clickModal(event, origin))
    if(origin === 'search') {
      $body.removeEventListener('mousedown', clickBody)
    }
  }

  function deactivateModalEventsListener(origin) {
    $movieModal.removeEventListener('click', clickModal)
    if(origin === 'search') {
      $body.addEventListener('mousedown', clickBody)
    }
  }

  function hideModalInfo(origin) {
    const modalToClear = $movieModal.querySelector('.movie-details')
    if(modalToClear) {
      modalToClear.remove()
    }
    $movieModal.querySelector('.movie-details-container').classList.remove('fadeDown')
    $movieModal.querySelector('.movie-details-container').classList.add('fadeUp')
    $body.classList.remove('overflow')
    $movieModal.classList.remove('fadeIn')
    $movieModal.classList.add('fadeOut')
    setTimeout(() => {
      $movieModal.querySelector('.movie-details-container').classList.add('hide')
      $movieModal.classList.add('hide')
    }, 500)
    deactivateModalEventsListener(origin)
  }

  function showModalInfo(movie, origin) {
    $movieModal.classList.remove('hide')
    $movieModal.classList.remove('fadeOut')
    $movieModal.classList.add('fadeIn')
    $movieModal.querySelector('.movie-details-container').classList.remove('hide')
    $movieModal.querySelector('.movie-details-container').classList.remove('fadeUp')
    $movieModal.querySelector('.movie-details-container').classList.add('fadeDown')
    $body.classList.add('overflow')
    $movieModal.querySelector('.movie-details-container').append(modalTemplateHTML(movie))
    activeModalEventsListener(origin)
  }
  /* FIN MODAL RENDER */


  /* INICIO MOVIE RENDER */
  function movieTemplateString(section, movie) {
    return (
      `<figure class="${section}-movie-img">
        <img class="hide" src="${movie.medium_cover_image}" alt="${movie.title}" data-title="${movie.title}" data-year="${movie.year}">
      </figure>`
    )
  }

  function movieTemplateHTML(section, movie) {
      const movieString = movieTemplateString(section, movie)
      const HTML = document.implementation.createHTMLDocument()
      HTML.body.innerHTML = movieString
      return HTML.body.children[0]
  }

  function validatePages(page, pageNumber) {
    $pageNumberContainer.querySelector('.page-number').textContent   = `${page} / ${pageNumber}`
    if(page <= 1){
      $backPage.removeEventListener('click', back)
      $backPage.classList.remove('page-active')
      $nextPage.addEventListener('click', next)
      $nextPage.classList.add('page-active')
    } else if(page > 1 && page < pageNumber) {
      $backPage.addEventListener('click', back)
      $backPage.classList.add('page-active')
      $nextPage.addEventListener('click', next)
      $nextPage.classList.add('page-active')
    } else if(page >= pageNumber) {
      $backPage.addEventListener('click', back)
      $backPage.classList.add('page-active')
      $nextPage.removeEventListener('click', next)
      $nextPage.classList.remove('page-active')
    }
    if($pageNumberContainer.classList.contains('hide')){
      $pageNumberContainer.classList.remove('hide')
    }
  }
  

  var detect_page
  var detect_origin
  var detect_section
  var detect_value
  var detect_genre
  function back() {
    detect_page--
    if(detect_origin === 'initialLoad') {
      getMainMovies(detect_page, detect_origin, detect_section)
    } else if(detect_origin === 'categoryLoad') {
      getCategoryMovies(detect_page, detect_origin, detect_section, detect_value, detect_genre)
    }
  }
  function next() {
    detect_page++
    if(detect_origin === 'initialLoad') {
      getMainMovies(detect_page++, detect_origin, detect_section)
    } else if(detect_origin === 'categoryLoad') {
      getCategoryMovies(detect_page++, detect_origin, detect_section, detect_value, detect_genre)
    }
  }

  function showMovieTitle(event) {
    $movieTitle.textContent = `${event.target.dataset.title} (${event.target.dataset.year})`
    $movieTitle.classList.remove('hide')
    $movieTitle.style.left = `${event.pageX+15}px`;
    $movieTitle.style.top = `${event.pageY-32.5}px`;
  }

  function hideMovieTitle() {
    $movieTitle.classList.add('hide')
  }

  function renderMoviesList(section, moviesList, count) {
    const $sectionMovies = document.getElementById(`${section}Movies`)
    window[`${section}Counter`] = 0
    moviesList.forEach(movie => {
      const movieTemplate = movieTemplateHTML(section, movie)
      $sectionMovies.append(movieTemplate)
      const $image = movieTemplate.querySelector('img')
      $image.addEventListener('load', () => {
        window[`${section}Counter`]++
        if (window[`${section}Counter`] === count) {
          let imageMovies = $sectionMovies.querySelectorAll(`.${section}-movie-img`)
          showHideLoader(section)
          imageMovies.forEach(imageMovie => {
            imageMovie.querySelector('img').classList.remove('hide')
            imageMovie.querySelector('img').classList.add('fadeIn')
          })
        }
      })
      function showHideMovieTitle(event) {
        if(!event.matches) {
          $image.addEventListener('mousemove', showMovieTitle)
          $image.addEventListener('mouseleave', hideMovieTitle)
        } else {
          $image.removeEventListener('mousemove', showMovieTitle)
          $image.removeEventListener('mouseleave', hideMovieTitle)
        }
      }
      responsive.addListener(showHideMovieTitle)
      showHideMovieTitle(responsive)
      $image.addEventListener('click', () => showModalInfo(movie))
    })
  }
  /* FIN MOVIE RENDER */


  /* INICIO GET MOVIES */
  async function getSuggestedMovies(section) {
    const $sectionMovies = document.getElementById(`${section}Movies`)
    const moviesNumber = 10
    try {
      showHideLoader(section)
      $suggestMoviesContainer.querySelector('h1').textContent = 'Top 10 - Descargas'
      const {data: {movies}} = await getMovieList(`${BASE_API_MOVIELIST_URL}?limit=${moviesNumber}&sort_by=download_count`)
      renderMoviesList(section, movies, moviesNumber)
      $sectionMovies.classList.remove('error-style')
    } catch (error) {
      showHideLoader(section)
      $sectionMovies.classList.add('error-style')
      $sectionMovies.textContent = error.message
    }
  }

  async function getCategoryMovies(page, origin, section, value, genre) {
    const $sectionMovies = document.getElementById(`${section}Movies`)
    const moviesNumber = 20
    try {
      $pageNumberContainer.classList.add('hide')
      document.getElementById(`${section}Movies`).textContent = ""
      showHideLoader(section)
      $mainMoviesContainer.querySelector('h1').textContent = `Categoría: ${value}`
      const {data} = await getMovieList(`${BASE_API_MOVIELIST_URL}?genre=${genre}&sort_by=year&page=${page}&limit=${moviesNumber}`)
      let pageNumber = Math.ceil(data.movie_count / data.limit)
      renderMoviesList(section, data.movies, moviesNumber)
      if(page >= 0 && pageNumber >= 0) {
        if(pageNumber === 0) {
          pageNumber = 1
        }
        validatePages(page, pageNumber)
        detect_page = page
        detect_origin = origin
        detect_section = section
        detect_value = value
        detect_genre = genre
      }
      $sectionMovies.classList.remove('error-style')
    } catch (error) {
      showHideLoader(section)
      $sectionMovies.classList.add('error-style')
      $sectionMovies.textContent = error.message
    }
  }

  async function getMainMovies(page, origin, section) {
    const $sectionMovies = document.getElementById(`${section}Movies`)
    const moviesNumber = 20
    try {
      $pageNumberContainer.classList.add('hide')
      document.getElementById(`${section}Movies`).textContent = ""
      showHideLoader(section)
      $mainMoviesContainer.querySelector('h1').textContent = 'Lo más actual'
      const {data} = await getMovieList(`${BASE_API_MOVIELIST_URL}?sort_by=year&page=${page}&limit=${moviesNumber}`)
      let pageNumber = Math.ceil(data.movie_count / data.limit)
      renderMoviesList(section, data.movies, moviesNumber)
      if(page >= 0 && pageNumber >= 0) {
        if(pageNumber === 0) {
          pageNumber = 1
        }
        validatePages(page, pageNumber)
        detect_page = page
        detect_origin = origin
        detect_section = section
      }
      $sectionMovies.classList.remove('error-style')
    } catch (error) {
      showHideLoader(section)
      $sectionMovies.classList.add('error-style')
      $sectionMovies.textContent = error.message
    }
  }
  /* FIN GET MOVIES */


  /* INICIO CATEGORY LIST RESPONSIVE*/
  const responsive = window.matchMedia('only screen and (max-width: 768px)')

  function arrowfunction() {
    if($categoryList.classList.contains('hide')) {
      $categoryMoviesContainer.querySelector('.arrow-container').classList.add('rotateUp')
      $categoryMoviesContainer.querySelector('.arrow-container').classList.remove('rotateDown')
      $categoryList.classList.remove('hide')
      $categoryList.classList.remove('fadeOut')
      $categoryList.classList.add('fadeIn')
    } else {
      $categoryMoviesContainer.querySelector('.arrow-container').classList.add('rotateDown')
      $categoryMoviesContainer.querySelector('.arrow-container').classList.remove('rotateUp')
      $categoryList.classList.remove('fadeIn')
      $categoryList.classList.add('fadeOut')
      setTimeout(() => $categoryList.classList.add('hide'), 500)
    }
  }

  function responsiveCategoryList(event) {
    if(event.matches) {
      $categoryMoviesContainer.querySelector('.arrow-container').classList.add('down-arrow')
      $categoryMoviesContainer.querySelector('.arrow-container').classList.remove('hide')
      $categoryList.classList.add('hide')
      $categoryMoviesContainer.querySelector('.arrow-container').addEventListener('click', arrowfunction)
    } else {
      $categoryMoviesContainer.querySelector('.arrow-container').classList.add('hide')
      $categoryList.classList.remove('hide')
      $categoryMoviesContainer.querySelector('.arrow-container').removeEventListener('click', arrowfunction)
    }
  }

  responsive.addListener(responsiveCategoryList)
  responsiveCategoryList(responsive)
  /* FIN CATEGORY LIST RESPONSIVE */


  /* INICIO ACTIVE MOVIE CATEGORIES */
  $categoryList.querySelectorAll('span').forEach(category => {
    category.addEventListener('click', event => {
      getCategoryMovies(initialPage, 'categoryLoad', mainSection, event.target.textContent, event.target.dataset.genre)
    })
  })
  /* FIN ACTIVE MOVIE CATEGORIES */


  /* INICIO LOAD INITIAL CONTENT */
  getSuggestedMovies('suggested')
  getMainMovies(initialPage, 'initialLoad', mainSection)
  /* FIN LOAD INITIAL CONTENT */
})()