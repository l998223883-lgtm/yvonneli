export default function IsoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="16,4 26,10 16,16 6,10" fill="#3D3D3D" />
      <polygon points="6,10 16,16 16,28 6,22" fill="#6B6B6B" />
      <polygon points="16,16 26,10 26,22 16,28" fill="#9A9A9A" />
    </svg>
  );
}
