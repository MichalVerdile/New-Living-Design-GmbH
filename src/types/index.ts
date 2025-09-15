export interface NavigationItem {
  name: string;
  href: string;
  active?: boolean;
}

export interface HeaderProps {
  className?: string;
  navigationItems?: NavigationItem[];
}

export interface FooterProps {
  className?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
}
