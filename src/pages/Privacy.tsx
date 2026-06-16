import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Card from '../components/Card'

export default function Privacy() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />
      <main className="flex-1 page-container py-16">
        <Card padding="lg" className="max-w-4xl mx-auto shadow-soft">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          <div className="prose prose-ink max-w-none text-ink-700">
            <p>
              {language === 'ar' 
                ? 'توضح سياسة الخصوصية هذه كيف نقوم بجمع واستخدام وحماية معلوماتك الشخصية. نحن نلتزم بحماية خصوصيتك وضمان أمان بياناتك.'
                : 'This Privacy Policy explains how we collect, use, and protect your personal information. We are committed to protecting your privacy and ensuring the security of your data.'}
            </p>
            {/* Add more privacy policy content here */}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
