'use client'

interface AnnouncementBanner {
  text: string
  linkText: string
  linkHref: string
}

interface CallToAction {
  text: string
  href: string
  variant: 'primary' | 'secondary'
}

interface HeroLandingProps {
  title: string | React.ReactNode
  description: string | React.ReactNode
  announcementBanner?: AnnouncementBanner
  callToActions?: CallToAction[]
  titleSize?: 'small' | 'medium' | 'large'
  gradientColors?: {
    from: string
    to: string
  }
  className?: string
}

const defaultProps: Partial<HeroLandingProps> = {
  titleSize: "large",
  gradientColors: {
    from: "oklch(0.646 0.222 41.116)",
    to: "oklch(0.488 0.243 264.376)"
  },
  callToActions: [
    { text: "Get started", href: "#", variant: "primary" },
    { text: "Learn more", href: "#", variant: "secondary" }
  ]
}

export function HeroLanding(props: HeroLandingProps) {
  const {
    title,
    description,
    announcementBanner,
    callToActions,
    titleSize,
    gradientColors,
    className
  } = { ...defaultProps, ...props }

  const getTitleSizeClasses = () => {
    switch (titleSize) {
      case 'small':
        return 'text-2xl sm:text-3xl md:text-5xl'
      case 'medium':
        return 'text-2xl sm:text-4xl md:text-6xl'
      case 'large':
      default:
        return 'text-5xl sm:text-6xl md:text-7xl'
    }
  }

  const renderCallToAction = (cta: CallToAction, index: number) => {
    if (cta.variant === 'primary') {
      return (
        <a
          key={index}
          href={cta.href}
          className="rounded-full bg-white px-8 py-4 text-[12px] font-black uppercase tracking-widest text-zinc-950 shadow-sm hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
        >
          {cta.text}
        </a>
      )
    } else {
      return (
        <a
          key={index}
          href={cta.href}
          className="rounded-full border border-white/[0.20] px-8 py-4 text-[12px] font-semibold uppercase tracking-widest text-zinc-300 backdrop-blur-sm hover:border-white/[0.45] hover:text-white transition-colors"
        >
          {cta.text}
        </a>
      )
    }
  }

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden bg-[#09090b] ${className || ''}`}>
      {/* Top gradient background */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 z-0 transform-gpu overflow-hidden blur-3xl sm:-top-80 min-h-screen"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] min-h-screen"
        />
      </div>
      
      {/* Bottom gradient background */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] z-0 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] min-h-screen"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, ${gradientColors?.from}, ${gradientColors?.to})`
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] min-h-screen"
        />
      </div>

      <div className="relative isolate px-6 overflow-hidden min-h-screen flex flex-col justify-center z-10">        
        <div className="mx-auto max-w-4xl">
          {/* Announcement banner */}
          {announcementBanner && (
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-4 py-1.5 text-[10px] tracking-[0.2em] font-bold uppercase text-purple-400 ring-1 ring-purple-400/30 hover:ring-purple-400/60 bg-purple-400/5 transition-all flex items-center">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />
                {announcementBanner.text}{' '}
                <a href={announcementBanner.linkHref} className="font-bold text-purple-300 hover:text-purple-200 transition-colors ml-2">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {announcementBanner.linkText} <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <h1 
              className={`${getTitleSizeClasses()} font-playfair tracking-tight text-white leading-tight mb-5`}
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
            >
              {title}
            </h1>
            <p 
              className="mt-6 sm:mt-8 text-base md:text-lg leading-relaxed text-zinc-300 max-w-xl mx-auto"
              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
            >
              {description}
            </p>
            
            {/* Call to action buttons */}
            {callToActions && callToActions.length > 0 && (
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                {callToActions.map((cta, index) => renderCallToAction(cta, index))}
              </div>
            )}
            
            <p className="text-zinc-500 text-xs mt-6 tracking-wide">
              Gratis para siempre en el plan base · Sin tarjeta de crédito
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { HeroLandingProps, AnnouncementBanner, CallToAction }
