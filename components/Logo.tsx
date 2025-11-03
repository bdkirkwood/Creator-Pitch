import React from 'react';

const Logo: React.FC = () => {
  return (
    <>
      {/* Desktop Logo: Visible on md screens and up */}
      <div className="hidden md:flex items-center" aria-label="Creator Pitch Home">
        {/* Light Mode SVG Logo */}
        <svg
          width="140"
          height="36"
          viewBox="0 0 140 36"
          xmlns="http://www.w3.org/2000/svg"
          className="h-9 dark:hidden"
        >
          {/* Icon */}
          <path
            d="M18 6C24.6274 6 30 11.3726 30 18C30 24.6274 24.6274 30 18 30C11.3726 30 6 24.6274 6 18C6 11.3726 11.3726 6 18 6ZM18 10C13.5817 10 10 13.5817 10 18C10 22.4183 13.5817 26 18 26C22.4183 26 26 22.4183 26 18C26 13.5817 22.4183 10 18 10ZM18 3V0H15V3H18ZM18 33V36H21V33H18ZM6 15H0V21H6V15ZM30 15V21H36V15H30Z"
            className="fill-blue-500"
            fillRule="evenodd"
            clipRule="evenodd"
          />
          
          {/* "creator" text */}
          <text
            x="38"
            y="23"
            fontFamily="system-ui, sans-serif"
            fontSize="15"
            fontWeight="bold"
            className="fill-slate-800"
          >
            creator
          </text>
          
          {/* "pitch" part */}
          <rect x="96" y="9" width="44" height="18" rx="4" className="fill-blue-500" />
          <text
            x="101"
            y="23"
            fontFamily="system-ui, sans-serif"
            fontSize="15"
            fontWeight="bold"
            className="fill-white"
          >
            pitch
          </text>
        </svg>
        
        {/* Dark Mode Image Logo */}
        <img
          src="creator-pitch-io-horizontal.png"
          alt="Creator Pitch Logo"
          className="h-9 hidden dark:block"
        />
      </div>

      {/* Mobile Icon: Hidden on md screens and up */}
      <div className="block md:hidden" aria-label="Creator Pitch Home">
        <svg
          width="32"
          height="32"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <circle cx="20" cy="20" r="20" className="fill-blue-500" />
          <path
            d="M23.6 12.2C22.4 11.4 21 11 19.5 11C16.4 11 14 13.4 14 16.5C14 19.6 16.4 22 19.5 22C21 22 22.4 21.6 23.6 20.8L23.6 23.4C22.4 24.2 21 24.6 19.5 24.6C15.2 24.6 11.8 21 11.8 16.5C11.8 12 15.2 8.4 19.5 8.4C21 8.4 22.4 8.8 23.6 9.6L23.6 12.2Z"
            className="fill-white"
          />
          <path
            d="M28.2 20.8C27 21.6 25.6 22 24.1 22C21 22 18.6 19.6 18.6 16.5C18.6 13.4 21 11 24.1 11C25.6 11 27 11.4 28.2 12.2V15.5C28.2 16.1 27.7 16.6 27.1 16.6H24.8V19.4H27.1C27.7 19.4 28.2 19.9 28.2 20.5V20.8Z"
            className="fill-white"
            opacity="0.8"
          />
        </svg>
      </div>
    </>
  );
};

export default Logo;