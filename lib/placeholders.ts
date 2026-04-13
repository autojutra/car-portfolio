export function createCarSvg(
  body: string,
  detail: string,
  background: string,
) {
  const svg = `
    <svg width="1200" height="720" viewBox="0 0 1200 720" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="720" rx="48" fill="${background}" />
      <ellipse cx="600" cy="612" rx="330" ry="28" fill="rgba(255,255,255,0.12)" />
      <path d="M243 446C272 372 349 313 442 286H732C822 286 914 343 966 418L1018 491H180L243 446Z" fill="${body}" />
      <path d="M401 305C448 252 506 223 571 223H739C793 223 841 248 877 295L929 369H345L401 305Z" fill="rgba(255,255,255,0.14)" />
      <path d="M339 380H927L985 475H222L339 380Z" fill="${body}" />
      <path d="M385 329H580C640 329 687 338 721 361H346L385 329Z" fill="${detail}" />
      <path d="M742 329H852C891 329 925 342 954 361H778L742 329Z" fill="${detail}" />
      <circle cx="373" cy="496" r="73" fill="#111111" />
      <circle cx="373" cy="496" r="39" fill="${detail}" />
      <circle cx="862" cy="496" r="73" fill="#111111" />
      <circle cx="862" cy="496" r="39" fill="${detail}" />
      <rect x="188" y="470" width="832" height="22" rx="11" fill="rgba(255,255,255,0.13)" />
      <rect x="879" y="398" width="92" height="20" rx="10" fill="rgba(255,255,255,0.22)" />
      <rect x="224" y="410" width="82" height="18" rx="9" fill="rgba(255,255,255,0.16)" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
