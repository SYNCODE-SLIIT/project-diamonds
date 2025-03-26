import React from 'react';
import PackageList from '../../components/PackageList';

const PackageManager = () => {
  return (
    <div className="PackageManager">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Dance Performance Package Manager</h1>
        </div>
      </header>
      
      <main className="container mx-auto py-8">
        <PackageList />
      </main>
      
      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          &copy; {new Date().getFullYear()} Dance Performance Package Manager
        </div>
      </footer>
    </div>
  );
};

export default PackageManager;