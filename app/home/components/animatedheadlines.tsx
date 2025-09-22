import React, { useState, useEffect } from 'react';
import Text from '@ui/atoms/text';

// Tipos para el componente TextType
interface TextTypeProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  className?: string;
  onComplete?: () => void;
}

// Tipo para los headlines
interface Headline {
  prefix: string;
  highlight: string;
  suffix: string;
}

// Componente TextType basado en React Bits
const TextType: React.FC<TextTypeProps> = ({ 
  texts, 
  typingSpeed = 100, 
  deletingSpeed = 50, 
  pauseDuration = 2000,
  loop = true,
  showCursor = true,
  cursorChar = '|',
  className = '',
  onComplete
}) => {
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const targetText = texts[currentTextIndex];
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
    } else if (isDeleting) {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        if (loop || currentTextIndex < texts.length - 1) {
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        } else if (onComplete) {
          onComplete();
        }
      }
    } else {
      if (currentText.length < targetText.length) {
        timeout = setTimeout(() => {
          setCurrentText(targetText.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        setIsPaused(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, typingSpeed, deletingSpeed, pauseDuration, loop, onComplete]);

  return (
    <span className={className}>
      {currentText}
      {showCursor && (
        <span 
          className="animate-pulse"
          style={{ 
            animation: 'blink 1s infinite',
            marginLeft: '2px'
          }}
        >
          {cursorChar}
        </span>
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </span>
  );
};

// Componente principal con los titulares
const AnimatedHeadlines: React.FC = () => {
  const headlines: Headline[] = [
    {
      prefix: "Convertimos visitas en clientes con ",
      highlight: "Landing Pages de alto impacto",
      suffix: "."
    },
    {
      prefix: "Posicionamos tu marca y atraemos clientes con ",
      highlight: "Websites profesionales", 
      suffix: "."
    },
    {
      prefix: "Optimizamos tus procesos y mejoramos tu eficiencia con ",
      highlight: "Web Apps a la medida",
      suffix: "."
    },
    {
      prefix: "Fortalecemos tu marca y conectamos con tus clientes a través de ",
      highlight: "Mobile Apps",
      suffix: "."
    },
    {
      prefix: "",
      highlight: "Integramos IA",
      suffix: " para automatizar tu negocio y tomar mejores decisiones."
    }
  ];

  // Componente personalizado que maneje los colores
  const CustomTextType: React.FC = () => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
    const [currentText, setCurrentText] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    useEffect(() => {
      const currentHeadline = headlines[currentTextIndex];
      const targetText = currentHeadline.prefix + currentHeadline.highlight + currentHeadline.suffix;
      let timeout: NodeJS.Timeout;

      if (isPaused) {
        timeout = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, 3000); // 3 segundos de pausa
      } else if (isDeleting) {
        if (currentText.length > 0) {
          timeout = setTimeout(() => {
            setCurrentText(currentText.slice(0, -1));
          }, 30); // Velocidad de borrado
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % headlines.length);
        }
      } else {
        if (currentText.length < targetText.length) {
          timeout = setTimeout(() => {
            setCurrentText(targetText.slice(0, currentText.length + 1));
          }, 50); // Velocidad de escritura
        } else {
          setIsPaused(true);
        }
      }

      return () => clearTimeout(timeout);
    }, [currentText, currentTextIndex, isDeleting, isPaused]);

    // Función para renderizar el texto con colores
    const renderColoredText = (): React.ReactNode => {
      const currentHeadline = headlines[currentTextIndex];
      const prefixLength = currentHeadline.prefix.length;
      const highlightLength = currentHeadline.highlight.length;
      const suffixStart = prefixLength + highlightLength;
      
      const prefix = currentText.slice(0, prefixLength);
      const highlight = currentText.slice(prefixLength, suffixStart);
      const suffix = currentText.slice(suffixStart);

      return (
        <>
          <span style={{ color: "#FFFFFF" }}>{prefix}</span>
          <span style={{ color: "#FF5B00" }}>{highlight}</span>
          <span style={{ color: "#FFFFFF" }}>{suffix}</span>
        </>
      );
    };

    return (
      <span>
        {renderColoredText()}
        <span 
          className="cursor"
          style={{ 
            color: "#FF5B00", 
            animation: "blink 1s infinite",
            marginLeft: '2px'
          }}
        >
          |
        </span>
        <style jsx>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </span>
    );
  };

  return (
    <h2 className="text-balance mb-4">
      <div className="min-h-[120px] flex items-center">
        <Text variant="display" weight="bold" className="text-4xl md:text-5xl lg:text-6xl leading-tight">
          <CustomTextType />
        </Text>
      </div>
    </h2>
  );
};

export default AnimatedHeadlines;