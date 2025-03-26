import React from 'react';
import { getInitials } from '../../utils/helper.js';

const CharAvatar = ({ fullName = '', width = 'w-12', height = 'h-12', style = '' }) => {
  return (
    <div
      className={`${width} ${height} ${style} flex items-center justify-center rounded-full text-gray-900 font-medium bg-gray-200`}
    >
      {getInitials(fullName || "")}
    </div>
  );
};

export default CharAvatar;
