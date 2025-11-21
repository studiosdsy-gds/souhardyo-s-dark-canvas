import { useEffect } from 'react';
import { jelly } from 'ldrs';

interface LoaderProps {
  color?: string;
  size?: string;
}

export default function GlobalLoader({ color = "#7c3aed", size = "60" }: LoaderProps) {
  useEffect(() => {
    // Register the web component on mount
    jelly.register();
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]">
     
      <l-jelly
        size={size}
        speed="0.9"
        color={color} 
      ></l-jelly>
    </div>
  );
}