import React from 'react';
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { getCSSVariable } from '@/shared/utils/general';

// Define the type for all available Lucide icons
export type IconName = keyof typeof LucideIcons;

interface IconProps extends LucideProps {
  name: IconName | string; // Permitir tanto IconName como string
  size?: number;
  strokeWidth?: number;
  color?: string;
  fallback?: IconName;
}

// EDIT HERE
const DEFAULT_SIZE = 20;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_FALLBACK: IconName = 'AlertCircle';

const Icon = ({ 
    name, 
    size = DEFAULT_SIZE, 
    strokeWidth = DEFAULT_STROKE_WIDTH, 
    fallback = DEFAULT_FALLBACK,
    ...props }: IconProps): JSX.Element => {
  
  // Intentar obtener el componente del icono
  const IconComponent = LucideIcons[name as IconName] || LucideIcons[fallback];

  // Ensure IconComponent is treated as a valid React component
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found, using fallback "${fallback}"`);
    const FallbackComponent = LucideIcons[fallback];
    return React.createElement(FallbackComponent as React.ComponentType<LucideProps>, { size, strokeWidth, ...props });
  }

  // Return the icon with all props passed through
  return React.createElement(IconComponent as React.ComponentType<LucideProps>, { size, strokeWidth, ...props });
};

export default Icon;
