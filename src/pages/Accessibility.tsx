import { useLanguage } from '../context/LanguageContext'
import { tr, t } from '../i18n/translations'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Card from '../components/Card'

export default function Accessibility() {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />
      <main className="flex-1 page-container py-16">
        <Card padding="lg" className="max-w-4xl mx-auto shadow-soft">
          <h1 className="text-3xl font-bold text-ink-900 mb-6">
            {language === 'ar' ? 'إمكانية الوصول' : 'Accessibility Statement'}
          </h1>
          <div className="prose prose-ink max-w-none text-ink-700">
            <p>
              {language === 'ar' 
                ? 'نحن ملتزمون بضمان إمكانية الوصول الرقمي للأشخاص ذوي الإعاقة. نحن نعمل باستمرار على تحسين تجربة المستخدم للجميع وتطبيق معايير إمكانية الوصول ذات الصلة.'
                : 'We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.'}
            </p>
            {/* Add more accessibility content here */}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
