import React from 'react';
import logoImg from '../assets/images/thakhantho_vase_logo.svg';

interface HospitalLogoProps {
  className?: string;
  alt?: string;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  className = 'w-10 h-10',
  alt = 'ตราสัญลักษณ์โรงพยาบาลท่าคันโท',
}) => {
  return (
    <img
      src={logoImg}
      alt={alt}
      className={`${className} object-contain aspect-square`}
      loading="eager"
    />
  );
};
