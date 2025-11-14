import { Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './LanguageSelector.css'

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'pt-BR' ? 'en-US' : 'pt-BR')
  }

  return (
    <button
      type="button"
      className="language-selector"
      onClick={toggleLanguage}
      aria-label="Change language"
      title={language === 'pt-BR' ? 'Change to English' : 'Mudar para Português'}
    >
      <Globe size={18} />
      <span className="language-code">{language === 'pt-BR' ? 'PT' : 'EN'}</span>
    </button>
  )
}

