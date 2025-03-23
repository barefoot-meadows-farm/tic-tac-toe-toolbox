// Analytics utility for managing Google Analytics and Tag Manager

// Types for analytics events
type GameEvent = {
  gameId: string;
  variant: string;
  opponent: 'ai' | 'human';
  difficulty?: 'easy' | 'medium' | 'hard';
};

type PremiumEvent = {
  feature: string;
  action: 'view' | 'purchase' | 'activate';
};

// Initialize Google Tag Manager
export const initGTM = (gtmId: string): void => {
  const script = document.createElement('script');
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
  document.head.appendChild(script);

  // Add GTM noscript iframe
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.appendChild(noscript);
};

// Track game start
export const trackGameStart = (event: GameEvent): void => {
  window.dataLayer?.push({
    event: 'game_start',
    gameId: event.gameId,
    variant: event.variant,
    opponent: event.opponent,
    difficulty: event.difficulty
  });
};

// Track game completion
export const trackGameComplete = (event: GameEvent & { result: 'win' | 'loss' | 'draw' }): void => {
  window.dataLayer?.push({
    event: 'game_complete',
    gameId: event.gameId,
    variant: event.variant,
    opponent: event.opponent,
    difficulty: event.difficulty,
    result: event.result
  });
};

// Track premium feature interactions
export const trackPremiumFeature = (event: PremiumEvent): void => {
  window.dataLayer?.push({
    event: 'premium_feature',
    feature: event.feature,
    action: event.action
  });
};

// Track page views
export const trackPageView = (path: string, title: string): void => {
  window.dataLayer?.push({
    event: 'page_view',
    page_path: path,
    page_title: title
  });
};