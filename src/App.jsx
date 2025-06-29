import React from 'react';
import ReactDOM from 'react-dom/client';
import Navbar from './components/Navbar';

const App = () => {
    return (
        <>
            <Navbar />
            <main className="p-4">
                <h1 className="text-2xl font-semibold">Bienvenido a RF Online</h1>
                <p className="mt-2 text-gray-600">Acá irán los contenidos según el usuario.</p>
            </main>
        </>
    );
};

export default App;