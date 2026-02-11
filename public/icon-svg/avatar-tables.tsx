import React from 'react'

interface AvatarTablesProps {
  color?: string;
  size?: number;
}

export const AvatarTables: React.FC<AvatarTablesProps> = ({ color = "#D09AFB", size = 47 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
      <mask id={`avatar-mask-${color.replace('#', '')}`} style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="47" height="47">
        <circle cx="23.0184" cy="23.0184" r="23.0184" fill="#CCCCCC"/>
      </mask>
      <g mask={`url(#avatar-mask-${color.replace('#', '')})`}>
        <circle cx="23.0181" cy="23.1237" r="22.7981" stroke={color} strokeWidth="4"/>
        <path d="M31.9691 16.0608C31.9691 21.0041 27.9618 25.0114 23.0185 25.0114C18.0753 25.0114 14.0679 21.0041 14.0679 16.0608C14.0679 11.1176 18.0753 7.11023 23.0185 7.11023C27.9618 7.11023 31.9691 11.1176 31.9691 16.0608Z" fill={color}/>
        <path d="M46.4927 51.0748C46.4927 64.0392 35.9829 74.5489 23.0185 74.5489C10.0542 74.5489 -0.455566 64.0392 -0.455566 51.0748C-0.455566 38.1104 10.0542 27.6007 23.0185 27.6007C35.9829 27.6007 46.4927 38.1104 46.4927 51.0748Z" fill={color}/>
      </g>
    </svg>
  )
}