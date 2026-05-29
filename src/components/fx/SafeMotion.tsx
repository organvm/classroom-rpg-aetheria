/**
 * SafeMotion Components
 *
 * Reusable motion wrapper components that automatically respect the user's
 * reduced motion preferences. These components provide a consistent way to
 * add Framer Motion animations throughout the application while ensuring
 * accessibility compliance.
 *
 * When reduced motion is preferred:
 * - All animation props (animate, initial, exit, transition, variants, etc.) are stripped
 * - Components render as static HTML elements
 * - No motion.* components are used
 *
 * When animations are allowed:
 * - Full Framer Motion functionality is available
 * - All motion props are passed through unchanged
 *
 * @example
 * // Basic usage
 * <SafeMotionDiv
 *   initial={{ opacity: 0 }}
 *   animate={{ opacity: 1 }}
 *   className="my-class"
 * >
 *   Content
 * </SafeMotionDiv>
 *
 * @example
 * // With generic SafeMotion component
 * <SafeMotion
 *   as="section"
 *   initial={{ y: 20 }}
 *   animate={{ y: 0 }}
 * >
 *   Section content
 * </SafeMotion>
 */

import { motion, HTMLMotionProps } from 'framer-motion'
import { forwardRef, ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * List of motion-specific props that should be stripped when rendering
 * static elements for reduced motion preference.
 */
const MOTION_PROPS = [
  'animate',
  'initial',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileInView',
  'whileDrag',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'dragTransition',
  'dragPropagation',
  'dragControls',
  'dragSnapToOrigin',
  'dragDirectionLock',
  'onDrag',
  'onDragStart',
  'onDragEnd',
  'onDirectionLock',
  'onDragTransitionEnd',
  'layout',
  'layoutId',
  'layoutDependency',
  'layoutScroll',
  'onLayoutAnimationStart',
  'onLayoutAnimationComplete',
  'onViewportEnter',
  'onViewportLeave',
  'viewport',
  'custom',
  'inherit',
  'onAnimationStart',
  'onAnimationComplete',
  'onUpdate',
  'transformTemplate',
  'style', // Motion style can contain MotionValues
] as const

/**
 * Strips motion-specific props from the props object, returning only
 * standard HTML/React props suitable for static elements.
 */
function stripMotionProps<T extends Record<string, unknown>>(
  props: T
): Omit<T, (typeof MOTION_PROPS)[number]> {
  const result = { ...props }
  for (const prop of MOTION_PROPS) {
    delete (result as Record<string, unknown>)[prop]
  }
  return result as Omit<T, (typeof MOTION_PROPS)[number]>
}

/**
 * SafeMotionDiv - A motion.div wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionDiv
 *   initial={{ opacity: 0, y: 20 }}
 *   animate={{ opacity: 1, y: 0 }}
 *   transition={{ duration: 0.3 }}
 *   className="card"
 * >
 *   Card content
 * </SafeMotionDiv>
 */
export const SafeMotionDiv = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  function SafeMotionDiv({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <div ref={ref} {...(staticProps as ComponentPropsWithoutRef<'div'>)}>
          {children as ReactNode}
        </div>
      )
    }

    return (
      <motion.div ref={ref} {...props}>
        {children}
      </motion.div>
    )
  }
)

/**
 * SafeMotionSpan - A motion.span wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionSpan
 *   animate={{ scale: [1, 1.2, 1] }}
 *   transition={{ repeat: Infinity }}
 * >
 *   Pulsing text
 * </SafeMotionSpan>
 */
export const SafeMotionSpan = forwardRef<HTMLSpanElement, HTMLMotionProps<'span'>>(
  function SafeMotionSpan({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <span ref={ref} {...(staticProps as ComponentPropsWithoutRef<'span'>)}>
          {children as ReactNode}
        </span>
      )
    }

    return (
      <motion.span ref={ref} {...props}>
        {children}
      </motion.span>
    )
  }
)

/**
 * SafeMotionButton - A motion.button wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionButton
 *   whileHover={{ scale: 1.05 }}
 *   whileTap={{ scale: 0.95 }}
 *   onClick={handleClick}
 * >
 *   Click me
 * </SafeMotionButton>
 */
export const SafeMotionButton = forwardRef<HTMLButtonElement, HTMLMotionProps<'button'>>(
  function SafeMotionButton({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <button ref={ref} {...(staticProps as ComponentPropsWithoutRef<'button'>)}>
          {children as ReactNode}
        </button>
      )
    }

    return (
      <motion.button ref={ref} {...props}>
        {children}
      </motion.button>
    )
  }
)

/**
 * SafeMotionUl - A motion.ul wrapper that respects reduced motion preferences.
 * Useful for animated list containers.
 *
 * @example
 * <SafeMotionUl
 *   initial="hidden"
 *   animate="visible"
 *   variants={containerVariants}
 * >
 *   {items.map(item => <SafeMotionLi key={item.id} variants={itemVariants} />)}
 * </SafeMotionUl>
 */
