// components/ui/card.jsx

export function Card({ children, className }) {
    return (
      <div className={`bg-white rounded-2xl p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children, className }) {
    return (
      <div className={`${className}`}>
        {children}
      </div>
    );
  }
  