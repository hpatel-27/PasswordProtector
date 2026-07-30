import { Link } from 'react-router-dom';

const logo = '/images/managerlogomedium.png';

// Shared top bar. Pass `to` to make the brand a link; `children` renders on the
// right side of the bar.
export default function PageHeader({ to, children }) {
  const brand = (
    <span className="inline-flex items-center gap-2.5 text-[1.05rem] font-bold text-slate-900">
      <img src={logo} alt="" className="h-8 w-auto" />
      Password Protector
    </span>
  );

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      {to ? (
        <Link to={to} className="hover:no-underline">
          {brand}
        </Link>
      ) : (
        brand
      )}
      {children}
    </header>
  );
}