export const SafeMotionUl = forwardRef<HTMLUListElement, HTMLMotionProps<'ul'>>(
  function SafeMotionUl({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <ul ref={ref} {...(staticProps as ComponentPropsWithoutRef<'ul'>)}>
          {children as ReactNode}
        </ul>
      )
    }

    return (
      <motion.ul ref={ref} {...props}>
        {children}
      </motion.ul>
    )
  }
)

/**
 * SafeMotionLi - A motion.li wrapper that respects reduced motion preferences.
 * Useful for animated list items.
 *
 * @example
 * <SafeMotionLi
 *   variants={itemVariants}
 *   initial="hidden"
 *   animate="visible"
 * >
 *   List item content
 * </SafeMotionLi>
 */
export const SafeMotionLi = forwardRef<HTMLLIElement, HTMLMotionProps<'li'>>(
  function SafeMotionLi({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <li ref={ref} {...(staticProps as ComponentPropsWithoutRef<'li'>)}>
          {children as ReactNode}
        </li>
      )
    }

    return (
      <motion.li ref={ref} {...props}>
        {children}
      </motion.li>
    )
  }
)

/**
 * SafeMotionNav - A motion.nav wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionNav
 *   initial={{ x: -100 }}
 *   animate={{ x: 0 }}
 * >
 *   Navigation content
 * </SafeMotionNav>
 */
export const SafeMotionNav = forwardRef<HTMLElement, HTMLMotionProps<'nav'>>(
  function SafeMotionNav({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <nav ref={ref} {...(staticProps as ComponentPropsWithoutRef<'nav'>)}>
          {children as ReactNode}
        </nav>
      )
    }

    return (
      <motion.nav ref={ref} {...props}>
        {children}
      </motion.nav>
    )
  }
)

/**
 * SafeMotionSection - A motion.section wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionSection
 *   initial={{ opacity: 0 }}
 *   whileInView={{ opacity: 1 }}
 *   viewport={{ once: true }}
 * >
 *   Section content
 * </SafeMotionSection>
 */
export const SafeMotionSection = forwardRef<HTMLElement, HTMLMotionProps<'section'>>(
  function SafeMotionSection({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <section ref={ref} {...(staticProps as ComponentPropsWithoutRef<'section'>)}>
          {children as ReactNode}
        </section>
      )
    }

    return (
      <motion.section ref={ref} {...props}>
        {children}
      </motion.section>
    )
  }
)

/**
 * SafeMotionArticle - A motion.article wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionArticle
 *   initial={{ opacity: 0, y: 50 }}
 *   animate={{ opacity: 1, y: 0 }}
 * >
 *   Article content
 * </SafeMotionArticle>
 */
export const SafeMotionArticle = forwardRef<HTMLElement, HTMLMotionProps<'article'>>(
  function SafeMotionArticle({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <article ref={ref} {...(staticProps as ComponentPropsWithoutRef<'article'>)}>
          {children as ReactNode}
        </article>
      )
    }

    return (
      <motion.article ref={ref} {...props}>
        {children}
      </motion.article>
    )
  }
)

/**
 * SafeMotionHeader - A motion.header wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionHeader
 *   initial={{ y: -100 }}
 *   animate={{ y: 0 }}
 *   transition={{ type: 'spring' }}
 * >
 *   Header content
 * </SafeMotionHeader>
 */
export const SafeMotionHeader = forwardRef<HTMLElement, HTMLMotionProps<'header'>>(
  function SafeMotionHeader({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <header ref={ref} {...(staticProps as ComponentPropsWithoutRef<'header'>)}>
          {children as ReactNode}
        </header>
      )
    }

    return (
      <motion.header ref={ref} {...props}>
        {children}
      </motion.header>
    )
  }
)

/**
 * SafeMotionFooter - A motion.footer wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionFooter
 *   initial={{ opacity: 0 }}
 *   animate={{ opacity: 1 }}
 * >
 *   Footer content
 * </SafeMotionFooter>
 */
export const SafeMotionFooter = forwardRef<HTMLElement, HTMLMotionProps<'footer'>>(
  function SafeMotionFooter({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <footer ref={ref} {...(staticProps as ComponentPropsWithoutRef<'footer'>)}>
          {children as ReactNode}
        </footer>
      )
    }

    return (
      <motion.footer ref={ref} {...props}>
        {children}
      </motion.footer>
    )
  }
)

/**
 * SafeMotionP - A motion.p wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionP
 *   initial={{ opacity: 0 }}
 *   animate={{ opacity: 1 }}
 *   transition={{ delay: 0.2 }}
 * >
 *   Paragraph text
 * </SafeMotionP>
 */
export const SafeMotionP = forwardRef<HTMLParagraphElement, HTMLMotionProps<'p'>>(
  function SafeMotionP({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <p ref={ref} {...(staticProps as ComponentPropsWithoutRef<'p'>)}>
          {children as ReactNode}
        </p>
      )
    }

    return (
      <motion.p ref={ref} {...props}>
        {children}
      </motion.p>
    )
  }
)

/**
 * SafeMotionH1 - A motion.h1 wrapper that respects reduced motion preferences.
 */
