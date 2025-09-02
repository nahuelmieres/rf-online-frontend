import React from 'react';
import SmartLink from '../SmartLink/SmartLink';

const NavItem = ({ to, icon, text, onClick, children }) => {
  return (
    <div className="border-b-2 border-black dark:border-gray-600 last:border-0">
      <SmartLink
        to={to}
        onClick={onClick}
        className="flex items-center gap-4 py-5 px-6 text-xl hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5"
      >
        {icon}
        <span>{text}</span>
        {children && <span className="ml-auto">▼</span>}
      </SmartLink>
      {children && (
        <div className="bg-white dark:bg-black">
          {children}
        </div>
      )}
    </div>
  );
};

export default NavItem;