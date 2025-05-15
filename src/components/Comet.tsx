interface CometProps {
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
}

const Comet = ({ x, y, color, size, duration }: CometProps) => {
  return (
    <div
      className="absolute animate-comet"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 2}px ${color}`,
        animation: `comet ${duration}s linear infinite`
      }}
    />
  );
};

export default Comet; 