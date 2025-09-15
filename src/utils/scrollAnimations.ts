// Scroll Animation Utilities
export class ScrollAnimations {
  private observer: IntersectionObserver;
  private elements: Set<Element> = new Set();

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // Add visible class for main element
        element.classList.add('visible');
        
        // Handle staggered animations for child elements
        const staggerItems = element.querySelectorAll('.stagger-item');
        staggerItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 100);
        });

        // Handle individual text elements
        const textElements = element.querySelectorAll('.category-title, .category-description, .category-description p');
        textElements.forEach((textEl, index) => {
          setTimeout(() => {
            textEl.classList.add('visible');
          }, index * 200);
        });

        // Stop observing once animated
        this.observer.unobserve(element);
        this.elements.delete(element);
      }
    });
  }

  public observeElement(element: Element) {
    if (element && !this.elements.has(element)) {
      this.elements.add(element);
      this.observer.observe(element);
    }
  }

  public observeElements(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => this.observeElement(element));
  }

  public destroy() {
    this.observer.disconnect();
    this.elements.clear();
  }
}

// Parallax effect for elements
export class ParallaxEffect {
  private elements: { element: Element; speed: number }[] = [];

  constructor() {
    this.bindEvents();
  }

  private bindEvents() {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  private updateParallax() {
    const scrollTop = window.pageYOffset;

    this.elements.forEach(({ element, speed }) => {
      const rect = element.getBoundingClientRect();
      const elementTop = rect.top + scrollTop;
      const elementHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Only apply parallax when element is in viewport
      if (rect.bottom >= 0 && rect.top <= windowHeight) {
        const progress = (scrollTop - elementTop + windowHeight) / (windowHeight + elementHeight);
        const yPos = progress * speed * 100;
        
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      }
    });
  }

  public addElement(element: Element, speed: number = 0.5) {
    this.elements.push({ element, speed });
  }
}

// Smooth reveal on scroll
export class SmoothReveal {
  private observer: IntersectionObserver;

  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.classList.add('visible');
            
            // Add special effects based on data attributes
            const effect = element.getAttribute('data-reveal-effect');
            if (effect) {
              element.classList.add(`reveal-${effect}`);
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      }
    );
  }

  public observe(selector: string) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      this.observer.observe(element);
    });
  }
}

// Counter animation for numbers
export class CounterAnimation {
  static animateCounter(element: Element, finalValue: number, duration: number = 2000) {
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (finalValue - startValue) * easeOut);
      
      element.textContent = currentValue.toString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalValue.toString();
      }
    };

    requestAnimationFrame(animate);
  }
}

// Enhanced hover effects
export class EnhancedHover {
  static init() {
    const hoverElements = document.querySelectorAll('.interactive-hover');
    
    hoverElements.forEach((element) => {
      element.addEventListener('mouseenter', (e) => {
        const target = e.target as HTMLElement;
        target.style.transform = 'translateY(-8px) scale(1.02)';
      });

      element.addEventListener('mouseleave', (e) => {
        const target = e.target as HTMLElement;
        target.style.transform = 'translateY(0) scale(1)';
      });
    });
  }
}

// Text typing animation
export class TypewriterEffect {
  static async typeText(element: Element, text: string, speed: number = 50) {
    element.textContent = '';
    
    for (let i = 0; i <= text.length; i++) {
      element.textContent = text.slice(0, i);
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }
}
