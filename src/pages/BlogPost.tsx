import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User as UserIcon } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Badge from '../components/Badge'
import Skeleton from '../components/Skeleton'
import { publicSiteService, BlogPost } from '../services/adminService'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

export default function BlogPostPage() {
  const { language } = useLanguage()
  const { slug = '' } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!slug) {
      setLoading(false)
      setError('Missing article link.')
      return
    }
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await publicSiteService.getBlogPost(slug)
        if (!cancelled) setPost(data)
      } catch {
        if (!cancelled) {
          setPost(null)
          setError('This article could not be found.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const dateStr = post
    ? new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
        dateStyle: 'long',
      })
    : ''

  return (
    <div className="min-h-screen bg-brand-surface">
      <Navbar />

      <article className="border-b border-ink-100 bg-white">
        <div className="page-container py-10 lg:py-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700 hover:text-primary-800 mb-8"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> {t(tr.blogPage.back, language)}
          </Link>

          {loading ? (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
              <Skeleton className="h-64 w-full max-w-xl rounded-3xl lg:sticky lg:top-24 lg:self-start" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          ) : error || !post ? (
            <p className="text-center text-ink-600 py-16">{error || t(tr.blogPage.notFound, language)}</p>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14"
            >
              <div className="w-full lg:max-w-md lg:flex-shrink-0 lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary-50 via-white to-accent-50 shadow-card ring-1 ring-ink-100 aspect-[4/3] lg:aspect-square flex items-center justify-center">
                  {post.coverImageUrl ? (
                    <img
                      src={post.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-7xl md:text-8xl" aria-hidden>
                      {post.emoji || '📝'}
                    </span>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {post.category}
                  </Badge>
                  {post.featured && (
                    <Badge variant="sunny" size="sm">
                      {t(tr.blogPage.featured, language)}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-[2.65rem] leading-tight">
                  {language === 'ar' ? post.titleAr || post.title : post.title}
                </h1>
                <p className="mt-4 text-lg text-ink-600 leading-relaxed">{language === 'ar' ? post.excerptAr || post.excerpt : post.excerpt}</p>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 shrink-0" />
                    {post.authorName}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {dateStr}
                  </span>
                </div>

                <div className="mt-10 space-y-4 text-[1.0625rem] leading-relaxed text-ink-700">
                  {(language === 'ar' ? post.contentAr || post.content : post.content).split(/\n\n+/).map((para, idx) => (
                    <p key={idx} className="whitespace-pre-wrap">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </article>

      <Footer />
    </div>
  )

}
