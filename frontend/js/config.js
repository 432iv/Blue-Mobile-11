/* ============================================================
   BLUE MOBILE — API CONFIGURATION (production)
   ------------------------------------------------------------
   This file is the ONLY place you configure where the frontend
   finds the backend API. It is loaded before js/api.js.

   1) SAME-ORIGIN DEPLOYMENT (recommended & simplest):
      The backend (Express) also serves this frontend, so the API
      lives at the same address as this page. Leave the value "":

        window.BLUE_MOBILE_API_BASE = "";

   2) SPLIT DEPLOYMENT (frontend on Netlify, backend elsewhere):
      Set the FULL backend URL including /api (no trailing slash):

        window.BLUE_MOBILE_API_BASE = "https://blue-mobile-api.onrender.com/api";

      Then also set FRONTEND_URL on the backend to this site's URL
      (e.g. https://blue-mobile.netlify.app) so CORS accepts it.

   Do NOT add a trailing slash. Do NOT put localhost here in
   production — use your real backend domain.
   ============================================================ */
window.BLUE_MOBILE_API_BASE = "";
