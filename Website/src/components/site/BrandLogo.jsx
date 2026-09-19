import approvedLinkLogo from '@/assets/link-marketing-services-logo-opaque.jpg';

export default function BrandLogo({ className = '' }) {
  return (
    <img
      src={approvedLinkLogo}
      alt="Link Marketing Services"
      width="900"
      height="314"
      className={`block shrink-0 object-contain ${className}`}
      draggable="false"
    />
  );
}
