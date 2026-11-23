/** Cookie names shared by the BFF, proxy and tests (no secrets here). */
export const COOKIE_SESSION = "bs_session";
export const COOKIE_CART = "bs_cart";
export const COOKIE_LOCALE = "bs_locale";
export const orderTokenCookie = (orderNumber: string) => `bs_ot_${orderNumber}`;
