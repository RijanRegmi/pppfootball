import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-carbon-100 dark:bg-carbon-800 flex items-center justify-center mb-6">
        <span className="text-3xl">⚽</span>
      </div>
      <h1 className="text-2xl font-extrabold text-carbon-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-sm text-carbon-500 dark:text-carbon-400 font-medium mb-6 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-pitch-600 hover:bg-pitch-700 text-white font-bold text-sm rounded-xl transition-all duration-200 no-underline"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
