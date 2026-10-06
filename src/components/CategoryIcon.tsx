import React from 'react';
import {
  Briefcase,
  TrendingUp,
  Laptop,
  Store,
  Coins,
  Home,
  ShoppingCart,
  Car,
  HeartPulse,
  Utensils,
  GraduationCap,
  Zap,
  Tv,
  Shirt,
  FileText,
  Tag,
  CreditCard,
  Building,
} from 'lucide-react';

interface CategoryIconProps {
  iconName: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconName, className = 'w-5 h-5', color }) => {
  const iconProps = {
    className,
    style: color ? { color } : undefined,
  };

  switch (iconName) {
    case 'Briefcase':
      return <Briefcase {...iconProps} />;
    case 'TrendingUp':
      return <TrendingUp {...iconProps} />;
    case 'Laptop':
      return <Laptop {...iconProps} />;
    case 'Store':
      return <Store {...iconProps} />;
    case 'Coins':
      return <Coins {...iconProps} />;
    case 'Home':
      return <Home {...iconProps} />;
    case 'ShoppingCart':
      return <ShoppingCart {...iconProps} />;
    case 'Car':
      return <Car {...iconProps} />;
    case 'HeartPulse':
      return <HeartPulse {...iconProps} />;
    case 'Utensils':
      return <Utensils {...iconProps} />;
    case 'GraduationCap':
      return <GraduationCap {...iconProps} />;
    case 'Zap':
      return <Zap {...iconProps} />;
    case 'Tv':
      return <Tv {...iconProps} />;
    case 'Shirt':
      return <Shirt {...iconProps} />;
    case 'FileText':
      return <FileText {...iconProps} />;
    case 'CreditCard':
      return <CreditCard {...iconProps} />;
    case 'Building':
      return <Building {...iconProps} />;
    default:
      return <Tag {...iconProps} />;
  }
};
