import ServicesPage from '@/views/ServicesPage';
import { fetchServicesServer } from '@/services/publicData.service';

export default async function ServicesRoute() {
  const services = await fetchServicesServer();

  return (
    <><ServicesPage initialServices={services} />
    </>
  );
}
