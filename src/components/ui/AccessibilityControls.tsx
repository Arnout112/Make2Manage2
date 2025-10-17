import { useState, useEffect, useRef } from 'react'
import { Eye, Volume2, VolumeX, Keyboard, MousePointer, Settings, Moon, Sun, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface AccessibilityProps {
  onToggleHighContrast?: (enabled: boolean) => void
  onToggleDarkMode?: (enabled: boolean) => void
  onToggleReducedMotion?: (enabled: boolean) => void
  onToggleScreenReader?: (enabled: boolean) => void
  onZoomChange?: (level: number) => void
  onToggleKeyboardNav?: (enabled: boolean) => void
}

interface AccessibilitySettings {
  highContrast: boolean
  darkMode: boolean
  reducedMotion: boolean
  screenReaderMode: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  zoomLevel: number
  keyboardNavigation: boolean
  audioFeedback: boolean
  focusVisible: boolean
  colorBlindSupport: boolean
}

export default function AccessibilityControls({
  onToggleHighContrast,
  onToggleDarkMode,
  onToggleReducedMotion,
  onToggleScreenReader,
  onZoomChange,
  onToggleKeyboardNav
}: AccessibilityProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
    screenReaderMode: false,
    fontSize: 'medium',
    zoomLevel: 100,
    keyboardNavigation: true,
    audioFeedback: false,
    focusVisible: true,
    colorBlindSupport: false
  })
  
  const panelRef = useRef<HTMLDivElement>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        applyAccessibilitySettings(parsed)
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    applyAccessibilitySettings(settings)
  }, [settings])

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement

    // Apply high contrast using CSS custom properties
    if (newSettings.highContrast) {
      root.style.setProperty('--tw-bg-opacity', '1')
      root.style.setProperty('--accessibility-mode', 'high-contrast')
      root.classList.add('accessibility-high-contrast')
    } else {
      root.classList.remove('accessibility-high-contrast')
    }

    // Apply dark mode (Tailwind native support)
    if (newSettings.darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply reduced motion using CSS custom properties
    if (newSettings.reducedMotion) {
      root.style.setProperty('--tw-animate-spin', 'none')
      root.style.setProperty('--tw-animate-pulse', 'none')
      root.style.setProperty('--tw-animate-bounce', 'none')
      root.classList.add('accessibility-reduce-motion')
    } else {
      root.classList.remove('accessibility-reduce-motion')
      root.style.removeProperty('--tw-animate-spin')
      root.style.removeProperty('--tw-animate-pulse')
      root.style.removeProperty('--tw-animate-bounce')
    }

    // Apply font size using CSS custom properties
    const fontSizeMap = {
      'small': '0.75rem',
      'medium': '0.875rem',
      'large': '1.125rem',
      'extra-large': '1.5rem'
    }
    root.style.setProperty('--accessibility-base-font-size', fontSizeMap[newSettings.fontSize])
    root.classList.remove('accessibility-font-small', 'accessibility-font-medium', 'accessibility-font-large', 'accessibility-font-extra-large')
    root.classList.add(`accessibility-font-${newSettings.fontSize}`)

    // Apply zoom level
    if (newSettings.zoomLevel !== 100) {
      root.style.setProperty('--accessibility-zoom', `${newSettings.zoomLevel}%`)
      root.style.zoom = `${newSettings.zoomLevel}%`
    } else {
      root.style.removeProperty('--accessibility-zoom')
      root.style.zoom = ''
    }

    // Apply enhanced focus indicators
    if (newSettings.focusVisible) {
      root.classList.add('accessibility-focus-visible')
    } else {
      root.classList.remove('accessibility-focus-visible')
    }

    // Apply color blind support using CSS filters
    if (newSettings.colorBlindSupport) {
      root.style.setProperty('--accessibility-filter', 'contrast(1.2) saturate(1.3)')
      root.classList.add('accessibility-colorblind-support')
    } else {
      root.style.removeProperty('--accessibility-filter')
      root.classList.remove('accessibility-colorblind-support')
    }

    // Notify parent components of changes
    onToggleHighContrast?.(newSettings.highContrast)
    onToggleDarkMode?.(newSettings.darkMode)
    onToggleReducedMotion?.(newSettings.reducedMotion)
    onToggleScreenReader?.(newSettings.screenReaderMode)
    onZoomChange?.(newSettings.zoomLevel)
    onToggleKeyboardNav?.(newSettings.keyboardNavigation)
  }

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      darkMode: false,
      reducedMotion: false,
      screenReaderMode: false,
      fontSize: 'medium',
      zoomLevel: 100,
      keyboardNavigation: true,
      audioFeedback: false,
      focusVisible: true,
      colorBlindSupport: false
    }
    setSettings(defaultSettings)
  }

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return

      // Global keyboard shortcuts
      if (e.altKey && e.key === 'a') {
        e.preventDefault()
        setIsOpen(!isOpen)
        return
      }

      // Focus management within panel
      if (isOpen && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const currentIndex = Array.from(focusableElements).findIndex(
          el => el === document.activeElement
        )

        if (e.key === 'Escape') {
          setIsOpen(false)
        } else if (e.key === 'Tab') {
          // Handle Tab navigation within panel
          if (e.shiftKey && currentIndex === 0) {
            e.preventDefault()
            ;(focusableElements[focusableElements.length - 1] as HTMLElement).focus()
          } else if (!e.shiftKey && currentIndex === focusableElements.length - 1) {
            e.preventDefault()
            ;(focusableElements[0] as HTMLElement).focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [settings.keyboardNavigation, isOpen])

  // Screen reader announcements
  const announceChange = (message: string) => {
    if (settings.screenReaderMode) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    }
  }

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300 touch-target"
        aria-label={`${isOpen ? 'Close' : 'Open'} accessibility controls`}
        aria-expanded={isOpen}
        title="Accessibility Settings (Alt+A)"
      >
        <Settings size={24} />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div
            ref={panelRef}
            className="fixed top-16 right-4 w-96 max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="accessibility-title"
            aria-modal="true"
          >
            <div className="p-6">
              <h2 id="accessibility-title" className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Accessibility Settings
              </h2>

              <div className="space-y-6">
                {/* Visual Settings */}
                <section>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Visual Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="high-contrast" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Eye className="mr-2" size={16} />
                        High Contrast Mode
                      </label>
                      <button
                        id="high-contrast"
                        onClick={() => {
                          updateSetting('highContrast', !settings.highContrast)
                          announceChange(`High contrast mode ${!settings.highContrast ? 'enabled' : 'disabled'}`)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-target ${
                          settings.highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        aria-pressed={settings.highContrast}
                        role="switch"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="dark-mode" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        {settings.darkMode ? <Moon className="mr-2" size={16} /> : <Sun className="mr-2" size={16} />}
                        Dark Mode
                      </label>
                      <button
                        id="dark-mode"
                        onClick={() => {
                          updateSetting('darkMode', !settings.darkMode)
                          announceChange(`Dark mode ${!settings.darkMode ? 'enabled' : 'disabled'}`)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-target ${
                          settings.darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                        aria-pressed={settings.darkMode}
                        role="switch"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="colorblind-support" className="flex items-center text-sm font-medium text-gray-700">
                        <Eye className="mr-2" size={16} />
                        Color Blind Support
                      </label>
                      <button
                        id="colorblind-support"
                        onClick={() => {
                          updateSetting('colorBlindSupport', !settings.colorBlindSupport)
                          announceChange(`Color blind support ${!settings.colorBlindSupport ? 'enabled' : 'disabled'}`)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.colorBlindSupport ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-pressed={settings.colorBlindSupport}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.colorBlindSupport ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size
                      </label>
                      <select
                        id="font-size"
                        value={settings.fontSize}
                        onChange={(e) => {
                          updateSetting('fontSize', e.target.value as AccessibilitySettings['fontSize'])
                          announceChange(`Font size changed to ${e.target.value}`)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="extra-large">Extra Large</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="zoom-level" className="block text-sm font-medium text-gray-700 mb-2">
                        Zoom Level: {settings.zoomLevel}%
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            const newZoom = Math.max(50, settings.zoomLevel - 10)
                            updateSetting('zoomLevel', newZoom)
                            announceChange(`Zoom level decreased to ${newZoom} percent`)
                          }}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Decrease zoom"
                        >
                          <ZoomOut size={16} />
                        </button>
                        <input
                          id="zoom-level"
                          type="range"
                          min="50"
                          max="200"
                          step="10"
                          value={settings.zoomLevel}
                          onChange={(e) => {
                            const newZoom = parseInt(e.target.value)
                            updateSetting('zoomLevel', newZoom)
                          }}
                          className="flex-1"
                          aria-label="Zoom level slider"
                        />
                        <button
                          onClick={() => {
                            const newZoom = Math.min(200, settings.zoomLevel + 10)
                            updateSetting('zoomLevel', newZoom)
                            announceChange(`Zoom level increased to ${newZoom} percent`)
                          }}
                          className="p-2 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label="Increase zoom"
                        >
                          <ZoomIn size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Interaction Settings */}
                <section>
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Interaction Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="reduced-motion" className="flex items-center text-sm font-medium text-gray-700">
                        <MousePointer className="mr-2" size={16} />
                        Reduce Motion
                      </label>
                      <button
                        id="reduced-motion"
                        onClick={() => {
                          updateSetting('reducedMotion', !settings.reducedMotion)
                          announceChange(`Reduced motion ${!settings.reducedMotion ? 'enabled' : 'disabled'}`)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-pressed={settings.reducedMotion}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="keyboard-nav" className="flex items-center text-sm font-medium text-gray-700">
                        <Keyboard className="mr-2" size={16} />
                        Keyboard Navigation
                      </label>
                      <button
                        id="keyboard-nav"
                        onClick={() => {
                          updateSetting('keyboardNavigation', !settings.keyboardNavigation)
                          announceChange(`Keyboard navigation ${!settings.keyboardNavigation ? 'enabled' : 'disabled'}`)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.keyboardNavigation ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-pressed={settings.keyboardNavigation}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="screen-reader" className="flex items-center text-sm font-medium text-gray-700">
                        {settings.audioFeedback ? <Volume2 className="mr-2" size={16} /> : <VolumeX className="mr-2" size={16} />}
                        Audio Feedback
                      </label>
                      <button
                        id="screen-reader"
                        onClick={() => {
                          updateSetting('audioFeedback', !settings.audioFeedback)
                          announceChange(`Audio feedback ${!settings.audioFeedback ? 'enabled' : 'disabled'}`)
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.audioFeedback ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        aria-pressed={settings.audioFeedback}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.audioFeedback ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Reset Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      resetToDefaults()
                      announceChange('Accessibility settings reset to defaults')
                    }}
                    className="flex items-center justify-center w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <RotateCcw className="mr-2" size={16} />
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>

      {/* Screen reader only instructions */}
      <div className="sr-only">
        <p>This is an educational manufacturing simulation game. Use Tab to navigate between controls, Enter or Space to activate buttons, and arrow keys to navigate within components.</p>
        <p>Press Alt+A to open accessibility settings at any time.</p>
      </div>
    </>
  )
}
