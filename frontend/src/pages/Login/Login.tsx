import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'
import logo from '../../assets/icon.png'

type FormErrors = {
  username?: string
  password?: string
  global?: string
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  function handleUsernameChange(event: ChangeEvent<HTMLInputElement>) {
    setUsername(event.target.value)
    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }))
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>) {
    setPassword(event.target.value)
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
  }

  function validate(): FormErrors {
    const nextErrors: FormErrors = {}
    if (!username.trim()) nextErrors.username = 'Informe o usuário.'
    if (!password.trim()) nextErrors.password = 'Informe a senha.'
    return nextErrors
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setErrors({})
    const validation = validate()
    if (validation.username || validation.password) {
      setErrors(validation)
      return
    }
    try {
      setIsSubmitting(true)
      // Simulação de login (sem backend)
      await new Promise((resolve) => setTimeout(resolve, 600))
      // Como não há backend, se houver valores preenchidos simulamos sucesso
      navigate('/dashboard', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card" role="region" aria-labelledby="login-title">
        <img src={logo} alt="Fazenda Imperial" className="login-logo" />
        <h1 id="login-title" className="login-title">Login</h1>

        {errors.global && (
          <div className="login-error" role="alert">
            {errors.global}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="username" className="form-label">Usuário</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Digite seu usuário"
              className={`form-input ${errors.username ? 'has-error' : ''}`}
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'username-error' : undefined}
              autoComplete="username"
            />
            {errors.username && (
              <span id="username-error" className="field-error" role="status">
                {errors.username}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Digite sua senha"
              className={`form-input ${errors.password ? 'has-error' : ''}`}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete="current-password"
            />
            {errors.password && (
              <span id="password-error" className="field-error" role="status">
                {errors.password}
              </span>
            )}
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <a className="forgot-link" href="#" onClick={(e) => e.preventDefault()}>
          Esqueceu a senha?
        </a>
      </div>
    </div>
  )
}


