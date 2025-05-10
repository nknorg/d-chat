import { logger } from '@d-chat/core'

type Translator = {
  translate(text: string): Promise<string>
}

type TranslatorConstructor = {
  create(options: { sourceLanguage: string; targetLanguage: string; monitor?: (m: any) => void }): Promise<Translator>
}

type LanguageDetector = {
  ready: Promise<void>
}

type LanguageDetectorConstructor = {
  create(options?: { monitor?: (m: any) => void }): Promise<LanguageDetector>
  availability(): Promise<'available' | 'unavailable' | 'downloadable'>
}

declare global {
  let Translator: TranslatorConstructor
  let LanguageDetector: LanguageDetectorConstructor
}

export class AiTranslator {
  private static instance: AiTranslator | null = null

  public static getInstance(): AiTranslator | null {
    if ('Translator' in self) {
      if (!AiTranslator.instance) {
        AiTranslator.instance = new AiTranslator()
      }
      return AiTranslator.instance
    } else {
      return null
    }
  }

  async translate(text: string, options?: { sourceLanguage?: string; targetLanguage?: string }) {
    options = options || {}
    if (options.sourceLanguage == null) {
      if ('LanguageDetector' in self) {
        logger.debug('LanguageDetector is available')
      } else {
        logger.debug('LanguageDetector is not available')
        return null
      }
      const availability = await LanguageDetector.availability()

      let detector
      if (availability === 'unavailable') {
        return null
      }
      if (availability === 'available') {
        // The language detector can immediately be used.
        detector = await LanguageDetector.create()
      } else {
        // The language detector can be used after model download.
        detector = await LanguageDetector.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              logger.debug(`LanguageDetector Downloaded ${e.loaded * 100}%`)
            })
          }
        })
        await detector.ready
      }

      const results = await detector.detect(text)
      for (const result of results) {
        // Show the full list of potential languages with their likelihood, ranked
        // from most likely to least likely. In practice, one would pick the top
        // language(s) that cross a high enough threshold.
        logger.debug(`${result.detectedLanguage} ${result.confidence}`)
        options.sourceLanguage = result.detectedLanguage
        break
      }
    }

    if (options.targetLanguage == null) {
      // Get browser language, fallback to 'en' if not available
      const browserLang = navigator.language || navigator.languages?.[0] || 'en'
      // Get the primary language code (e.g., 'en' from 'en-US')
      options.targetLanguage = browserLang.split('-')[0]
    }

    logger.debug(`Source language: ${options.sourceLanguage} target language: ${options.targetLanguage}`)
    if (options.sourceLanguage == null || options.targetLanguage == null) {
      return null
    }

    try {
      const translator = await Translator.create({
        sourceLanguage: options.sourceLanguage,
        targetLanguage: options.targetLanguage,
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            logger.debug(`Translator Downloaded ${e.loaded * 100}% `)
          })
        }
      })

      const result = await translator.translate(text)
      logger.debug(`Translation result: ${result}`)
      return result
    } catch (error) {
      logger.error('Translation error:', error)
      return null
    }
  }
}
