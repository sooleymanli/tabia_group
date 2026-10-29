import { cn } from '@/lib/utils'

const LOGO_URL = `url(${import.meta.env.BASE_URL}logo.svg)`

function maskStyle(size, position) {
  return {
    maskImage: LOGO_URL,
    WebkitMaskImage: LOGO_URL,
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskSize: size,
    WebkitMaskSize: size,
    maskPosition: position,
    WebkitMaskPosition: position,
  }
}

// Pass label={null} when the logo sits next to visible brand text.
function a11yProps(label) {
  return label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }
}

// Full company logo; colour comes from `currentColor` via the text colour class.
export function TabiaLogo({ className, label = 'Tabia' }) {
  return (
    <span
      {...a11yProps(label)}
      className={cn(
        'inline-block aspect-[101/115] bg-current forced-color-adjust-none',
        className,
      )}
      style={maskStyle('contain', 'center')}
    />
  )
}

// Ornament only: crops logo.svg to its 61×61 top region (x 20–81, y −0.9–60.1 of the 101×115 viewBox).
export function TabiaMark({ className, label = 'Tabia' }) {
  return (
    <span
      {...a11yProps(label)}
      className={cn(
        'inline-block aspect-square bg-current forced-color-adjust-none',
        className,
      )}
      style={maskStyle('165.57% 188.52%', '50% -1.667%')}
    />
  )
}
