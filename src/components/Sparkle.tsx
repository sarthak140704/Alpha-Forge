interface SparkleProps {
  x: number;
  y: number;
  color: string;
  size: number;
}

const Sparkle = ({ x, y, color, size }: SparkleProps) => {
  return (
    <div
      className="absolute animate-pulse"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 2}px ${color}`
      }}
    />
  );
};

export default Sparkle; 