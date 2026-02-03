'use client';

import React from 'react';
import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export default function Card({ children, className = '', onClick, href }: CardProps) {
  const baseStyles = `
    bg-white rounded-2xl shadow-sm border border-gray-100
    transition-all duration-200
    ${onClick || href ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick} className={baseStyles}>
        {children}
      </div>
    );
  }

  return <div className={baseStyles}>{children}</div>;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-4 md:p-6 ${className}`}>{children}</div>;
}

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  bgColor?: string;
  iconBgColor?: string;
}

export function DashboardCard({
  icon,
  label,
  href,
  bgColor = 'bg-amber-50',
  iconBgColor = 'bg-pink-100',
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className={`
        ${bgColor} rounded-2xl p-6 flex flex-col items-center justify-center gap-3
        transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        min-h-[140px]
      `}
    >
      <div className={`${iconBgColor} w-14 h-14 rounded-full flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  );
}
