import dynamic from 'next/dynamic';

const MockIDE = dynamic(() => import('@/components/MockIDE'), { ssr: false });

export default function MockIDEPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">DevGenius Mock IDE</h1>
      <MockIDE />
    </div>
  );
}