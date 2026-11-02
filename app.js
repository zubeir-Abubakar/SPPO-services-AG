const translations = {
  en: {
    products: 'Products',
    company: 'Company',
    quality: 'Quality',
    sustainability: 'Sustainability',
    news: 'News',
    careers: 'Careers',
    contact: 'Contact',
    discover: 'Discover our products',
    contactTeam: 'Get in touch',
    headerTitle: 'Freshness without borders.',
    headerText: 'Connecting the world’s finest producers with customers through quality, expertise and lasting partnerships.',
    aboutTitle: 'Over 70 years of freshness, trust and expertise.',
    aboutBody: 'PPO Services AG brings together generations of produce expertise, long-standing grower relationships and a disciplined approach to global fresh fruit and vegetable trading.',
    ctaTitle: 'Let’s grow together.',
    ctaText: 'Whether you are a customer, producer or business partner, we would be pleased to hear from you.',
    contactButton: 'Contact our team'
  },
  de: {
    products: 'Produkte',
    company: 'Unternehmen',
    quality: 'Qualität',
    sustainability: 'Nachhaltigkeit',
    news: 'News',
    careers: 'Karriere',
    contact: 'Kontakt',
    discover: 'Produkte entdecken',
    contactTeam: 'Kontakt aufnehmen',
    headerTitle: 'Frische ohne Grenzen.',
    headerText: 'Wir verbinden die besten Produzenten mit Kunden durch Qualität, Fachwissen und langfristige Partnerschaften.',
    aboutTitle: 'Über 70 Jahre Frische, Vertrauen und Fachwissen.',
    aboutBody: 'PPO Services AG vereint Generationen von Obst- und Gemüsekundheit, langjährige Erzeugerverbindungen und einen disziplinierten Ansatz im internationalen Handel.',
    ctaTitle: 'Lassen Sie uns gemeinsam wachsen.',
    ctaText: 'Ob Kunde, Produzent oder Geschäftspartner – wir freuen uns auf Ihre Anfrage.',
    contactButton: 'Unser Team kontaktieren'
  },
  fr: {
    products: 'Produits',
    company: 'Entreprise',
    quality: 'Qualité',
    sustainability: 'Durabilité',
    news: 'Actualités',
    careers: 'Carrières',
    contact: 'Contact',
    discover: 'Découvrir nos produits',
    contactTeam: 'Nous contacter',
    headerTitle: 'La fraîcheur sans frontières.',
    headerText: 'Nous relions les meilleurs producteurs aux clients grâce à la qualité, l’expertise et des partenariats durables.',
    aboutTitle: 'Plus de 70 ans de fraîcheur, de confiance et d’expertise.',
    aboutBody: 'PPO Services AG réunit des générations d’expertise fruitière et légumière, des relations durables avec les producteurs et une approche rigoureuse du commerce international.',
    ctaTitle: 'Cultivons ensemble.',
    ctaText: 'Que vous soyez client, producteur ou partenaire commercial, notre équipe est à votre écoute.',
    contactButton: 'Contacter notre équipe'
  },
  it: {
    products: 'Prodotti',
    company: 'Azienda',
    quality: 'Qualità',
    sustainability: 'Sostenibilità',
    news: 'News',
    careers: 'Carriere',
    contact: 'Contatto',
    discover: 'Scopri i nostri prodotti',
    contactTeam: 'Contattaci',
    headerTitle: 'Freschezza senza confini.',
    headerText: 'Colleghiamo i migliori produttori ai clienti attraverso qualità, competenza e partnership durature.',
    aboutTitle: 'Oltre 70 anni di freschezza, fiducia e competenza.',
    aboutBody: 'PPO Services AG unisce generazioni di esperienza nel commercio di frutta e verdura, relazioni consolidate con i produttori e un approccio rigoroso al mercato globale.',
    ctaTitle: 'Cresciamo insieme.',
    ctaText: 'Che tu sia cliente, produttore o partner commerciale, saremo felici di sentirti.',
    contactButton: 'Contatta il nostro team'
  },
  es: {
    products: 'Productos',
    company: 'Empresa',
    quality: 'Calidad',
    sustainability: 'Sostenibilidad',
    news: 'Noticias',
    careers: 'Carreras',
    contact: 'Contacto',
    discover: 'Descubre nuestros productos',
    contactTeam: 'Ponte en contacto',
    headerTitle: 'Frescura sin fronteras.',
    headerText: 'Conectamos a los mejores productores con clientes gracias a la calidad, la experiencia y las alianzas duraderas.',
    aboutTitle: 'Más de 70 años de frescura, confianza y experiencia.',
    aboutBody: 'PPO Services AG reúne generaciones de experiencia en fruta y hortalizas, relaciones duraderas con productores y un enfoque disciplinado del comercio internacional.',
    ctaTitle: 'Crezcamos juntos.',
    ctaText: 'Ya sea cliente, productor o socio comercial, estaremos encantados de escucharle.',
    contactButton: 'Contacta con nuestro equipo'
  }
};