export const SafeMotionH1 = forwardRef<HTMLHeadingElement, HTMLMotionProps<'h1'>>(
  function SafeMotionH1({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <h1 ref={ref} {...(staticProps as ComponentPropsWithoutRef<'h1'>)}>
          {children as ReactNode}
        </h1>
      )
    }

    return (
      <motion.h1 ref={ref} {...props}>
        {children}
      </motion.h1>
    )
  }
)

/**
 * SafeMotionH2 - A motion.h2 wrapper that respects reduced motion preferences.
 */
export const SafeMotionH2 = forwardRef<HTMLHeadingElement, HTMLMotionProps<'h2'>>(
  function SafeMotionH2({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <h2 ref={ref} {...(staticProps as ComponentPropsWithoutRef<'h2'>)}>
          {children as ReactNode}
        </h2>
      )
    }

    return (
      <motion.h2 ref={ref} {...props}>
        {children}
      </motion.h2>
    )
  }
)

/**
 * SafeMotionH3 - A motion.h3 wrapper that respects reduced motion preferences.
 */
export const SafeMotionH3 = forwardRef<HTMLHeadingElement, HTMLMotionProps<'h3'>>(
  function SafeMotionH3({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <h3 ref={ref} {...(staticProps as ComponentPropsWithoutRef<'h3'>)}>
          {children as ReactNode}
        </h3>
      )
    }

    return (
      <motion.h3 ref={ref} {...props}>
        {children}
      </motion.h3>
    )
  }
)

/**
 * SafeMotionA - A motion.a wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionA
 *   href="/link"
 *   whileHover={{ scale: 1.05 }}
 * >
 *   Link text
 * </SafeMotionA>
 */
export const SafeMotionA = forwardRef<HTMLAnchorElement, HTMLMotionProps<'a'>>(
  function SafeMotionA({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <a ref={ref} {...(staticProps as ComponentPropsWithoutRef<'a'>)}>
          {children as ReactNode}
        </a>
      )
    }

    return (
      <motion.a ref={ref} {...props}>
        {children}
      </motion.a>
    )
  }
)

/**
 * SafeMotionImg - A motion.img wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionImg
 *   src="/image.jpg"
 *   alt="Description"
 *   whileHover={{ scale: 1.1 }}
 * />
 */
export const SafeMotionImg = forwardRef<HTMLImageElement, HTMLMotionProps<'img'>>(
  function SafeMotionImg(props, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return <img ref={ref} {...(staticProps as ComponentPropsWithoutRef<'img'>)} />
    }

    return <motion.img ref={ref} {...props} />
  }
)

/**
 * SafeMotionForm - A motion.form wrapper that respects reduced motion preferences.
 *
 * @example
 * <SafeMotionForm
 *   initial={{ opacity: 0 }}
 *   animate={{ opacity: 1 }}
 *   onSubmit={handleSubmit}
 * >
 *   Form content
 * </SafeMotionForm>
 */
export const SafeMotionForm = forwardRef<HTMLFormElement, HTMLMotionProps<'form'>>(
  function SafeMotionForm({ children, ...props }, ref) {
    const shouldReduceMotion = useReducedMotion()

    if (shouldReduceMotion) {
      const staticProps = stripMotionProps(props)
      return (
        <form ref={ref} {...(staticProps as ComponentPropsWithoutRef<'form'>)}>
          {children as ReactNode}
        </form>
      )
    }

    return (
      <motion.form ref={ref} {...props}>
        {children}
      </motion.form>
    )
  }
)

/**
 * Supported element types for the generic SafeMotion component.
 */
type SafeMotionElement =
  | 'div'
  | 'span'
  | 'button'
  | 'ul'
  | 'li'
  | 'nav'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'a'
  | 'img'
  | 'form'
  | 'main'
  | 'aside'
  | 'label'
  | 'input'
  | 'textarea'

/**
 * Props for the generic SafeMotion component.
 */
type SafeMotionProps<T extends SafeMotionElement> = {
  /** The HTML element type to render */
  as: T
  /** Content to render inside the element */
  children?: ReactNode
} & HTMLMotionProps<T>

/**
 * Generic SafeMotion component that can render as any supported HTML element.
 * Automatically respects reduced motion preferences.
 *
 * @example
 * <SafeMotion
 *   as="section"
 *   initial={{ opacity: 0 }}
 *   animate={{ opacity: 1 }}
 *   className="my-section"
 * >
 *   Section content
 * </SafeMotion>
 *
 * @example
 * <SafeMotion
 *   as="main"
 *   initial={{ y: 20 }}
 *   animate={{ y: 0 }}
 * >
 *   Main content
 * </SafeMotion>
 */
export function SafeMotion<T extends SafeMotionElement>({
  as,
  children,
  ...props
}: SafeMotionProps<T>) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    const staticProps = stripMotionProps(props as Record<string, unknown>)
    const Element = as as ElementType
    return <Element {...staticProps}>{children}</Element>
  }

  // Get the motion component for the specified element type
  const MotionComponent = motion[as] as typeof motion.div
  return <MotionComponent {...(props as HTMLMotionProps<'div'>)}>{children}</MotionComponent>
}
