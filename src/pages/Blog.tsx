import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, User, BookOpen } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Skeleton from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { publicSiteService, BlogPost } from '../services/adminService'
import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'

export default function Blog() {
  const { language } = useLanguage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<string>('All')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await publicSiteService.listBlogPosts()
        if (!cancelled) setPosts(data)
      } catch {
        if (!cancelled) setPosts([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set<string>(['All'])
    posts.forEach((p) => set.add(p.category))
    return Array.from(set)
  }, [posts])

  const filtered = useMemo(
    () => (active === 'All' ? posts : posts.filter((p) => p.category === active)),
    [active, posts]
  )

  return (
    <div className="min-h-screen bg-brand-surface">
      <Navbar />

      <section className="border-b border-ink-100 bg-white">
        <div className="page-container py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Badge variant="primary">{t(tr.blogPage.eyebrow, language)}</Badge>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
              {t(tr.blogPage.title, language)}
            </h1>
            <p className="mt-4 text-lg text-ink-600">
              {t(tr.blogPage.subtitle, language)}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="page-container">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8 text-ink-400" />}
              title={t(tr.blogPage.emptyTitle, language)}
              description={t(tr.blogPage.emptyDesc, language)}
            />
          ) : (
            <>
              <div className="mb-8 flex flex-wrap justify-center gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActive(c)}
                    className={[
                      'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                      active === c
                        ? 'bg-ink-900 text-white shadow-soft'
                        : 'bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-100',
                    ].join(' ')}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="block h-full">
                    <Card padding="md" hover className="h-full">
                      <div className="mb-3 flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 via-white to-accent-50 ring-1 ring-ink-100 overflow-hidden">
                        {post.coverImageUrl ? (
                          <img
                            src={post.coverImageUrl}
                            alt={language === 'ar' ? post.titleAr || post.title : post.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-5xl" aria-hidden>
                            {post.emoji || '📝'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary" size="sm">
                          {post.category}
                        </Badge>
                        {post.featured && (
                          <Badge variant="sunny" size="sm">{t(tr.blogPage.featured, language)}</Badge>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-ink-900">{language === 'ar' ? post.titleAr || post.title : post.title}</h3>
                      <p className="mt-1.5 line-clamp-3 text-sm text-ink-600">{language === 'ar' ? post.excerptAr || post.excerpt : post.excerpt}</p>

                      <div className="mt-4 flex items-center gap-4 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {post.authorName}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Card>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
