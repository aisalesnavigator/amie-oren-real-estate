import { site } from '../config/site';
import { absoluteUrl } from './url';

/**
 * Truthful structured data only. We deliberately never emit: ratings, reviewCount,
 * priceRange, awards, credentials, address, or license information.
 */

const sameAs = site.socialProfiles.map((p) => p.url);

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${absoluteUrl('/')}#website`,
  url: absoluteUrl('/'),
  name: site.brand,
  description: site.description,
  inLanguage: 'en-US',
  publisher: { '@id': `${absoluteUrl('/')}#agent` },
});

export const personSchema = (imageUrl?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${absoluteUrl('/about/')}#amie`,
  name: site.name,
  jobTitle: site.professionalTitle,
  url: absoluteUrl('/about/'),
  email: site.contactEmail,
  ...(imageUrl ? { image: imageUrl } : {}),
  worksFor: { '@type': 'Organization', name: site.brokerage },
  knowsAbout: ['Residential real estate', 'Home selling', 'Home buying', 'Waterfront property', 'West Michigan communities'],
  ...(sameAs.length ? { sameAs } : {}),
});

export const agentSchema = (imageUrl?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',
  '@id': `${absoluteUrl('/')}#agent`,
  name: site.brand,
  url: absoluteUrl('/'),
  email: site.contactEmail,
  ...(site.phone ? { telephone: site.phone } : {}),
  ...(imageUrl ? { image: imageUrl } : {}),
  description: site.description,
  parentOrganization: { '@type': 'Organization', name: site.brokerage },
  founder: { '@id': `${absoluteUrl('/about/')}#amie` },
  areaServed: site.serviceAreas.map((a) => ({
    '@type': 'City',
    name: a.name,
    containedInPlace: { '@type': 'AdministrativeArea', name: 'Michigan' },
  })),
  ...(sameAs.length ? { sameAs } : {}),
});

export interface Crumb {
  name: string;
  href?: string;
}

export const breadcrumbSchema = (items: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    ...(item.href ? { item: absoluteUrl(item.href) } : {}),
  })),
});

export const faqSchema = (faq: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
});
