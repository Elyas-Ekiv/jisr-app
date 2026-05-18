import type { ElementType } from 'react'
import { Link } from 'react-router-dom'
import { Twitter, Instagram, Linkedin, Facebook, Mail, Phone, MapPin } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

type FooterLinkRow = {
  label: string
  to: string
  /** Uses <a> instead of SPA <Link> (mailto:, http(s):, or anchor-only `#…`) */
  native?: boolean
}

export default function Footer() {
  const { settings } = useSiteSettings()
  const { branding, contact, flags } = settings
  const { language, isArabic } = useLanguage()

  const productLinks: FooterLinkRow[] = [
    { label: t(tr.footer.features, language), to: '/#features' },
    { label: t(tr.footer.howItWorks, language), to: '/#how-it-works' },
    ...(flags.showPricing ? [{ label: t(tr.footer.pricing, language), to: '/pricing' }] : []),
    ...(flags.showBlog ? [{ label: t(tr.footer.blog, language), to: '/blog' }] : []),
  ]

  const companyLinks: FooterLinkRow[] = []

  const legalLinks: FooterLinkRow[] = [
    { label: t(tr.footer.privacy, language), to: '/privacy' },
    { label: t(tr.footer.terms, language), to: '/terms' },
    { label: t(tr.footer.accessibility, language), to: '/accessibility' },
  ]

  const socials: { label: string; icon: ElementType; href?: string }[] = [
    { label: 'Twitter', icon: Twitter, href: contact.twitter },
    { label: 'Instagram', icon: Instagram, href: contact.instagram },
    { label: 'Facebook', icon: Facebook, href: contact.facebook },
    { label: 'LinkedIn', icon: Linkedin, href: contact.linkedin },
  ]

  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="page-container py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <Link to="/" className="inline-flex items-center">
              <span className="grid h-16 w-16 md:h-[4.75rem] md:w-[4.75rem] place-items-center rounded-xl bg-primary-600 shadow-soft overflow-hidden">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt={branding.siteName} className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={isArabic ? '/logos/JisrApp-12.png' : '/logos/JisrApp-11.png'}
                    alt={branding.siteName}
                    className="h-11 w-auto md:h-12"
                  />
                )}
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-600">{branding.tagline}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 shadow-soft transition-colors hover:bg-ink-50"
                >
                  <Mail className="h-4 w-4 text-primary-600" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 shadow-soft transition-colors hover:bg-ink-50"
                >
                  <Phone className="h-4 w-4 text-primary-600" />
                  {contact.phone}
                </a>
              )}
              {contact.address && (
                <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-700 shadow-soft">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  {contact.address}
                </span>
              )}
            </div>
          </div>

          <FooterColumn title={t(tr.footer.product, language)} links={productLinks} />
          {companyLinks.length > 0 && <FooterColumn title={t(tr.footer.company, language)} links={companyLinks} />}
          <FooterColumn title={t(tr.footer.legal, language)} links={legalLinks} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-xs text-ink-500">
            © {new Date().getFullYear()} {branding.siteName}. {t(tr.footer.allRights, language)}
          </p>
          <div className="flex items-center gap-1.5">
            {socials
              .filter((s) => s.href)
              .map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

interface ColumnProps {
  title: string
  links: FooterLinkRow[]
}

function FooterColumn({ title, links }: ColumnProps) {
  return (
    <div className="col-span-1 md:col-span-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            {link.native || /^https?:/i.test(link.to) ? (
              <a href={link.to} className="text-sm text-ink-700 transition-colors hover:text-primary-700">
                {link.label}
              </a>
            ) : (
              <Link 
                to={link.to} 
                className="text-sm text-ink-700 transition-colors hover:text-primary-700"
                onClick={(e) => {
                  if (link.to.includes('#')) {
                    e.preventDefault();
                    window.location.href = link.to;
                  }
                }}
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
