import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
        電商人像攝影棚 v3.0
      </h1>
      <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
        專為電商產業所設計，一鍵生成專業人像攝影照
      </p>
    </header>
  );
};

export default Header;