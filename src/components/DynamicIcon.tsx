import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 20, className = "" }) => {
  // Safe lookup for the icon component from Lucide
  const IconComponent = (Icons as any)[name];
  
  if (!IconComponent) {
    // Fallback icon
    return <Icons.File size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
};
