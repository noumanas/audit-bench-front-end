import { PageLoader } from '@/components/motion/PageLoader';

// Shown while a page that renders on the server (e.g. a shared scan report) loads.
export default function Loading() {
  return <PageLoader />;
}
