/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_FORM_ENDPOINT?: string;
  readonly PUBLIC_REVIEW_FORM_ENDPOINT?: string;
  readonly PUBLIC_SHOW_SAMPLE_REVIEWS?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
