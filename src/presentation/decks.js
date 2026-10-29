// Slide and deck IDs are stable keys for routes, feedback and analytics; never derive them from order.
const MVP_SLIDES = [
  {
    id: 'intro',
    title: 'Təqdimata başlamazdan əvvəl',
    summary:
      'Növbəti slaydlarda Tabia Guest-in ilk interaktiv versiyasını görəcəksiniz. Bu, son məhsul deyil, sizinlə birlikdə formalaşdıracağımız başlanğıcdır.',
    featureIds: [],
    layout: 'intro',
    short: true,
    // Intro pages are not counted in "N / total" and collect no feedback.
    numbered: false,
    feedback: false,
  },
  {
    id: 'intro-feedback',
    title: 'Rəyinizi necə bildirə bilərsiniz',
    summary:
      'Hər məhsul slaydının aşağı sağ küncündə rəy düymələri var. Rəyi kimin görəcəyini (yalnız Developer Team və ya PIN ilə daxil olan hər kəs) giriş zamanı seçirsiniz və rəy formasında dəyişə bilərsiniz.',
    featureIds: [],
    layout: 'intro-feedback',
    short: true,
    numbered: false,
    feedback: false,
  },
  {
    id: 'overview',
    title: 'Məhsulun təqdimatı',
    summary:
      'Qonaq ana səhifəsi və xidmətlərə qısa baxış. Tətbiq yalnız qonağın rezervasiyası olan otelin məlumatlarını göstərir: xidmətlər, restoranlar, əyləncə, proqram və bildirişlər həmin otelə aiddir. Bu demoda otel Shamakhi Palace Sharadil-dir.',
    featureIds: [],
    layout: 'phone',
    short: true,
  },
  {
    id: 'onboarding-local',
    title: 'Yerli vətəndaşın qeydiyyatı',
    summary:
      'Dil seçimi, giriş, MyGov ilə FIN üzrə məlumatların alınması və yoxlanması.',
    featureIds: [],
    layout: 'phone',
    short: true,
  },
  {
    id: 'onboarding-foreign',
    title: 'Xarici vətəndaşın qeydiyyatı',
    summary:
      'Pasportun skanı, OCR nəticəsinin düzəldilməsi və əl ilə doldurma.',
    featureIds: [],
    layout: 'phone',
    short: false,
  },
  {
    id: 'reservation-checkin',
    title: 'Rezervasiya və check-in',
    summary:
      'Rezervasiya kodu, gəliş və çıxış vaxtı, online check-in, otaq hazırdır bildirişi.',
    featureIds: [1, 2, 3, 5],
    layout: 'phone',
    short: false,
  },
  {
    id: 'stay-management',
    title: 'Qalma müddətinin idarəsi',
    summary: 'Erkən giriş, gec çıxış, uzatma və otaq dəyişikliyi sorğuları.',
    featureIds: [6, 7, 8, 9],
    layout: 'phone',
    short: false,
  },
  {
    id: 'chat',
    title: 'Chatbot və canlı chat',
    summary:
      'Tərcüməli mesajlar, orijinal mətn, əməkdaşa keçid və chatdan sorğu.',
    featureIds: [11, 12, 13, 14, 15, 16],
    layout: 'phone',
    short: true,
  },
  {
    id: 'food-order',
    title: 'Yemək sifarişi',
    summary:
      'Menyu, məhsul, səbət, QR ilə çatdırılma yeri və sifarişin statusu.',
    featureIds: [21, 22, 23, 24],
    layout: 'phone',
    short: true,
  },
  {
    id: 'room-services',
    title: 'Otaq xidmətləri və icra',
    summary:
      'Təmizlik, “Narahat etməyin”, dəsmal, ütü, camaşırxana, oyandırma və nasazlıq.',
    featureIds: [17, 18, 19, 20, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    layout: 'phone',
    short: false,
  },
  {
    id: 'restaurant-spa',
    title: 'Restoran və spa',
    summary: 'Xidmət, gün və saat seçimi, sorğu və təsdiq.',
    featureIds: [25, 26, 27],
    layout: 'phone',
    short: false,
  },
  {
    id: 'transport',
    title: 'Nəqliyyat və baqaj',
    summary: 'Taksi, hava limanı transferi, tur, vale və baqaj sorğuları.',
    featureIds: [41, 42, 43, 45, 46],
    layout: 'phone',
    short: false,
  },
  {
    id: 'program-package',
    title: 'Otel proqramı və paket',
    summary:
      'Günün proqramı, iş saatları, paketə daxil olan və ödənişli xidmətlər.',
    featureIds: [40, 51, 52, 53],
    layout: 'phone',
    short: false,
  },
  {
    id: 'family-social',
    title: 'Ailə və sosial imkanlar',
    summary:
      'Ailə qrupu, icazəli canlı video, fəaliyyət qrupu yaratmaq və qoşulmaq.',
    featureIds: [56, 59, 60, 61],
    layout: 'phone',
    short: false,
  },
  {
    id: 'loyalty',
    title: 'Loyalty',
    summary: 'Bonus balansı, qazanma, istifadə və fərdi kampaniyalar.',
    featureIds: [69, 70, 71],
    layout: 'phone',
    short: false,
  },
  {
    id: 'checkout',
    title: 'Xərclər və checkout',
    summary:
      'Xərclər, otağa yazdırma, bonus, bəxşiş, ödəniş, checkout və qəbz.',
    featureIds: [10, 72, 73, 75, 76, 77, 80, 81, 95],
    layout: 'phone',
    short: true,
  },
  {
    id: 'feedback',
    title: 'Rəy və sonrakı əlaqə',
    summary: 'Reytinq, şikayət, həllin təsdiqi və itirilmiş əşya müraciəti.',
    featureIds: [65, 66, 67, 68, 87, 88],
    layout: 'phone',
    short: false,
  },
  {
    id: 'hotel-admin',
    title: 'Otel paneli: əməliyyatlar',
    summary:
      'Telefonda yaranan sorğu paneldə görünür, status dəyişir və qonağa çatır.',
    featureIds: [],
    layout: 'admin-phone',
    short: true,
  },
  {
    id: 'crm',
    title: 'CRM',
    summary: 'Eyni qonağın profili, tarixçəsi, qeydləri və bonusu.',
    featureIds: [],
    layout: 'admin-phone',
    short: false,
  },
  {
    id: 'reporting',
    title: 'Hesabatlar',
    summary: 'Demo əməliyyatlarından göstəricilər, filtrlər və ixrac.',
    featureIds: [],
    layout: 'admin-phone',
    short: true,
  },
]

export const DECKS = [
  {
    id: 'mvp',
    title: 'MVP/Demo',
    description:
      'Qonaq tətbiqinin, otel panelinin, CRM və hesabatların interaktiv ssenariləri.',
    slides: MVP_SLIDES,
  },
  {
    id: 'icra-plani',
    title: 'İcra planı və İnteqrasiya',
    description:
      'Opera PMS, POS, ödəniş, MyGov və OCR asılılıqları, pilot və istifadəyə keçid.',
    slides: [],
  },
  {
    id: 'elave-teklifler',
    title: 'Əlavə Təkliflər',
    description:
      'MVP-yə daxil olmayan funksiyalar və ideyalar. Hansının vacib olduğunu siz seçirsiniz.',
    slides: [],
  },
  {
    id: 'portfolio',
    title: 'Portfoliomuz',
    description: 'Developer Team-in real layihələri.',
    slides: [],
  },
  {
    id: 'qiymetler',
    title: 'Qiymətlər',
    description: 'Qurulum, aylıq xidmət, modullar və dəstək strukturu.',
    slides: [],
  },
]

export const TOURS = {
  full: 'tam',
  short: 'qisa',
}

export function getDeck(deckId) {
  return DECKS.find((deck) => deck.id === deckId)
}

export function isDeckReady(deck) {
  return deck.slides.length > 0
}

export function getTourSlides(deck, tour) {
  return tour === TOURS.short
    ? deck.slides.filter((slide) => slide.short)
    : deck.slides
}

const isNumbered = (slide) => slide.numbered !== false

export function countNumbered(slides) {
  return slides.filter(isNumbered).length
}

// 1-based number among numbered slides; null for unnumbered ones such as the intro.
export function slideNumber(slides, index) {
  if (!isNumbered(slides[index])) return null
  return countNumbered(slides.slice(0, index + 1))
}

export function readTour(searchParams) {
  return searchParams.get('tur') === TOURS.short ? TOURS.short : TOURS.full
}

export function slideHref(deckId, slideId, searchParams) {
  const query = searchParams?.toString()
  return `/${deckId}/${slideId}${query ? `?${query}` : ''}`
}

export function tourHref(deck, tour, currentSlideId, searchParams) {
  const params = new URLSearchParams(searchParams)
  if (tour === TOURS.short) params.set('tur', TOURS.short)
  else params.delete('tur')
  const slides = getTourSlides(deck, tour)
  const target =
    slides.find((slide) => slide.id === currentSlideId) ?? slides[0]
  return slideHref(deck.id, target.id, params)
}
