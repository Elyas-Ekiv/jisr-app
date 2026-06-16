import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Card from '../components/Card'

export default function Terms() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />
      <main className="flex-1 page-container py-16">
        <Card padding="lg" className="max-w-4xl mx-auto shadow-soft">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">
            {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          <div className="prose prose-ink max-w-none text-ink-700">
            <p>
              {language === 'ar' 
                ? 'يرجى قراءة شروط الخدمة بعناية قبل استخدام منصتنا. باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط.'
                : 'Please read these Terms of Service carefully before using our platform. By using the platform, you agree to be bound by these terms.'}
            </p>
            {/* Add more terms content here */}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
