document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const gallery = document.getElementById('image-gallery');
    const imageCounter = document.getElementById('image-counter');
    const totalLikes = document.getElementById('total-likes');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const gridViewBtn = document.querySelector('.view-btn-menu[data-view="grid"]');
    const listViewBtn = document.querySelector('.view-btn-menu[data-view="list"]');
    const filtersBtn = document.getElementById('filters-toggle');
    const filterMenu = document.querySelector('.filter-menu');

    // Переменные состояния
    let isFavoritesMode = false;
    let currentGenre = 'all';

    // Хранилище лайков
    const likesStorage = JSON.parse(localStorage.getItem('galleryLikes')) || {};

    // Хранилище счётчиков
    const countersStorage = JSON.parse(localStorage.getItem('galleryCounters')) || {
        imageCount: 0,
        totalLikes: 0
    };

    // Получаем сохранённые данные из localStorage
    const savedGenre = localStorage.getItem('currentGenre');
    const savedActiveTab = localStorage.getItem('activeTab');
    const savedView = localStorage.getItem('viewMode');

    // Устанавливаем текущий жанр
    currentGenre = savedGenre || 'all';
    if (savedGenre === 'favorites') {
        isFavoritesMode = true;
    }

    // Инициализация
    loadLikes();
    filterGallery(currentGenre);
    setupEventListeners();
    loadCounters();

    // Выделяем активную вкладку
    highlightActiveFilterButton();

    if (savedView) switchView(savedView);

    // Функция для корректировки позиции меню (открывается над кнопкой, если не хватает места)
    function positionFilterMenu() {
        if (!filtersBtn || !filterMenu) return;
        
        const btnRect = filtersBtn.getBoundingClientRect();
        const menuRect = filterMenu.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Сбрасываем позицию
        filterMenu.style.top = '';
        filterMenu.style.bottom = '';
        
        // Если меню не помещается снизу, открываем сверху
        if (btnRect.bottom + menuRect.height > viewportHeight - 10) {
            filterMenu.style.bottom = '100%';
            filterMenu.style.top = 'auto';
            filterMenu.style.marginBottom = '5px';
        } else {
            filterMenu.style.top = '100%';
            filterMenu.style.bottom = 'auto';
            filterMenu.style.marginTop = '5px';
        }
    }

    function setupEventListeners() {
        // 1. Обработчик для кнопки «Фильтры»
        if (filtersBtn && filterMenu) {
            filtersBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const isMenuVisible = filterMenu.style.display === 'block';
                
                if (!isMenuVisible) {
                    // Позиционируем меню перед показом
                    positionFilterMenu();
                    filterMenu.style.display = 'block';
                    this.classList.add('active');
                } else {
                    filterMenu.style.display = 'none';
                    this.classList.remove('active');
                }
            });
        }

        // 2. Скрываем меню при клике вне его
        document.addEventListener('click', function(e) {
            if (filterMenu && filtersBtn) {
                if (!filterMenu.contains(e.target) && !filtersBtn.contains(e.target)) {
                    filterMenu.style.display = 'none';
                    filtersBtn.classList.remove('active');
                }
            }
        });

        // Фильтры по жанрам + Избранное
        filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();

                // Снимаем выделение со всех кнопок
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Выделяем текущую кнопку
                this.classList.add('active');

                const genre = this.dataset.genre;

                if (genre === 'favorites') {
                    isFavoritesMode = true;
                    showOnlyFavorites();
                } else {
                    isFavoritesMode = false;
                    currentGenre = genre;
                    filterGallery(genre);
                }

                // Сохраняем выбранный жанр и активную вкладку в localStorage
                localStorage.setItem('currentGenre', genre);
                localStorage.setItem('activeTab', genre);

                // Пересчитываем всё после смены фильтра
                updateCounters();

                // Скрываем фильтры после выбора
                filterMenu.style.display = 'none';
                if (filtersBtn) filtersBtn.classList.remove('active');
            });
        });

        // Кнопки вида (сетка/список) в меню фильтров
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                switchView('grid');
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
                localStorage.setItem('viewMode', 'grid');

                filterMenu.style.display = 'none';
                if (filtersBtn) filtersBtn.classList.remove('active');
            });

            listViewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                switchView('list');
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
                localStorage.setItem('viewMode', 'list');

                filterMenu.style.display = 'none';
                if (filtersBtn) filtersBtn.classList.remove('active');
            });
        }

        // Делегирование клика по лайку
        gallery.addEventListener('click', function(e) {
            const likeBtn = e.target.closest('.like-btn');
            if (likeBtn) {
                const imageId = likeBtn.dataset.id;
                toggleLike(likeBtn, imageId);

                if (isFavoritesMode && !likeBtn.classList.contains('liked')) {
                    const card = likeBtn.closest('.image-card');
                    if (card) card.style.display = 'none';
                }
                updateCounters();
            }
        });

        // При изменении размера окна перепозиционируем меню, если оно открыто
        window.addEventListener('resize', function() {
            if (filterMenu && filterMenu.style.display === 'block') {
                positionFilterMenu();
            }
        });
    }

    // Фильтрация по жанру
    function filterGallery(genre) {
        const items = gallery.querySelectorAll('.image-card');
        items.forEach(item => {
            const itemGenre = item.dataset.genre;
            if (genre === 'all' || itemGenre === genre) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Режим «Избранное»
    function showOnlyFavorites() {
        const items = gallery.querySelectorAll('.image-card');
        items.forEach(item => {
            const button = item.querySelector('.like-btn');
            const imageId = button ? button.dataset.id : null;

            if (imageId && likesStorage[imageId]) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Универсальная функция обновления обоих счётчиков
    function updateCounters() {
        const visibleCards = gallery.querySelectorAll('.image-card:not([style*="display: none"])');
        imageCounter.textContent = visibleCards.length;
        countersStorage.imageCount = visibleCards.length;

        let visibleLikes = 0;
        visibleCards.forEach(card => {
            const likeBtn = card.querySelector('.like-btn');
            if (likeBtn && likeBtn.classList.contains('liked')) {
                visibleLikes++;
            }
        });
        totalLikes.textContent = visibleLikes;
        countersStorage.totalLikes = visibleLikes;

        localStorage.setItem('galleryCounters', JSON.stringify(countersStorage));
    }

    function toggleLike(button, imageId) {
        const countElement = button.querySelector('.like-count');

        if (button.classList.contains('liked')) {
            if (countElement) countElement.textContent = 0;
            button.classList.remove('liked');
            delete likesStorage[imageId];
        } else {
            if (countElement) countElement.textContent = 1;
            button.classList.add('liked');
            likesStorage[imageId] = 1;
        }

        localStorage.setItem('galleryLikes', JSON.stringify(likesStorage));
    }

    function switchView(view) {
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.classList.toggle('active', view === 'grid');
            listViewBtn.classList.toggle('active', view === 'list');
        }
        gallery.className = view === 'grid' ? 'gallery-grid grid-view' : 'gallery-grid list-view';
    }

    function loadLikes() {
        Object.keys(likesStorage).forEach(imageId => {
            const button = gallery.querySelector(`.like-btn[data-id="${imageId}"]`);
            if (button) {
                button.classList.add('liked');
                const countElement = button.querySelector('.like-count');
                if (countElement) {
                    countElement.textContent = likesStorage[imageId];
                }
            }
        });
    }

    function loadCounters() {
        imageCounter.textContent = countersStorage.imageCount;
        totalLikes.textContent = countersStorage.totalLikes;
    }

    function highlightActiveFilterButton() {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`.filter-btn[data-genre="${currentGenre}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    function initCounters() {
        const allCards = gallery.querySelectorAll('.image-card');
        countersStorage.imageCount = allCards.length;

        let totalLikesCount = 0;
        allCards.forEach(card => {
            const likeBtn = card.querySelector('.like-btn');
            if (likeBtn && likeBtn.classList.contains('liked')) {
                totalLikesCount++;
            }
        });
        countersStorage.totalLikes = totalLikesCount;

        localStorage.setItem('galleryCounters', JSON.stringify(countersStorage));
        updateCounters();
    }

    const resetFiltersBtn = document.querySelector('.reset-filters-btn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            isFavoritesMode = false;
            currentGenre = 'all';

            filterGallery('all');
            highlightActiveFilterButton();

            localStorage.removeItem('currentGenre');
            localStorage.removeItem('activeTab');

            updateCounters();

            filterMenu.style.display = 'none';
            if (filtersBtn) filtersBtn.classList.remove('active');
        });
    }

    initCounters();
});