const selectedLang = localStorage.getItem('ppo-lang') || 'en';

function applyTranslations(lang) {
  const dict = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.dataset.i18n;
    const value = dict[key];
    if (value) node.textContent = value;
  });
}

function setLanguage(lang) {
  localStorage.setItem('ppo-lang', lang);
  applyTranslations(lang);
  document.querySelectorAll('.lang-option').forEach((btn) => {
    btn.classList.toggle('selected', btn.dataset.lang === lang);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(selectedLang);

  document.querySelectorAll('.lang-option').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  document.querySelectorAll('.lang-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const wrapper = trigger.closest('.lang-switcher');
      wrapper.classList.toggle('open');
    });
  });

  document.addEventListener('click', (event) => {
    const langSwitcher = event.target.closest('.lang-switcher');
    if (!langSwitcher) {
      document.querySelectorAll('.lang-switcher').forEach((item) => item.classList.remove('open'));
    }
  });

  const nav = document.querySelector('.site-header');
  document.querySelector('.mobile-toggle')?.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    const toggler = item.querySelector('.nav-link');
    if (toggler && item.querySelector('.dropdown-menu')) {
      toggler.addEventListener('click', (event) => {
        if (window.innerWidth <= 980) {
          event.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });

  document.querySelectorAll('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach((node) => node.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      document.querySelectorAll('.listing-card').forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? 'block' : 'none';
      });
    });
  });

  const enquiryType = document.getElementById('enquiry-type');
  const productFields = document.getElementById('product-fields');
  if (enquiryType && productFields) {
    const syncProductFields = () => {
      const visible = ['Product enquiry', 'Product specifications request'].includes(enquiryType.value);
      productFields.classList.toggle('hidden', !visible);
    };
    enquiryType.addEventListener('change', syncProductFields);
    syncProductFields();
  }

  const searchTrigger = document.querySelector('.search-trigger');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchData = [
    { title: 'Salads', url: 'products.html#salads', description: 'Fresh salads, endives and leafy produce.'},
    { title: 'Citrus', url: 'products.html#citrus', description: 'Oranges, lemons and premium citrus categories.'},
    { title: 'Berries', url: 'products.html#berries', description: 'Strawberries, blueberries and soft fruit lines.'},
    { title: 'Company', url: 'company.html', description: 'History, team and business overview.'},
    { title: 'Quality', url: 'quality.html', description: 'Certification, standards and assurance.'},
    { title: 'Sustainability', url: 'sustainability.html', description: 'Responsible sourcing and environmental initiatives.'},
    { title: 'News', url: 'news.html', description: 'Latest PPO stories and articles.'},
    { title: 'Contact', url: 'contact.html', description: 'Business enquiries and partnerships.'}
  ];

  function renderSearch(query) {
    const value = query.trim().toLowerCase();
    let results = searchData;
    if (value) {
      results = searchData.filter((item) => [item.title, item.description].join(' ').toLowerCase().includes(value));
    }
    if (!results.length) {
      searchResults.innerHTML = '<p style="margin:0; color:#5f5a54;">No results found.</p>';
      return;
    }
    searchResults.innerHTML = results.map((item) => `
      <a href="${item.url}">
        <strong>${item.title}</strong><br>
        <small>${item.description}</small>
      </a>
    `).join('');
  }

  searchTrigger?.addEventListener('click', () => {
    searchOverlay.classList.add('open');
    setTimeout(() => searchInput.focus(), 50);
    renderSearch('');
  });

  document.querySelector('.close-search')?.addEventListener('click', () => {
    searchOverlay.classList.remove('open');
  });

  searchInput?.addEventListener('input', (event) => renderSearch(event.target.value));
  searchOverlay?.addEventListener('click', (event) => {
    if (event.target === searchOverlay) searchOverlay.classList.remove('open');
  });

  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookies = document.getElementById('accept-cookies');
  if (cookieBanner && !localStorage.getItem('ppo-cookie-choice')) {
    cookieBanner.classList.add('show');
  }
  acceptCookies?.addEventListener('click', () => {
    localStorage.setItem('ppo-cookie-choice', 'accepted');
    cookieBanner.classList.remove('show');
  });
});
