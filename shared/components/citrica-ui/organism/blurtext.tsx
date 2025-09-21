"use client"
import React, { useEffect, useRef, useState } from 'react';

interface BlurTextProps {
  children: React.ReactNode;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom" | "left" | "right";
  className?: string;
  animationSpeed?: number; // tiempo entre cada elemento (ms)
  onAnimationComplete?: () => void;
}

const BlurText: React.FC<BlurTextProps> = ({
  children,
  delay = 200,
  animateBy = "words",
  direction = "top",
  className = "",
  animationSpeed = 150, // más lento por defecto
  onAnimationComplete = () => {}
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const variants: Record<string, string> = {
    top: "translate-y-4",
    bottom: "translate-y-[-16px]",
    left: "translate-x-4",
    right: "translate-x-[-16px]"
  };

  // Extraer el texto del children si es un componente Text
  const extractText = (child: React.ReactNode): string => {
    if (typeof child === 'string') return child;
    if (React.isValidElement(child) && child.props.children) {
      if (typeof child.props.children === 'string') {
        return child.props.children;
      }
    }
    return '';
  };

  const text = extractText(children);
  const textArray: string[] = animateBy === "words" ? text.split(" ") : text.split("");

  // Clonar el children y reemplazar el texto con la versión animada
  const renderAnimatedChildren = () => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        children: (
          <>
            {textArray.map((char: string, i: number) => (
              <span
                key={i}
                className={`inline-block transition-all duration-500 ease-out ${
                  inView 
                    ? "blur-0 opacity-100 translate-y-0 translate-x-0" 
                    : `blur-sm opacity-0 ${variants[direction]}`
                }`}
                style={{
                  transitionDelay: inView ? `${delay + i * animationSpeed}ms` : "0ms"
                }}
                onTransitionEnd={() => {
                  if (i === textArray.length - 1 && inView) {
                    onAnimationComplete();
                  }
                }}
              >
                {char}
                {animateBy === "words" && i < textArray.length - 1 ? "\u00A0" : ""}
              </span>
            ))}
          </>
        )
      });
    }
    return children;
  };

  return (
    <div ref={ref} className={`${className}`}>
      {renderAnimatedChildren()}
    </div>
  );
};

export default BlurText;