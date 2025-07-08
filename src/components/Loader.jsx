import { Loader as LoaderIcon } from 'lucide-react';

const Loader = ({ className = '', size = 32, text = 'Cargando...' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <LoaderIcon 
        size={size} 
        className="animate-spin text-orange-500" 
      />
      {text && <span className="text-sm text-gray-500">{text}</span>}
    </div>
  );
};

export default Loader;