import { Button } from './ui/button';
import { Search } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-16 text-center lg:py-24">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Find the perfect{' '}
            <span className="text-green-600">freelance services</span>
            <br />
            for your business
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-500">
            Connect with talented freelancers and get your projects done quickly and efficiently.
          </p>
          <div className="mt-8 flex w-full max-w-2xl items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Try 'logo design' or 'wordpress development'"
                className="w-full rounded-l-md border border-r-0 border-gray-300 py-3 pl-10 pr-3 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <Button className="rounded-l-none py-3" size="lg">
              Search
            </Button>
          </div>
          <div className="mt-6 flex items-center space-x-4 text-sm">
            <span className="text-gray-500">Popular:</span>
            {['Website Design', 'WordPress', 'Logo Design', 'AI Services'].map((tag) => (
              <Button key={tag} variant="outline" size="sm">
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
