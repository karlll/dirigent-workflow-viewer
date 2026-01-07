/**
 * Settings panel component for demo application
 */

import { useState } from 'react'

interface SettingsPanelProps {
  apiBaseUrl: string
  onApiBaseUrlChange: (url: string) => void
  onClose: () => void
}

const STORAGE_KEY = 'dirigent-demo-api-url'

export function SettingsPanel({
  apiBaseUrl,
  onApiBaseUrlChange,
  onClose,
}: SettingsPanelProps) {
  const [url, setUrl] = useState(apiBaseUrl)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, url)
    // Update parent
    onApiBaseUrlChange(url)
    // Show saved indicator
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      onClose()
    }, 1000)
  }

  const handleReset = () => {
    const defaultUrl = 'http://localhost:8080'
    setUrl(defaultUrl)
    localStorage.removeItem(STORAGE_KEY)
    onApiBaseUrlChange(defaultUrl)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          maxWidth: '500px',
          width: '90%',
          padding: '1.5rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '0.25rem',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              fontSize: '1.5rem',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="api-url"
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '0.5rem',
            }}
          >
            API Base URL
          </label>
          <input
            id="api-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8080"
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
          />
          <div
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              marginTop: '0.5rem',
            }}
          >
            The base URL of the Dirigent API server
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: '#374151',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: saved ? '#10b981' : '#3b82f6',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: 'white',
              transition: 'background-color 0.2s',
              minWidth: '80px',
            }}
            onMouseEnter={(e) => {
              if (!saved) {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }
            }}
            onMouseLeave={(e) => {
              if (!saved) {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }
            }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Load API URL from localStorage
 */
export function loadApiUrl(): string {
  return localStorage.getItem(STORAGE_KEY) || 'http://localhost:8080'
}
