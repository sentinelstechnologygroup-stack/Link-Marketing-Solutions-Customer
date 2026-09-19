import { useParams } from 'react-router-dom';
import { INDUSTRIES } from '@/components/site/industries';
import IndustryPage from '@/components/site/IndustryPage';
import PageNotFound from '@/lib/PageNotFound';

export default function IndustryDetail() {
  const { industry } = useParams();
  const data = INDUSTRIES.find((i) => i.slug === industry);
  if (!data) return <PageNotFound />;
  return <IndustryPage industry={data} />;
}