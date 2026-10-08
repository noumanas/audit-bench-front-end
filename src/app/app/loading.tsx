import { PageLoader } from '@/components/motion/PageLoader';

// Inside the app the sidebar stays; only the content column shows this.
export default function AppLoading() {
  return <PageLoader />;
}
